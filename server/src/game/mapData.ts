// ============================================================
// Canonical map data — server source of truth.
// 34 territories, 6 continents, classic RISK layout (simplified).
// Adjacencies adapted for the reduced territory count.
// ============================================================

import type { Territory, Continent, TerritoryId, ContinentId } from "@risk/shared";

// --------------- Continents ---------------

export const CONTINENTS: Record<ContinentId, Continent> = {
  "north-america": {
    id: "north-america",
    name: "North America",
    bonusTroops: 5,
    territoryIds: [
      "alaska", "northwest-territory", "greenland",
      "western-us", "eastern-us", "central-america",
    ],
  },
  "south-america": {
    id: "south-america",
    name: "South America",
    bonusTroops: 2,
    territoryIds: ["venezuela", "peru", "brazil", "argentina"],
  },
  "europe": {
    id: "europe",
    name: "Europe",
    bonusTroops: 5,
    territoryIds: [
      "great-britain", "northern-europe", "western-europe",
      "southern-europe", "ukraine",
    ],
  },
  "africa": {
    id: "africa",
    name: "Africa",
    bonusTroops: 3,
    territoryIds: [
      "north-africa", "egypt", "congo",
      "east-africa", "south-africa", "madagascar",
    ],
  },
  "asia": {
    id: "asia",
    name: "Asia",
    bonusTroops: 7,
    territoryIds: [
      "middle-east", "ural", "siberia", "yakutsk",
      "kamchatka", "mongolia", "china", "india", "japan",
    ],
  },
  "australia": {
    id: "australia",
    name: "Australia",
    bonusTroops: 2,
    territoryIds: [
      "indonesia", "new-guinea",
      "western-australia", "eastern-australia",
    ],
  },
};

// --------------- Adjacency Graph ---------------
// Each entry lists all territories adjacent to the key.
// Cross-continent connections are commented.

export const ADJACENCY: Record<TerritoryId, TerritoryId[]> = {
  // --- North America ---
  "alaska":                ["northwest-territory", "western-us", "kamchatka" /* → Asia */],
  "northwest-territory":   ["alaska", "greenland", "western-us", "eastern-us"],
  "greenland":             ["northwest-territory", "eastern-us", "great-britain" /* → Europe */],
  "western-us":            ["alaska", "northwest-territory", "eastern-us", "central-america"],
  "eastern-us":            ["northwest-territory", "greenland", "western-us", "central-america"],
  "central-america":       ["western-us", "eastern-us", "venezuela" /* → S. America */],

  // --- South America ---
  "venezuela":             ["central-america" /* → N. America */, "peru", "brazil"],
  "peru":                  ["venezuela", "brazil", "argentina"],
  "brazil":                ["venezuela", "peru", "argentina", "north-africa" /* → Africa */],
  "argentina":             ["peru", "brazil"],

  // --- Europe ---
  "great-britain":         ["greenland" /* → N. America */, "northern-europe", "western-europe"],
  "northern-europe":       ["great-britain", "western-europe", "southern-europe", "ukraine"],
  "western-europe":        ["great-britain", "northern-europe", "southern-europe", "north-africa" /* → Africa */],
  "southern-europe":       ["northern-europe", "western-europe", "ukraine", "north-africa" /* → Africa */, "egypt" /* → Africa */, "middle-east" /* → Asia */],
  "ukraine":               ["northern-europe", "southern-europe", "middle-east" /* → Asia */, "ural" /* → Asia */],

  // --- Africa ---
  "north-africa":          ["brazil" /* → S. America */, "western-europe" /* → Europe */, "southern-europe" /* → Europe */, "egypt", "congo", "east-africa"],
  "egypt":                 ["southern-europe" /* → Europe */, "north-africa", "east-africa", "middle-east" /* → Asia */],
  "congo":                 ["north-africa", "east-africa", "south-africa"],
  "east-africa":           ["north-africa", "egypt", "congo", "south-africa", "madagascar", "middle-east" /* → Asia */],
  "south-africa":          ["congo", "east-africa", "madagascar"],
  "madagascar":            ["east-africa", "south-africa"],

  // --- Asia ---
  "middle-east":           ["southern-europe" /* → Europe */, "ukraine" /* → Europe */, "egypt" /* → Africa */, "east-africa" /* → Africa */, "india", "china"],
  "ural":                  ["ukraine" /* → Europe */, "siberia", "china", "mongolia"],
  "siberia":               ["ural", "yakutsk", "mongolia", "china"],
  "yakutsk":               ["siberia", "kamchatka", "mongolia"],
  "kamchatka":             ["alaska" /* → N. America */, "yakutsk", "mongolia", "japan"],
  "mongolia":              ["ural", "siberia", "yakutsk", "kamchatka", "china", "japan"],
  "china":                 ["middle-east", "ural", "siberia", "mongolia", "india", "indonesia" /* → Australia */],
  "india":                 ["middle-east", "china", "indonesia" /* → Australia */],
  "japan":                 ["kamchatka", "mongolia"],

  // --- Australia ---
  "indonesia":             ["china" /* → Asia */, "india" /* → Asia */, "new-guinea", "western-australia"],
  "new-guinea":            ["indonesia", "western-australia", "eastern-australia"],
  "western-australia":     ["indonesia", "new-guinea", "eastern-australia"],
  "eastern-australia":     ["new-guinea", "western-australia"],
};

