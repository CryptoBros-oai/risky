// ============================================================
// Game Engine — Core state machine for RISK: Reimagined
// Phases: setup → reinforce → attack → fortify → (next player) → reinforce → ...
// All mutations return a new GameState (immutable pattern).
// ============================================================

import type {
  GameState,
  GameConfig,
  Player,
  PlayerColor,
  Territory,
  TerritoryId,
  CombatResult,
  TerritoryCard,
  GamePhase,
} from "@risk/shared";
import { createTerritories, CONTINENTS, areAdjacent, getPlayerTerritories } from "./mapData.js";
import { resolveCombat, rollDice, maxAttackDice, maxDefendDice, isValidAttackDice, isValidDefendDice } from "./combat.js";
import { calculateReinforcements, cardSetBonus } from "./reinforcements.js";

// --------------- Config ---------------

export const DEFAULT_CONFIG: GameConfig = {
  minPlayers: 2,
  maxPlayers: 6,
  startingTroops: {
    2: 40,
    3: 35,
    4: 30,
    5: 25,
    6: 20,
  },
  progressiveCardBonus: true,
  battleMode: "classic",
  diplomacyEnabled: false,
  pactBreakDesertionRate: 0.07,
};

const PLAYER_COLORS: PlayerColor[] = ["red", "blue", "green", "yellow", "purple", "orange"];

// --------------- Card Deck ---------------

function createDeck(territoryIds: TerritoryId[]): TerritoryCard[] {
  const types: Array<"infantry" | "cavalry" | "artillery"> = ["infantry", "cavalry", "artillery"];
  const cards: TerritoryCard[] = territoryIds.map((tid, i) => ({
    id: `card-${tid}`,
    territoryId: tid,
    type: types[i % 3],
  }));

  // Add 2 wild cards
  cards.push({ id: "wild-1", territoryId: null, type: "wild" });
  cards.push({ id: "wild-2", territoryId: null, type: "wild" });

  return shuffle(cards);
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// --------------- Game Creation ---------------

export function createGame(
  playerNames: string[],
  config: GameConfig = DEFAULT_CONFIG,
): GameState {
  const playerCount = playerNames.length;
  if (playerCount < config.minPlayers || playerCount > config.maxPlayers) {
    throw new Error(
      `Player count ${playerCount} outside range [${config.minPlayers}, ${config.maxPlayers}]`,
    );
  }

  const players: Player[] = playerNames.map((name, i) => ({
    id: `player-${i}`,
    name,
    color: PLAYER_COLORS[i],
    reinforcements: 0,
    cards: [],
    isEliminated: false,
    territoryCount: 0,
  }));

  const territories = createTerritories();
  const territoryIds = Object.keys(territories) as TerritoryId[];
  const deck = createDeck(territoryIds);

  // Randomly distribute territories among players
  const shuffledIds = shuffle(territoryIds);
  shuffledIds.forEach((tid, i) => {
    const playerIndex = i % playerCount;
    territories[tid].ownerId = players[playerIndex].id;
    territories[tid].troops = 1;
  });

  // Update territory counts
  for (const player of players) {
    player.territoryCount = Object.values(territories).filter(
      (t) => t.ownerId === player.id,
    ).length;
  }

  // Calculate remaining troops to place during setup
  const startingTroops = config.startingTroops[playerCount] ?? 30;
  for (const player of players) {
    player.reinforcements = startingTroops - player.territoryCount;
  }

  return {
    id: `game-${Date.now()}`,
    phase: "setup",
    players,
    currentPlayerIndex: 0,
    turnNumber: 1,
    territories,
    continents: { ...CONTINENTS },
    deck,
    discardPile: [],
    cardSetsTradedIn: 0,
    hasConqueredThisTurn: false,
    winnerId: null,
    lastUpdated: Date.now(),
    activeBattle: null,
    pacts: [],
    battleMode: config.battleMode,
    aiPlayerIds: [],
  };
}

// --------------- Helpers ---------------

function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p, cards: [...p.cards] })),
    territories: Object.fromEntries(
      Object.entries(state.territories).map(([k, v]) => [
        k,
        { ...v, adjacentIds: [...v.adjacentIds] },
      ]),
    ) as Record<TerritoryId, Territory>,
    continents: { ...state.continents },
    deck: state.deck ? [...state.deck] : undefined,
    discardPile: state.discardPile ? [...state.discardPile] : undefined,
    pacts: state.pacts.map((p) => ({ ...p })),
    aiPlayerIds: [...state.aiPlayerIds],
    lastUpdated: Date.now(),
  };
}

