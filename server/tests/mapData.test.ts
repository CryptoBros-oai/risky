import { describe, it, expect } from "vitest";
import {
  CONTINENTS,
  ADJACENCY,
  createTerritories,
  areAdjacent,
  controlsContinent,
} from "../src/game/mapData.js";

describe("mapData", () => {
  const allTerritoryIds = Object.values(CONTINENTS).flatMap(
    (c) => c.territoryIds,
  );

  it("has 34 territories", () => {
    expect(allTerritoryIds).toHaveLength(34);
  });

  it("has 6 continents", () => {
    expect(Object.keys(CONTINENTS)).toHaveLength(6);
  });

  it("every territory has an adjacency entry", () => {
    for (const tid of allTerritoryIds) {
      expect(ADJACENCY[tid], `Missing adjacency for ${tid}`).toBeDefined();
      expect(ADJACENCY[tid].length).toBeGreaterThan(0);
    }
  });

  it("adjacency is symmetric (A→B implies B→A)", () => {
    for (const [tid, neighbors] of Object.entries(ADJACENCY)) {
      for (const neighbor of neighbors) {
        expect(
          ADJACENCY[neighbor],
          `${neighbor} missing from ADJACENCY`,
        ).toBeDefined();
        expect(
          ADJACENCY[neighbor],
          `${tid} → ${neighbor} but ${neighbor} does not list ${tid}`,
        ).toContain(tid);
      }
    }
  });

  it("no territory is adjacent to itself", () => {
    for (const [tid, neighbors] of Object.entries(ADJACENCY)) {
      expect(neighbors, `${tid} is adjacent to itself`).not.toContain(tid);
    }
  });

  it("no duplicate adjacencies", () => {
    for (const [tid, neighbors] of Object.entries(ADJACENCY)) {
      const unique = new Set(neighbors);
      expect(unique.size, `${tid} has duplicate adjacencies`).toBe(
        neighbors.length,
      );
    }
  });

  it("createTerritories returns all 34 territories", () => {
    const territories = createTerritories();
    expect(Object.keys(territories)).toHaveLength(34);
    for (const tid of allTerritoryIds) {
      expect(territories[tid]).toBeDefined();
      expect(territories[tid].ownerId).toBeNull();
      expect(territories[tid].troops).toBe(0);
    }
  });

  it("areAdjacent works correctly", () => {
    expect(areAdjacent("alaska", "kamchatka")).toBe(true);
    expect(areAdjacent("alaska", "brazil")).toBe(false);
    expect(areAdjacent("brazil", "north-africa")).toBe(true);
  });

  it("controlsContinent detects full control", () => {
    const territories = createTerritories();
    // Give player1 all of Australia
    for (const tid of CONTINENTS["australia"].territoryIds) {
      territories[tid].ownerId = "player1";
    }
    expect(controlsContinent(territories, "player1", "australia")).toBe(true);
    expect(controlsContinent(territories, "player1", "asia")).toBe(false);
    expect(controlsContinent(territories, "player2", "australia")).toBe(false);
  });

  it("continent bonus troops sum to 24", () => {
    const total = Object.values(CONTINENTS).reduce(
      (sum, c) => sum + c.bonusTroops,
      0,
    );
    expect(total).toBe(24);
  });

  it("cross-continent connections exist", () => {
    // Key cross-map links
    expect(areAdjacent("alaska", "kamchatka")).toBe(true);      // NA ↔ Asia
    expect(areAdjacent("greenland", "great-britain")).toBe(true); // NA ↔ Europe
    expect(areAdjacent("central-america", "venezuela")).toBe(true); // NA ↔ SA
    expect(areAdjacent("brazil", "north-africa")).toBe(true);    // SA ↔ Africa
    expect(areAdjacent("western-europe", "north-africa")).toBe(true); // Europe ↔ Africa
    expect(areAdjacent("southern-europe", "middle-east")).toBe(true); // Europe ↔ Asia
    expect(areAdjacent("egypt", "middle-east")).toBe(true);      // Africa ↔ Asia
    expect(areAdjacent("east-africa", "middle-east")).toBe(true); // Africa ↔ Asia
    expect(areAdjacent("china", "indonesia")).toBe(true);        // Asia ↔ Australia
    expect(areAdjacent("india", "indonesia")).toBe(true);        // Asia ↔ Australia
  });
});