// --------------- Territory Factory ---------------
// Creates the initial territory records (no owner, 0 troops).

function makeTerritoryRecord(id: TerritoryId, continentId: ContinentId): Territory {
  const continent = CONTINENTS[continentId];
  const names: Record<TerritoryId, string> = {
    "alaska": "Alaska",
    "northwest-territory": "Northwest Territory",
    "greenland": "Greenland",
    "western-us": "Western United States",
    "eastern-us": "Eastern United States",
    "central-america": "Central America",
    "venezuela": "Venezuela",
    "peru": "Peru",
    "brazil": "Brazil",
    "argentina": "Argentina",
    "great-britain": "Great Britain",
    "northern-europe": "Northern Europe",
    "western-europe": "Western Europe",
    "southern-europe": "Southern Europe",
    "ukraine": "Ukraine",
    "north-africa": "North Africa",
    "egypt": "Egypt",
    "congo": "Congo",
    "east-africa": "East Africa",
    "south-africa": "South Africa",
    "madagascar": "Madagascar",
    "middle-east": "Middle East",
    "ural": "Ural",
    "siberia": "Siberia",
    "yakutsk": "Yakutsk",
    "kamchatka": "Kamchatka",
    "mongolia": "Mongolia",
    "china": "China",
    "india": "India",
    "japan": "Japan",
    "indonesia": "Indonesia",
    "new-guinea": "New Guinea",
    "western-australia": "Western Australia",
    "eastern-australia": "Eastern Australia",
  };

  return {
    id,
    name: names[id],
    continentId,
    adjacentIds: ADJACENCY[id],
    ownerId: null,
    troops: 0,
  };
}

/** Build the full territories record for a new game */
export function createTerritories(): Record<TerritoryId, Territory> {
  const territories: Partial<Record<TerritoryId, Territory>> = {};

  for (const continent of Object.values(CONTINENTS)) {
    for (const tid of continent.territoryIds) {
      territories[tid] = makeTerritoryRecord(tid, continent.id);
    }
  }

  return territories as Record<TerritoryId, Territory>;
}

/** Check if two territories are adjacent */
export function areAdjacent(a: TerritoryId, b: TerritoryId): boolean {
  return ADJACENCY[a]?.includes(b) ?? false;
}

/** Get all territory IDs owned by a player */
export function getPlayerTerritories(
  territories: Record<TerritoryId, Territory>,
  playerId: string,
): TerritoryId[] {
  return Object.values(territories)
    .filter((t) => t.ownerId === playerId)
    .map((t) => t.id);
}

/** Check if a player controls an entire continent */
export function controlsContinent(
  territories: Record<TerritoryId, Territory>,
  playerId: string,
  continentId: ContinentId,
): boolean {
  return CONTINENTS[continentId].territoryIds.every(
    (tid) => territories[tid].ownerId === playerId,
  );
}