function updateTerritoryCount(state: GameState): void {
  for (const player of state.players) {
    player.territoryCount = Object.values(state.territories).filter(
      (t) => t.ownerId === player.id,
    ).length;
  }
}

function advancePlayer(state: GameState): void {
  do {
    state.currentPlayerIndex =
      (state.currentPlayerIndex + 1) % state.players.length;
  } while (
    state.players[state.currentPlayerIndex].isEliminated &&
    state.players.some((p) => !p.isEliminated)
  );
}

function checkWinCondition(state: GameState): void {
  const alive = state.players.filter((p) => !p.isEliminated);
  if (alive.length === 1) {
    state.phase = "gameOver";
    state.winnerId = alive[0].id;
  }
}

// --------------- Phase: Setup ---------------
// Players place remaining initial troops one at a time on territories they own.

export function setupPlaceTroop(
  state: GameState,
  playerId: string,
  territoryId: TerritoryId,
): GameState {
  if (state.phase !== "setup") {
    throw new Error("Not in setup phase");
  }
  const next = cloneState(state);
  const player = next.players.find((p) => p.id === playerId);
  if (!player) throw new Error("Player not found");
  if (player.id !== currentPlayer(next).id) throw new Error("Not your turn");
  if (player.reinforcements <= 0) throw new Error("No reinforcements left");

  const territory = next.territories[territoryId];
  if (!territory) throw new Error("Territory not found");
  if (territory.ownerId !== playerId) throw new Error("You don't own this territory");

  territory.troops++;
  player.reinforcements--;

  // Advance to next player
  advancePlayer(next);

  // Check if setup is complete (all players have placed all troops)
  const allPlaced = next.players.every((p) => p.reinforcements <= 0);
  if (allPlaced) {
    next.phase = "reinforce";
    next.currentPlayerIndex = 0;
    // Give first player their reinforcements
    const first = next.players[0];
    first.reinforcements = calculateReinforcements(next, first.id);
  }

  return next;
}

// --------------- Phase: Reinforce ---------------
// Player places reinforcement troops on owned territories.

export function reinforcePlace(
  state: GameState,
  playerId: string,
  territoryId: TerritoryId,
  count: number,
): GameState {
  if (state.phase !== "reinforce") {
    throw new Error("Not in reinforce phase");
  }
  const next = cloneState(state);
  const player = next.players.find((p) => p.id === playerId);
  if (!player) throw new Error("Player not found");
  if (player.id !== currentPlayer(next).id) throw new Error("Not your turn");
  if (count < 1 || count > player.reinforcements) {
    throw new Error("Invalid troop count");
  }

  const territory = next.territories[territoryId];
  if (!territory) throw new Error("Territory not found");
  if (territory.ownerId !== playerId) throw new Error("You don't own this territory");

  territory.troops += count;
  player.reinforcements -= count;

  return next;
}

/** Finish reinforce phase and move to attack */
export function reinforceDone(state: GameState, playerId: string): GameState {
  if (state.phase !== "reinforce") throw new Error("Not in reinforce phase");
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.id !== playerId) throw new Error("Not your turn");
  if (player.reinforcements > 0) throw new Error("Must place all reinforcements first");

  next.phase = "attack";
  return next;
}

// --------------- Phase: Attack ---------------

export interface AttackResult {
  state: GameState;
  combat: CombatResult;
}

