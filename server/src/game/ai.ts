// ============================================================
// AI Opponent — Automated player logic for all game phases.
// Three difficulty levels affect aggression and decision quality.
// ============================================================

import type {
  GameState,
  Territory,
  TerritoryId,
  AiDifficulty,
} from "@risk/shared";
import { areAdjacent, getPlayerTerritories, CONTINENTS } from "./mapData.js";

// --------------- Scoring helpers ---------------

interface TerritoryScore {
  id: TerritoryId;
  score: number;
}

/** Count how many adjacent territories are owned by enemies */
function borderThreat(state: GameState, territoryId: TerritoryId, playerId: string): number {
  const territory = state.territories[territoryId];
  return territory.adjacentIds.filter(
    (adj) => state.territories[adj].ownerId !== playerId,
  ).length;
}

/** Count enemy troops adjacent to a territory */
function adjacentEnemyTroops(state: GameState, territoryId: TerritoryId, playerId: string): number {
  const territory = state.territories[territoryId];
  return territory.adjacentIds
    .filter((adj) => state.territories[adj].ownerId !== playerId)
    .reduce((sum, adj) => sum + state.territories[adj].troops, 0);
}

/** Check if territory is on the border (has enemy neighbors) */
function isBorder(state: GameState, territoryId: TerritoryId, playerId: string): boolean {
  return borderThreat(state, territoryId, playerId) > 0;
}

/** Find weakest adjacent enemy territory */
function weakestAdjacentEnemy(
  state: GameState,
  territoryId: TerritoryId,
  playerId: string,
): TerritoryId | null {
  const territory = state.territories[territoryId];
  let weakest: TerritoryId | null = null;
  let weakestTroops = Infinity;

  for (const adjId of territory.adjacentIds) {
    const adj = state.territories[adjId];
    if (adj.ownerId !== playerId && adj.troops < weakestTroops) {
      weakestTroops = adj.troops;
      weakest = adjId;
    }
  }

  return weakest;
}

// --------------- AI Decision: Setup ---------------

export interface AiSetupDecision {
  territoryId: TerritoryId;
}

/** Choose where to place a troop during setup */
export function aiSetup(state: GameState, playerId: string): AiSetupDecision {
  const owned = getPlayerTerritories(state.territories, playerId);

  // Prioritize border territories with the most enemy neighbors
  const scored: TerritoryScore[] = owned.map((id) => ({
    id,
    score: borderThreat(state, id, playerId) * 10 + adjacentEnemyTroops(state, id, playerId),
  }));

  scored.sort((a, b) => b.score - a.score);

  return { territoryId: scored[0]?.id ?? owned[0] };
}

// --------------- AI Decision: Reinforce ---------------

export interface AiReinforceDecision {
  placements: Array<{ territoryId: TerritoryId; count: number }>;
}

/** Decide where to place reinforcements */
export function aiReinforce(
  state: GameState,
  playerId: string,
  difficulty: AiDifficulty,
): AiReinforceDecision {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { placements: [] };

  let reinforcements = player.reinforcements;
  if (reinforcements <= 0) return { placements: [] };

  const owned = getPlayerTerritories(state.territories, playerId);
  const borders = owned.filter((id) => isBorder(state, id, playerId));

  if (borders.length === 0) {
    // No borders (shouldn't happen unless game is over)
    return { placements: [{ territoryId: owned[0], count: reinforcements }] };
  }

  // Score borders by threat level
  const scored: TerritoryScore[] = borders.map((id) => ({
    id,
    score: adjacentEnemyTroops(state, id, playerId) - state.territories[id].troops,
  }));
  scored.sort((a, b) => b.score - a.score);

  const placements: Array<{ territoryId: TerritoryId; count: number }> = [];

  if (difficulty === "easy") {
    // Easy: spread evenly
    const perTerritory = Math.max(1, Math.floor(reinforcements / borders.length));
    for (const border of borders) {
      const count = Math.min(perTerritory, reinforcements);
      if (count > 0) {
        placements.push({ territoryId: border, count });
        reinforcements -= count;
      }
    }
    // Remainder on highest threat
    if (reinforcements > 0) {
      placements.push({ territoryId: scored[0].id, count: reinforcements });
    }
  } else {
    // Medium/Hard: concentrate on highest-threat territories
    const topCount = difficulty === "hard" ? 2 : 3;
    const targets = scored.slice(0, Math.min(topCount, scored.length));
    const perTarget = Math.max(1, Math.floor(reinforcements / targets.length));

    for (const target of targets) {
      const count = Math.min(perTarget, reinforcements);
      if (count > 0) {
        placements.push({ territoryId: target.id, count });
        reinforcements -= count;
      }
    }
    if (reinforcements > 0) {
      placements.push({ territoryId: targets[0].id, count: reinforcements });
    }
  }

  return { placements };
}

// --------------- AI Decision: Attack ---------------

