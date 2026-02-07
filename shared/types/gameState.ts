// ============================================================
// RISK: Reimagined — Shared Types
// Contract between server (Claude Code) and client (Codex).
// Changes here require a NOTES.md entry before merging.
// ============================================================

// --------------- Identifiers ---------------
// Format: kebab-case. Canonical list — do not add/remove without a NOTES.md entry.

export type ContinentId =
  | "north-america"
  | "south-america"
  | "europe"
  | "africa"
  | "asia"
  | "australia";

export type TerritoryId =
  // North America (6)
  | "alaska"
  | "northwest-territory"
  | "greenland"
  | "western-us"
  | "eastern-us"
  | "central-america"
  // South America (4)
  | "venezuela"
  | "peru"
  | "brazil"
  | "argentina"
  // Europe (5)
  | "great-britain"
  | "northern-europe"
  | "western-europe"
  | "southern-europe"
  | "ukraine"
  // Africa (6)
  | "north-africa"
  | "egypt"
  | "congo"
  | "east-africa"
  | "south-africa"
  | "madagascar"
  // Asia (9)
  | "middle-east"
  | "ural"
  | "siberia"
  | "yakutsk"
  | "kamchatka"
  | "mongolia"
  | "china"
  | "india"
  | "japan"
  // Australia (4)
  | "indonesia"
  | "new-guinea"
  | "western-australia"
  | "eastern-australia";

// --------------- Players ---------------

export type PlayerColor =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "orange";

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  /** Number of undeployed reinforcement troops */
  reinforcements: number;
  /** Cards currently held */
  cards: TerritoryCard[];
  /** Whether this player has been eliminated */
  isEliminated: boolean;
  /** Number of territories controlled (derived, but cached for convenience) */
  territoryCount: number;
}

// --------------- Map ---------------

export interface Territory {
  id: TerritoryId;
  name: string;
  continentId: ContinentId;
  /** IDs of territories adjacent to this one */
  adjacentIds: TerritoryId[];
  /** Who currently controls this territory (null = unclaimed during setup) */
  ownerId: string | null;
  /** Number of troops stationed here */
  troops: number;
  /** SVG polygon points string for rendering (e.g. "60,120 140,80 230,90").
   *  Client-controlled — server never writes this field. */
  svgPath?: string;
  /** Center point for troop count label placement */
  center?: { x: number; y: number };
}

export interface Continent {
  id: ContinentId;
  name: string;
  /** Bonus reinforcements for controlling all territories in this continent */
  bonusTroops: number;
  /** Territory IDs that belong to this continent */
  territoryIds: TerritoryId[];
}

// --------------- Cards ---------------

export interface TerritoryCard {
  id: string;
  territoryId: TerritoryId | null; // null for wild cards
  type: "infantry" | "cavalry" | "artillery" | "wild";
}

/** A set of 3 cards traded in for bonus troops */
export interface CardSet {
  cards: [TerritoryCard, TerritoryCard, TerritoryCard];
  bonusTroops: number;
}

// --------------- Combat ---------------

export interface DiceRoll {
  attacker: number[]; // sorted descending, 1-3 dice
  defender: number[]; // sorted descending, 1-2 dice
}

export interface CombatResult {
  roll: DiceRoll;
  attackerLosses: number;
  defenderLosses: number;
  /** True if the territory was conquered this combat */
  conquered: boolean;
}

// --------------- Game Phases ---------------

export type GamePhase =
  | "setup"       // Initial territory claim & troop placement
  | "reinforce"   // Receive and deploy reinforcements
  | "attack"      // Attack adjacent enemy territories
  | "fortify"     // Move troops between connected owned territories
  | "gameOver";   // A player has won

// --------------- Game State ---------------

export interface GameState {
  id: string;
  /** Current phase of the game */
  phase: GamePhase;
  /** Ordered list of players (turn order) */
  players: Player[];
  /** Index into players[] for whose turn it is */
  currentPlayerIndex: number;
  /** The current turn number (increments after all phases for a player) */
  turnNumber: number;
  /** All territories keyed by TerritoryId */
  territories: Record<TerritoryId, Territory>;
  /** All continents keyed by ContinentId */
  continents: Record<ContinentId, Continent>;
  /** Card deck (draw pile) — server only, not sent to clients */
  deck?: TerritoryCard[];
  /** Discard pile — server only */
  discardPile?: TerritoryCard[];
  /** Number of card sets traded in so far (affects bonus troops) */
  cardSetsTradedIn: number;
  /** Whether the current player has conquered a territory this turn (earns a card) */
  hasConqueredThisTurn: boolean;
  /** ID of the winning player, if any */
  winnerId: string | null;
  /** Timestamp of the last state update */
  lastUpdated: number;
  /** Active mini-battle (null when no battle in progress) */
  activeBattle: MiniBattleState | null;
  /** Active diplomacy pacts */
  pacts: DiplomacyPact[];
  /** Battle mode for this game */
  battleMode: "classic" | "tactical";
  /** Which player IDs are AI-controlled */
  aiPlayerIds: string[];
}

// --------------- Mini-Battle System ---------------
// Tactical battle mode: troops → army units on a side-view battlefield.

export type BattleUnitType = "infantry" | "cavalry" | "cannon";

export interface BattleUnit {
  type: BattleUnitType;
  /** Hit points (infantry: 1, cavalry: 2, cannon: 3) */
  hp: number;
  /** Max HP for this unit type */
  maxHp: number;
}

/** Army composition for one side of a mini-battle */
export interface BattleArmy {
  playerId: string;
  territoryId: TerritoryId;
  infantry: number;
  cavalry: number;
  cannons: number;
  /** Total troop count this army was generated from */
  sourceTroops: number;
}

