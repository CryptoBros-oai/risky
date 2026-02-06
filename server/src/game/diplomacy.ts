// ============================================================
// Diplomacy — Non-aggression pacts with desertion penalties.
// Breaking a pact costs the aggressor 5-10% of total troops.
// ============================================================

import type {
  GameState,
  DiplomacyPact,
  PactBreakPenalty,
  TerritoryId,
  Territory,
} from "@risk/shared";

let pactCounter = 0;

/** Create a new pact proposal between two players */
export function createPact(
  playerIdA: string,
  playerIdB: string,
  currentTurn: number,
  minimumDuration: number = 3,
): DiplomacyPact {
  pactCounter++;
  return {
    id: `pact-${Date.now()}-${pactCounter}`,
    playerIds: [playerIdA, playerIdB],
    createdTurn: currentTurn,
    minimumDuration,
    isActive: false, // Becomes active when accepted
  };
}

/** Activate a pact (both players agreed) */
export function acceptPact(state: GameState, pactId: string): GameState {
  const next = { ...state, pacts: [...state.pacts] };
  const pact = next.pacts.find((p) => p.id === pactId);
  if (!pact) throw new Error("Pact not found");
  if (pact.isActive) throw new Error("Pact already active");
  pact.isActive = true;
  return next;
}

/** Check if two players have an active pact */
export function havePact(state: GameState, playerA: string, playerB: string): boolean {
  return state.pacts.some(
    (p) =>
      p.isActive &&
      p.playerIds.includes(playerA) &&
      p.playerIds.includes(playerB),
  );
}

/** Get the active pact between two players, if any */
export function getPact(
  state: GameState,
  playerA: string,
  playerB: string,
): DiplomacyPact | undefined {
  return state.pacts.find(
    (p) =>
      p.isActive &&
      p.playerIds.includes(playerA) &&
      p.playerIds.includes(playerB),
  );
}

/**
 * Break a pact and apply desertion penalty to the breaker.
 * Troops are removed proportionally from the breaker's territories,
 * always leaving at least 1 troop per territory.
 */
export function breakPact(
  state: GameState,
  pactId: string,
  breakerId: string,
  desertionRate: number,
): { state: GameState; penalty: PactBreakPenalty } {
  const next = {
    ...state,
    pacts: state.pacts.map((p) => ({ ...p })),
    territories: Object.fromEntries(
      Object.entries(state.territories).map(([k, v]) => [k, { ...v }]),
    ) as Record<TerritoryId, Territory>,
    players: state.players.map((p) => ({ ...p, cards: [...p.cards] })),
    lastUpdated: Date.now(),
  };

  const pact = next.pacts.find((p) => p.id === pactId);
  if (!pact) throw new Error("Pact not found");
  if (!pact.isActive) throw new Error("Pact is not active");
  if (!pact.playerIds.includes(breakerId)) throw new Error("Player not in this pact");

  // Deactivate pact
  pact.isActive = false;

  // Calculate total troops owned by breaker
  const breakerTerritories = Object.values(next.territories).filter(
    (t) => t.ownerId === breakerId,
  );
  const totalTroops = breakerTerritories.reduce((sum, t) => sum + t.troops, 0);

  // Clamp desertion rate to 5-10%
  const rate = Math.max(0.05, Math.min(0.10, desertionRate));
  const troopsToLose = Math.max(1, Math.floor(totalTroops * rate));

  // Distribute losses across territories (largest garrisons first)
  const sorted = [...breakerTerritories].sort((a, b) => b.troops - a.troops);
  let remaining = troopsToLose;
  const affectedTerritories: TerritoryId[] = [];

  for (const territory of sorted) {
    if (remaining <= 0) break;

    const canLose = territory.troops - 1; // Must leave at least 1
    if (canLose <= 0) continue;

    const loss = Math.min(remaining, canLose);
    next.territories[territory.id].troops -= loss;
    remaining -= loss;
    affectedTerritories.push(territory.id);
  }

  const actualLoss = troopsToLose - remaining;

  // Update player territory count (troops changed, not ownership)
  const breaker = next.players.find((p) => p.id === breakerId);
  if (breaker) {
    breaker.territoryCount = Object.values(next.territories).filter(
      (t) => t.ownerId === breakerId,
    ).length;
  }

  const penalty: PactBreakPenalty = {
    breakerId,
    desertionRate: rate,
    troopsLost: actualLoss,
    affectedTerritories,
  };

  return { state: next, penalty };
}
