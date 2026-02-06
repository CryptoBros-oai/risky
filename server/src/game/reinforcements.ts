import type { GameState, ContinentId, TerritoryId, Territory } from "@risk/shared";
import { CONTINENTS, controlsContinent } from "./mapData.js";

const MIN_REINFORCEMENTS = 3;

/** Progressive card set trade-in bonuses (classic RISK) */
const CARD_SET_BONUSES = [4, 6, 8, 10, 12, 15];
const CARD_SET_INCREMENT_AFTER = 5; // After 6th set, +5 per set

/** Calculate base reinforcements from territory count */
export function territoryReinforcements(territoryCount: number): number {
  return Math.max(MIN_REINFORCEMENTS, Math.floor(territoryCount / 3));
}

/** Calculate continent bonus for a player */
export function continentBonuses(
  territories: Record<TerritoryId, Territory>,
  playerId: string,
): number {
  let bonus = 0;
  for (const continentId of Object.keys(CONTINENTS) as ContinentId[]) {
    if (controlsContinent(territories, playerId, continentId)) {
      bonus += CONTINENTS[continentId].bonusTroops;
    }
  }
  return bonus;
}

/** Calculate card set trade-in bonus based on how many sets have been traded */
export function cardSetBonus(setsTraded: number): number {
  if (setsTraded < CARD_SET_BONUSES.length) {
    return CARD_SET_BONUSES[setsTraded];
  }
  // After the predefined list, increment by 5
  const extra = setsTraded - CARD_SET_BONUSES.length;
  return CARD_SET_BONUSES[CARD_SET_BONUSES.length - 1] + (extra + 1) * CARD_SET_INCREMENT_AFTER;
}

/** Calculate total reinforcements for a player at the start of their turn */
export function calculateReinforcements(state: GameState, playerId: string): number {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.isEliminated) return 0;

  const base = territoryReinforcements(player.territoryCount);
  const continent = continentBonuses(state.territories, playerId);

  return base + continent;
}
