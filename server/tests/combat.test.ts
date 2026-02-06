import { describe, it, expect } from "vitest";
import {
  resolveCombat,
  maxAttackDice,
  maxDefendDice,
  isValidAttackDice,
  isValidDefendDice,
} from "../src/game/combat.js";

describe("combat", () => {
  describe("resolveCombat", () => {
    it("attacker wins when rolling higher", () => {
      const result = resolveCombat([6], [3]);
      expect(result.attackerLosses).toBe(0);
      expect(result.defenderLosses).toBe(1);
    });

    it("defender wins ties", () => {
      const result = resolveCombat([4], [4]);
      expect(result.attackerLosses).toBe(1);
      expect(result.defenderLosses).toBe(0);
    });

    it("compares pairs in order (3v2)", () => {
      // Attacker: 6,3,1 vs Defender: 5,2
      const result = resolveCombat([6, 3, 1], [5, 2]);
      // 6 vs 5 → defender loses, 3 vs 2 → defender loses
      expect(result.attackerLosses).toBe(0);
      expect(result.defenderLosses).toBe(2);
    });

    it("split result (3v2)", () => {
      // Attacker: 5,2,1 vs Defender: 6,1
      const result = resolveCombat([5, 2, 1], [6, 1]);
      // 5 vs 6 → attacker loses, 2 vs 1 → defender loses
      expect(result.attackerLosses).toBe(1);
      expect(result.defenderLosses).toBe(1);
    });

    it("sorts dice before comparing", () => {
      // Unsorted input should be sorted descending
      const result = resolveCombat([1, 6], [2, 5]);
      // Sorted: [6,1] vs [5,2] → 6>5 def loses, 1<2 atk loses
      expect(result.attackerLosses).toBe(1);
      expect(result.defenderLosses).toBe(1);
    });

    it("only compares min(atk, def) pairs", () => {
      // 3 attacker dice vs 1 defender die → only 1 comparison
      const result = resolveCombat([6, 5, 4], [3]);
      expect(result.attackerLosses).toBe(0);
      expect(result.defenderLosses).toBe(1);
    });

    it("conquered starts as false", () => {
      const result = resolveCombat([6], [1]);
      expect(result.conquered).toBe(false);
    });
  });

  describe("dice limits", () => {
    it("maxAttackDice is troops-1, capped at 3", () => {
      expect(maxAttackDice(2)).toBe(1);
      expect(maxAttackDice(3)).toBe(2);
      expect(maxAttackDice(4)).toBe(3);
      expect(maxAttackDice(10)).toBe(3);
    });

    it("maxDefendDice is min(troops, 2)", () => {
      expect(maxDefendDice(1)).toBe(1);
      expect(maxDefendDice(2)).toBe(2);
      expect(maxDefendDice(5)).toBe(2);
    });

    it("validates attack dice correctly", () => {
      expect(isValidAttackDice(1, 2)).toBe(true);
      expect(isValidAttackDice(2, 2)).toBe(false); // Can't use 2 with only 2 troops
      expect(isValidAttackDice(3, 4)).toBe(true);
      expect(isValidAttackDice(0, 4)).toBe(false);
    });

    it("validates defend dice correctly", () => {
      expect(isValidDefendDice(1, 1)).toBe(true);
      expect(isValidDefendDice(2, 1)).toBe(false);
      expect(isValidDefendDice(2, 5)).toBe(true);
    });
  });
});