/** Sent to both players when a tactical battle starts */
export interface MiniBattleState {
  battleId: string;
  attacker: BattleArmy;
  defender: BattleArmy;
  /** Time limit in seconds (0 = unlimited) */
  timeLimit: number;
}

/** Sent by client when battle concludes */
export interface MiniBattleResult {
  battleId: string;
  /** Surviving units per side */
  attackerSurvivors: { infantry: number; cavalry: number; cannons: number };
  defenderSurvivors: { infantry: number; cavalry: number; cannons: number };
}

// --------------- Diplomacy ---------------

export interface DiplomacyPact {
  id: string;
  /** The two players in the pact */
  playerIds: [string, string];
  /** Turn number when the pact was created */
  createdTurn: number;
  /** Minimum turns before the pact can be broken without penalty (0 = always penalized) */
  minimumDuration: number;
  isActive: boolean;
}

export interface PactBreakPenalty {
  /** Player who broke the pact */
  breakerId: string;
  /** Percentage of total troops lost to desertion (0.05 = 5%) */
  desertionRate: number;
  /** Actual troops lost */
  troopsLost: number;
  /** Territories where troops were removed */
  affectedTerritories: TerritoryId[];
}

// --------------- AI Players ---------------

export type AiDifficulty = "easy" | "medium" | "hard";

export interface AiPlayerConfig {
  name: string;
  difficulty: AiDifficulty;
  color: PlayerColor;
}

// --------------- Game Config ---------------

export interface GameConfig {
  /** Minimum players to start */
  minPlayers: number;
  /** Maximum players allowed */
  maxPlayers: number;
  /** Starting troops per player (varies by player count) */
  startingTroops: Record<number, number>;
  /** Whether to use progressive card trade-in bonus */
  progressiveCardBonus: boolean;
  /** Battle resolution mode */
  battleMode: "classic" | "tactical";
  /** Whether diplomacy (non-aggression pacts) is enabled */
  diplomacyEnabled: boolean;
  /** Desertion rate when breaking a pact (0.05-0.10 = 5-10%) */
  pactBreakDesertionRate: number;
}

// --------------- Events (Socket.io) ---------------

/** Events sent from server to clients */
export type GameEvent =
  | { type: "stateUpdate"; state: GameState }
  | { type: "combatResult"; result: CombatResult; attackerId: TerritoryId; defenderId: TerritoryId }
  | { type: "cardAwarded"; playerId: string; card: TerritoryCard }
  | { type: "playerEliminated"; playerId: string; eliminatedBy: string }
  | { type: "gameOver"; winnerId: string }
  | { type: "error"; message: string }
  | { type: "chatMessage"; playerId: string; message: string }
  | { type: "miniBattleStart"; battle: MiniBattleState }
  | { type: "miniBattleEnd"; result: MiniBattleResult; conquered: boolean }
  | { type: "pactProposed"; pact: DiplomacyPact }
  | { type: "pactAccepted"; pact: DiplomacyPact }
  | { type: "pactBroken"; penalty: PactBreakPenalty }
  | { type: "aiTurnStart"; playerId: string }
  | { type: "aiTurnEnd"; playerId: string };

// --------------- Lobby ---------------

export interface LobbyPlayer {
  id: string;
  name: string;
  color: PlayerColor;
  isReady: boolean;
  isHost: boolean;
  /** Whether this player is an AI bot */
  isAi: boolean;
  /** AI difficulty (only set when isAi is true) */
  aiDifficulty?: AiDifficulty;
}

export interface LobbyState {
  gameId: string;
  players: LobbyPlayer[];
  maxPlayers: number;
  isStarting: boolean;
}

// --------------- Socket.io Typed Event Maps ---------------
// Used by both client and server for type-safe socket communication.

/** Client → Server events */
export interface ClientToServerEvents {
  "lobby:create": (data: { playerName: string }, ack: (res: { gameId: string }) => void) => void;
  "lobby:join": (data: { gameId: string; playerName: string }, ack: (res: { ok: boolean; error?: string }) => void) => void;
  "lobby:ready": () => void;
  "lobby:start": () => void;
  "lobby:addAi": (data: { difficulty: AiDifficulty }, ack: (res: { ok: boolean; error?: string }) => void) => void;
  "lobby:removeAi": (data: { playerId: string }, ack: (res: { ok: boolean; error?: string }) => void) => void;
  "game:setupPlace": (data: { territoryId: TerritoryId }) => void;
  "game:reinforcePlace": (data: { territoryId: TerritoryId; count: number }) => void;
  "game:tradeCards": (data: { cardIds: [string, string, string] }) => void;
  "game:reinforceDone": () => void;
  "game:attack": (data: { fromId: TerritoryId; toId: TerritoryId; dice?: number }) => void;
  "game:attackMove": (data: { fromId: TerritoryId; toId: TerritoryId; count: number }) => void;
  "game:attackDone": () => void;
  "game:fortify": (data: { fromId: TerritoryId; toId: TerritoryId; count: number }) => void;
  "game:fortifyDone": () => void;
  "game:battleResult": (data: MiniBattleResult) => void;
  "diplomacy:propose": (data: { targetPlayerId: string }) => void;
  "diplomacy:accept": (data: { pactId: string }) => void;
  "diplomacy:reject": (data: { pactId: string }) => void;
  "chat:send": (data: { message: string }) => void;
}

/** Server → Client events */
export interface ServerToClientEvents {
  "lobby:update": (state: LobbyState) => void;
  "game:event": (event: GameEvent) => void;
  "game:state": (state: GameState) => void;
  "error": (data: { message: string }) => void;
}