export function attack(
  state: GameState,
  playerId: string,
  fromId: TerritoryId,
  toId: TerritoryId,
  attackDice?: number,
): AttackResult {
  if (state.phase !== "attack") throw new Error("Not in attack phase");
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.id !== playerId) throw new Error("Not your turn");

  const from = next.territories[fromId];
  const to = next.territories[toId];
  if (!from || !to) throw new Error("Territory not found");
  if (from.ownerId !== playerId) throw new Error("You don't own the attacking territory");
  if (to.ownerId === playerId) throw new Error("Cannot attack your own territory");
  if (!areAdjacent(fromId, toId)) throw new Error("Territories are not adjacent");
  if (from.troops < 2) throw new Error("Need at least 2 troops to attack");

  // Determine dice counts
  const atkDice = attackDice ?? maxAttackDice(from.troops);
  if (!isValidAttackDice(atkDice, from.troops)) {
    throw new Error(`Invalid attack dice count: ${atkDice}`);
  }
  const defDice = maxDefendDice(to.troops);

  // Roll and resolve
  const combat = resolveCombat(rollDice(atkDice), rollDice(defDice));

  from.troops -= combat.attackerLosses;
  to.troops -= combat.defenderLosses;

  // Check conquest
  if (to.troops <= 0) {
    combat.conquered = true;
    const defenderId = to.ownerId!;
    to.ownerId = playerId;
    // Move troops in (minimum: number of attack dice used)
    const troopsToMove = atkDice;
    from.troops -= troopsToMove;
    to.troops = troopsToMove;

    next.hasConqueredThisTurn = true;
    updateTerritoryCount(next);

    // Check if defender is eliminated
    const defender = next.players.find((p) => p.id === defenderId);
    if (defender && defender.territoryCount === 0) {
      defender.isEliminated = true;
      // Conquering player takes eliminated player's cards
      player.cards.push(...defender.cards);
      defender.cards = [];
    }

    checkWinCondition(next);
  }

  return { state: next, combat };
}

/** Move additional troops into a conquered territory after attack */
export function attackMove(
  state: GameState,
  playerId: string,
  fromId: TerritoryId,
  toId: TerritoryId,
  count: number,
): GameState {
  if (state.phase !== "attack") throw new Error("Not in attack phase");
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.id !== playerId) throw new Error("Not your turn");

  const from = next.territories[fromId];
  const to = next.territories[toId];
  if (!from || !to) throw new Error("Territory not found");
  if (from.ownerId !== playerId || to.ownerId !== playerId) {
    throw new Error("You must own both territories");
  }
  if (!areAdjacent(fromId, toId)) throw new Error("Territories are not adjacent");
  if (count < 0 || count >= from.troops) {
    throw new Error("Invalid troop count (must leave at least 1)");
  }

  from.troops -= count;
  to.troops += count;

  return next;
}

/** End attack phase, move to fortify */
export function attackDone(state: GameState, playerId: string): GameState {
  if (state.phase !== "attack") throw new Error("Not in attack phase");
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.id !== playerId) throw new Error("Not your turn");

  // Award a card if player conquered at least one territory this turn
  if (next.hasConqueredThisTurn && next.deck && next.deck.length > 0) {
    const card = next.deck.pop()!;
    player.cards.push(card);
  }

  next.phase = "fortify";
  return next;
}

// --------------- Phase: Fortify ---------------
// Player may move troops from one territory to another connected owned territory.

