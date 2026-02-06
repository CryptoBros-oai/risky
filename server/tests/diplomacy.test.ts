import { describe, it, expect } from "vitest";
import { createPact, acceptPact, havePact, breakPact } from "../src/game/diplomacy.js";
import { createGame } from "../src/game/engine.js";
import type { GameState } from "@risk/shared";

// Helper to make a state with known troop counts
function stateWithTroops(troopsPerTerritory: number): GameState {
  const state = createGame(["Alice", "Bob", "Charlie"]);
  for (const t of Object.values(state.territories)) {
    t.troops = troopsPerTerritory;
  }
  return state;
}

describe("diplomacy", () => {
  describe("createPact", () => {
    it("creates a pact with correct players", () => {
      const pact = createPact("player-0", "player-1", 5);
      expect(pact.playerIds).toEqual(["player-0", "player-1"]);
      expect(pact.createdTurn).toBe(5);
      expect(pact.isActive).toBe(false);
    });
  });

  describe("acceptPact", () => {
    it("activates the pact", () => {
      const state = stateWithTroops(3);
      const pact = createPact("player-0", "player-1", 1);
      state.pacts.push(pact);

      const next = acceptPact(state, pact.id);
      expect(next.pacts.find((p) => p.id === pact.id)?.isActive).toBe(true);
    });

    it("throws for unknown pact", () => {
      const state = stateWithTroops(3);
      expect(() => acceptPact(state, "nonexistent")).toThrow("Pact not found");
    });
  });

  describe("havePact", () => {
    it("returns true for active pact", () => {
      const state = stateWithTroops(3);
      const pact = createPact("player-0", "player-1", 1);
      pact.isActive = true;
      state.pacts.push(pact);

      expect(havePact(state, "player-0", "player-1")).toBe(true);
      expect(havePact(state, "player-1", "player-0")).toBe(true);
    });

    it("returns false for inactive pact", () => {
      const state = stateWithTroops(3);
      const pact = createPact("player-0", "player-1", 1);
      state.pacts.push(pact);

      expect(havePact(state, "player-0", "player-1")).toBe(false);
    });

    it("returns false for unrelated players", () => {
      const state = stateWithTroops(3);
      const pact = createPact("player-0", "player-1", 1);
      pact.isActive = true;
      state.pacts.push(pact);

      expect(havePact(state, "player-0", "player-2")).toBe(false);
    });
  });

  describe("breakPact", () => {
    it("deactivates pact and applies desertion", () => {
      const state = stateWithTroops(10);
      const pact = createPact("player-0", "player-1", 1);
      pact.isActive = true;
      state.pacts.push(pact);

      const { state: next, penalty } = breakPact(state, pact.id, "player-0", 0.10);

      // Pact deactivated
      expect(next.pacts.find((p) => p.id === pact.id)?.isActive).toBe(false);

      // Penalty applied
      expect(penalty.breakerId).toBe("player-0");
      expect(penalty.desertionRate).toBe(0.10);
      expect(penalty.troopsLost).toBeGreaterThan(0);
      expect(penalty.affectedTerritories.length).toBeGreaterThan(0);

      // Troops actually removed
      const totalBefore = Object.values(state.territories)
        .filter((t) => t.ownerId === "player-0")
        .reduce((sum, t) => sum + t.troops, 0);
      const totalAfter = Object.values(next.territories)
        .filter((t) => t.ownerId === "player-0")
        .reduce((sum, t) => sum + t.troops, 0);
      expect(totalAfter).toBe(totalBefore - penalty.troopsLost);
    });

    it("always leaves at least 1 troop per territory", () => {
      const state = stateWithTroops(2); // Low troop count
      const pact = createPact("player-0", "player-1", 1);
      pact.isActive = true;
      state.pacts.push(pact);

      const { state: next } = breakPact(state, pact.id, "player-0", 0.10);

      for (const t of Object.values(next.territories)) {
        if (t.ownerId === "player-0") {
          expect(t.troops).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it("clamps desertion rate to 5-10%", () => {
      const state = stateWithTroops(10);
      const pact = createPact("player-0", "player-1", 1);
      pact.isActive = true;
      state.pacts.push(pact);

      // Try 50% — should clamp to 10%
      const { penalty } = breakPact(state, pact.id, "player-0", 0.50);
      expect(penalty.desertionRate).toBe(0.10);
    });

    it("throws for non-member breaking pact", () => {
      const state = stateWithTroops(10);
      const pact = createPact("player-0", "player-1", 1);
      pact.isActive = true;
      state.pacts.push(pact);

      expect(() => breakPact(state, pact.id, "player-2", 0.07)).toThrow(
        "Player not in this pact",
      );
    });
  });
});