export interface AiAttackDecision {
  /** null = stop attacking */
  attack: { fromId: TerritoryId; toId: TerritoryId } | null;
}

/** Decide whether and where to attack */
export function aiAttack(
  state: GameState,
  playerId: string,
  difficulty: AiDifficulty,
): AiAttackDecision {
  const owned = getPlayerTerritories(state.territories, playerId);

  // Find all possible attacks with advantage
  const candidates: Array<{
    fromId: TerritoryId;
    toId: TerritoryId;
    ratio: number;
  }> = [];

  for (const fromId of owned) {
    const from = state.territories[fromId];
    if (from.troops < 2) continue; // Need at least 2 to attack

    for (const toId of from.adjacentIds) {
      const to = state.territories[toId];
      if (to.ownerId === playerId) continue;

      // Check for non-aggression pact
      if (state.pacts.some(
        (p) => p.isActive && p.playerIds.includes(playerId) && p.playerIds.includes(to.ownerId!),
      )) {
        continue; // AI respects pacts
      }

      const ratio = from.troops / to.troops;
      candidates.push({ fromId, toId, ratio });
    }
  }

  if (candidates.length === 0) return { attack: null };

  // Sort by best ratio
  candidates.sort((a, b) => b.ratio - a.ratio);

  // Minimum ratio threshold based on difficulty
  const minRatio = difficulty === "easy" ? 3.0 : difficulty === "medium" ? 2.0 : 1.5;

  const best = candidates[0];
  if (best.ratio < minRatio) return { attack: null };

  // Hard AI: also considers continent completion
  if (difficulty === "hard") {
    // Prefer attacks that would complete a continent
    const continentAttack = candidates.find((c) => {
      const target = state.territories[c.toId];
      const continent = Object.values(CONTINENTS).find(
        (cont) => cont.territoryIds.includes(c.toId),
      );
      if (!continent) return false;

      // Check if we own all but this territory in the continent
      const ownedInContinent = continent.territoryIds.filter(
        (tid) => state.territories[tid].ownerId === playerId,
      ).length;
      return ownedInContinent === continent.territoryIds.length - 1 && c.ratio >= 1.5;
    });

    if (continentAttack) return { attack: continentAttack };
  }

  return { attack: { fromId: best.fromId, toId: best.toId } };
}

// --------------- AI Decision: Fortify ---------------

export interface AiFortifyDecision {
  /** null = skip fortify */
  fortify: { fromId: TerritoryId; toId: TerritoryId; count: number } | null;
}

/** Decide how to fortify */
export function aiFortify(
  state: GameState,
  playerId: string,
): AiFortifyDecision {
  const owned = getPlayerTerritories(state.territories, playerId);

  // Find interior territories (no enemy neighbors) with troops to spare
  const interior = owned.filter((id) => !isBorder(state, id, playerId));
  const borders = owned.filter((id) => isBorder(state, id, playerId));

  if (interior.length === 0 || borders.length === 0) {
    return { fortify: null };
  }

  // Find interior territory with most surplus troops
  const source = interior
    .filter((id) => state.territories[id].troops > 1)
    .sort((a, b) => state.territories[b].troops - state.territories[a].troops)[0];

  if (!source) return { fortify: null };

  // Find weakest border territory adjacent to source (or connected)
  const weakestBorder = borders
    .sort((a, b) => state.territories[a].troops - state.territories[b].troops)[0];

  if (!weakestBorder) return { fortify: null };

  const troopsToMove = state.territories[source].troops - 1;
  if (troopsToMove <= 0) return { fortify: null };

  return {
    fortify: {
      fromId: source,
      toId: weakestBorder,
      count: troopsToMove,
    },
  };
}

// --------------- AI Turn Execution ---------------
// Returns a sequence of actions the AI wants to take.

export interface AiTurnPlan {
  setupPlace?: AiSetupDecision;
  reinforcements?: AiReinforceDecision;
  attacks: AiAttackDecision[];
  fortify?: AiFortifyDecision;
}

/** Plan a complete turn for the AI */
export function planAiTurn(
  state: GameState,
  playerId: string,
  difficulty: AiDifficulty,
): AiTurnPlan {
  const plan: AiTurnPlan = { attacks: [] };

  if (state.phase === "setup") {
    plan.setupPlace = aiSetup(state, playerId);
    return plan;
  }

  if (state.phase === "reinforce") {
    plan.reinforcements = aiReinforce(state, playerId, difficulty);
  }

  // Plan multiple attacks (up to 5 to prevent infinite loops)
  if (state.phase === "reinforce" || state.phase === "attack") {
    let simState = state;
    for (let i = 0; i < 5; i++) {
      const decision = aiAttack(simState, playerId, difficulty);
      plan.attacks.push(decision);
      if (!decision.attack) break;

      // Don't actually mutate — just mark that we'd attack here
      // The game room will execute these sequentially
    }
  }

  plan.fortify = aiFortify(state, playerId);

  return plan;
}