/** Check if two owned territories are connected through owned territories */
export function areConnected(
  territories: Record<TerritoryId, Territory>,
  playerId: string,
  fromId: TerritoryId,
  toId: TerritoryId,
): boolean {
  const visited = new Set<TerritoryId>();
  const queue: TerritoryId[] = [fromId];
  visited.add(fromId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === toId) return true;

    for (const neighborId of territories[current].adjacentIds) {
      if (!visited.has(neighborId) && territories[neighborId].ownerId === playerId) {
        visited.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  return false;
}

export function fortify(
  state: GameState,
  playerId: string,
  fromId: TerritoryId,
  toId: TerritoryId,
  count: number,
): GameState {
  if (state.phase !== "fortify") throw new Error("Not in fortify phase");
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.id !== playerId) throw new Error("Not your turn");

  const from = next.territories[fromId];
  const to = next.territories[toId];
  if (!from || !to) throw new Error("Territory not found");
  if (from.ownerId !== playerId || to.ownerId !== playerId) {
    throw new Error("You must own both territories");
  }
  if (fromId === toId) throw new Error("Cannot fortify to the same territory");
  if (count < 1 || count >= from.troops) {
    throw new Error("Invalid troop count (must leave at least 1)");
  }
  if (!areConnected(next.territories, playerId, fromId, toId)) {
    throw new Error("Territories are not connected through your territory chain");
  }

  from.troops -= count;
  to.troops += count;

  return next;
}

/** End fortify phase, advance to next player's reinforce phase */
export function fortifyDone(state: GameState, playerId: string): GameState {
  if (state.phase !== "fortify") throw new Error("Not in fortify phase");
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.id !== playerId) throw new Error("Not your turn");

  next.hasConqueredThisTurn = false;
  advancePlayer(next);
  next.turnNumber++;
  next.phase = "reinforce";

  // Give new current player their reinforcements
  const newPlayer = currentPlayer(next);
  newPlayer.reinforcements = calculateReinforcements(next, newPlayer.id);

  return next;
}

// --------------- Card Trading ---------------

/** Check if 3 cards form a valid set */
export function isValidCardSet(cards: TerritoryCard[]): boolean {
  if (cards.length !== 3) return false;

  const types = cards.map((c) => c.type);
  const wilds = types.filter((t) => t === "wild").length;

  if (wilds >= 2) return true; // 2 wilds + anything
  if (wilds === 1) return true; // 1 wild acts as any type

  // All same type
  if (types[0] === types[1] && types[1] === types[2]) return true;

  // All different types (no wilds)
  const unique = new Set(types);
  if (unique.size === 3) return true;

  return false;
}

/** Trade in a set of 3 cards for bonus troops */
export function tradeCards(
  state: GameState,
  playerId: string,
  cardIds: [string, string, string],
): GameState {
  if (state.phase !== "reinforce") throw new Error("Can only trade cards during reinforce phase");
  const next = cloneState(state);
  const player = next.players.find((p) => p.id === playerId);
  if (!player) throw new Error("Player not found");
  if (player.id !== currentPlayer(next).id) throw new Error("Not your turn");

  const cards = cardIds.map((cid) => {
    const card = player.cards.find((c) => c.id === cid);
    if (!card) throw new Error(`Card ${cid} not found in player's hand`);
    return card;
  });

  if (!isValidCardSet(cards)) throw new Error("Invalid card set");

  const bonus = cardSetBonus(next.cardSetsTradedIn);
  player.reinforcements += bonus;
  next.cardSetsTradedIn++;

  // Remove cards from player's hand, add to discard
  player.cards = player.cards.filter((c) => !cardIds.includes(c.id));
  if (next.discardPile) {
    next.discardPile.push(...cards);
  }

  // Bonus 2 troops on matching territories the player owns
  for (const card of cards) {
    if (card.territoryId && next.territories[card.territoryId]?.ownerId === playerId) {
      next.territories[card.territoryId].troops += 2;
    }
  }

  return next;
}

// --------------- State Sanitization ---------------
// Strip server-only fields before sending to clients

export function sanitizeForClient(state: GameState, forPlayerId?: string): GameState {
  const sanitized = { ...state };
  delete sanitized.deck;
  delete sanitized.discardPile;

  // Hide other players' cards (show count only via cards.length)
  if (forPlayerId) {
    sanitized.players = state.players.map((p) => ({
      ...p,
      cards: p.id === forPlayerId ? [...p.cards] : p.cards.map(() => ({
        id: "hidden",
        territoryId: null,
        type: "infantry" as const, // Placeholder — client only sees count
      })),
    }));
  }

  return sanitized;
}
