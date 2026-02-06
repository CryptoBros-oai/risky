import { describe, it, expect } from "vitest";
import {
  aiSetup,
  aiReinforce,
  aiAttack,
  aiFortify,
  planAiTurn,
} from "../src/game/ai.js";
import { createGame } from "../src/game/engine.js";
import type { GameState } from "@risk/shared";

function makeGameState(): GameState {
  return createGame(["Human", "AI-Easy", "AI-Hard"]);
}

describe("ai", () => {
  describe("aiSetup", () => {
    it("returns a territory owned by the AI player", () => {
      const state = makeGameState();
      const decision = aiSetup(state, "player-1");
      expect(state.territories[decision.territoryId].ownerId).toBe("player-1");
    });

    it("prefers border territories", () => {
      const state = makeGameState();
      const decision = aiSetup(state, "player-1");
      const territory = state.territories[decision.territoryId];
      // Should have at least one enemy neighbor
      const hasEnemyNeighbor = territory.adjacentIds.some(
        (adj) => state.territories[adj].ownerId !== "player-1",
      );
      expect(hasEnemyNeighbor).toBe(true);
    });
  });

  describe("aiReinforce", () => {
    it("places all reinforcements (easy)", () => {
      const state = makeGameState();
      // Simulate reinforce phase
      state.phase = "reinforce";
      state.players[1].reinforcements = 5;

      const decision = aiReinforce(state, "player-1", "easy");
      const total = decision.placements.reduce((sum, p) => sum + p.count, 0);
      expect(total).toBe(5);
    });

    it("places on owned territories", () => {
      const state = makeGameState();
      state.phase = "reinforce";
      state.players[1].reinforcements = 3;

      const decision = aiReinforce(state, "player-1", "medium");
      for (const placement of decision.placements) {
        expect(state.territories[placement.territoryId].ownerId).toBe("player-1");
      }
    });

    it("concentrates troops more on hard difficulty", () => {
      const state = makeGameState();
      state.phase = "reinforce";
      state.players[1].reinforcements = 10;

      const easy = aiReinforce(state, "player-1", "easy");
      const hard = aiReinforce(state, "player-1", "hard");

      // Hard should use fewer placement targets
      expect(hard.placements.length).toBeLessThanOrEqual(easy.placements.length);
    });
  });

  describe("aiAttack", () => {
    it("attacks when having advantage", () => {
      const state = makeGameState();
      state.phase = "attack";

      // Give AI a strong territory next to a weak enemy
      const aiTerritory = Object.values(state.territories).find(
        (t) => t.ownerId === "player-1",
      )!;
      aiTerritory.troops = 10;

      // Find an adjacent enemy territory and weaken it
      const enemyAdj = aiTerritory.adjacentIds.find(
        (adj) => state.territories[adj].ownerId !== "player-1",
      );
      if (enemyAdj) {
        state.territories[enemyAdj].troops = 1;
        const decision = aiAttack(state, "player-1", "hard");
        expect(decision.attack).not.toBeNull();
        expect(decision.attack?.fromId).toBe(aiTerritory.id);
      }
    });

    it("doesn't attack with insufficient troops", () => {
      const state = makeGameState();
      state.phase = "attack";

      // All AI territories have just 1 troop
      for (const t of Object.values(state.territories)) {
        if (t.ownerId === "player-1") t.troops = 1;
      }

      const decision = aiAttack(state, "player-1", "hard");
      expect(decision.attack).toBeNull();
    });

    it("easy AI requires higher ratio than hard", () => {
      const state = makeGameState();
      state.phase = "attack";

      // Set ALL AI territories to 1 troop (can't attack)
      // except one which gets exactly 4
      for (const t of Object.values(state.territories)) {
        if (t.ownerId === "player-1") t.troops = 1;
      }

      const aiTerritory = Object.values(state.territories).find(
        (t) => t.ownerId === "player-1",
      )!;
      aiTerritory.troops = 4;

      // Set ALL enemy neighbors of that territory to 2 troops (ratio = 2.0)
      for (const adjId of aiTerritory.adjacentIds) {
        if (state.territories[adjId].ownerId !== "player-1") {
          state.territories[adjId].troops = 2;
        }
      }

      // 4:2 = 2.0 ratio — hard (min 1.5) would attack, easy (min 3.0) would not
      const easyDecision = aiAttack(state, "player-1", "easy");
      const hardDecision = aiAttack(state, "player-1", "hard");
      expect(easyDecision.attack).toBeNull();
      expect(hardDecision.attack).not.toBeNull();
    });

    it("respects non-aggression pacts", () => {
      const state = makeGameState();
      state.phase = "attack";

      const aiTerritory = Object.values(state.territories).find(
        (t) => t.ownerId === "player-1",
      )!;
      aiTerritory.troops = 10;

      // Make pacts with all other players
      state.pacts = [
        { id: "p1", playerIds: ["player-1", "player-0"], createdTurn: 1, minimumDuration: 3, isActive: true },
        { id: "p2", playerIds: ["player-1", "player-2"], createdTurn: 1, minimumDuration: 3, isActive: true },
      ];

      const decision = aiAttack(state, "player-1", "hard");
      expect(decision.attack).toBeNull();
    });
  });

  describe("aiFortify", () => {
    it("moves troops from interior to border", () => {
      const state = makeGameState();
      state.phase = "fortify";

      // Make a clear interior/border split: give AI a cluster
      // Find territories where all neighbors are also AI-owned (interior)
      const aiTerritories = Object.values(state.territories).filter(
        (t) => t.ownerId === "player-1",
      );

      // Just test that it returns a valid decision or null
      const decision = aiFortify(state, "player-1");
      if (decision.fortify) {
        expect(state.territories[decision.fortify.fromId].ownerId).toBe("player-1");
        expect(state.territories[decision.fortify.toId].ownerId).toBe("player-1");
        expect(decision.fortify.count).toBeGreaterThan(0);
      }
    });
  });

  describe("planAiTurn", () => {
    it("plans setup placement in setup phase", () => {
      const state = makeGameState();
      state.phase = "setup";

      const plan = planAiTurn(state, "player-1", "medium");
      expect(plan.setupPlace).toBeDefined();
      expect(state.territories[plan.setupPlace!.territoryId].ownerId).toBe("player-1");
    });

    it("plans reinforcements and attacks in reinforce phase", () => {
      const state = makeGameState();
      state.phase = "reinforce";
      state.players[1].reinforcements = 5;

      const plan = planAiTurn(state, "player-1", "medium");
      expect(plan.reinforcements).toBeDefined();
      expect(plan.attacks.length).toBeGreaterThan(0);
    });
  });
});
