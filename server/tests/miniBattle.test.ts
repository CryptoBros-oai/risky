import { describe, it, expect } from "vitest";
import {
  troopsToArmy,
  armyUnitCount,
  createMiniBattle,
  validateBattleResult,
  survivorsToTroops,
  simulateBattle,
} from "../src/game/miniBattle.js";

describe("miniBattle", () => {
  describe("troopsToArmy", () => {
    it("1-3 troops → infantry only", () => {
      expect(troopsToArmy("p1", "alaska", 1)).toMatchObject({ infantry: 1, cavalry: 0, cannons: 0 });
      expect(troopsToArmy("p1", "alaska", 2)).toMatchObject({ infantry: 2, cavalry: 0, cannons: 0 });
      expect(troopsToArmy("p1", "alaska", 3)).toMatchObject({ infantry: 3, cavalry: 0, cannons: 0 });
    });

    it("4-6 troops → infantry + cavalry", () => {
      const a4 = troopsToArmy("p1", "brazil", 4);
      expect(a4.infantry).toBe(3);
      expect(a4.cavalry).toBe(1);
      expect(a4.cannons).toBe(0);

      const a6 = troopsToArmy("p1", "brazil", 6);
      expect(a6.infantry).toBe(3);
      expect(a6.cavalry).toBe(3);
      expect(a6.cannons).toBe(0);
    });

    it("7-9 troops → infantry + cavalry + cannons", () => {
      const a7 = troopsToArmy("p1", "egypt", 7);
      expect(a7.infantry).toBe(3);
      expect(a7.cavalry).toBe(3);
      expect(a7.cannons).toBe(1);

      const a9 = troopsToArmy("p1", "egypt", 9);
      expect(a9.infantry).toBe(3);
      expect(a9.cavalry).toBe(3);
      expect(a9.cannons).toBe(3);
    });

    it("10+ troops → fills infantry up to 6", () => {
      const a10 = troopsToArmy("p1", "china", 10);
      expect(a10.infantry).toBe(4);
      expect(a10.cavalry).toBe(3);
      expect(a10.cannons).toBe(3);

      const a12 = troopsToArmy("p1", "china", 12);
      expect(a12.infantry).toBe(6);
      expect(a12.cavalry).toBe(3);
      expect(a12.cannons).toBe(3);
    });

    it("caps at 6/3/3 for very large troop counts", () => {
      const a50 = troopsToArmy("p1", "india", 50);
      expect(a50.infantry).toBe(6);
      expect(a50.cavalry).toBe(3);
      expect(a50.cannons).toBe(3);
    });

    it("stores sourceTroops", () => {
      const army = troopsToArmy("p1", "alaska", 15);
      expect(army.sourceTroops).toBe(15);
    });
  });

  describe("armyUnitCount", () => {
    it("sums all unit types", () => {
      const army = troopsToArmy("p1", "alaska", 8);
      expect(armyUnitCount(army)).toBe(army.infantry + army.cavalry + army.cannons);
    });
  });

  describe("createMiniBattle", () => {
    it("creates battle with correct armies", () => {
      const battle = createMiniBattle("p1", "alaska", 5, "p2", "kamchatka", 3);
      expect(battle.attacker.playerId).toBe("p1");
      expect(battle.defender.playerId).toBe("p2");
      expect(battle.attacker.infantry).toBe(3);
      expect(battle.attacker.cavalry).toBe(2);
      expect(battle.defender.infantry).toBe(3);
      expect(battle.timeLimit).toBe(60);
    });
  });

  describe("validateBattleResult", () => {
    it("accepts valid result where defender is wiped", () => {
      const battle = createMiniBattle("p1", "alaska", 5, "p2", "kamchatka", 3);
      const result = validateBattleResult(battle, {
        battleId: battle.battleId,
        attackerSurvivors: { infantry: 2, cavalry: 1, cannons: 0 },
        defenderSurvivors: { infantry: 0, cavalry: 0, cannons: 0 },
      });
      expect(result.valid).toBe(true);
      expect(result.conquered).toBe(true);
      expect(result.attackerTroopsRemaining).toBe(3);
    });

    it("accepts valid result where attacker is wiped", () => {
      const battle = createMiniBattle("p1", "alaska", 3, "p2", "kamchatka", 5);
      const result = validateBattleResult(battle, {
        battleId: battle.battleId,
        attackerSurvivors: { infantry: 0, cavalry: 0, cannons: 0 },
        defenderSurvivors: { infantry: 2, cavalry: 1, cannons: 0 },
      });
      expect(result.valid).toBe(true);
      expect(result.conquered).toBe(false);
    });

    it("rejects battle ID mismatch", () => {
      const battle = createMiniBattle("p1", "alaska", 5, "p2", "kamchatka", 3);
      const result = validateBattleResult(battle, {
        battleId: "wrong-id",
        attackerSurvivors: { infantry: 1, cavalry: 0, cannons: 0 },
        defenderSurvivors: { infantry: 0, cavalry: 0, cannons: 0 },
      });
      expect(result.valid).toBe(false);
    });

    it("rejects survivors exceeding starting units", () => {
      const battle = createMiniBattle("p1", "alaska", 3, "p2", "kamchatka", 3);
      const result = validateBattleResult(battle, {
        battleId: battle.battleId,
        attackerSurvivors: { infantry: 5, cavalry: 0, cannons: 0 },
        defenderSurvivors: { infantry: 0, cavalry: 0, cannons: 0 },
      });
      expect(result.valid).toBe(false);
    });

    it("rejects zero casualties", () => {
      const battle = createMiniBattle("p1", "alaska", 3, "p2", "kamchatka", 3);
      const result = validateBattleResult(battle, {
        battleId: battle.battleId,
        attackerSurvivors: { infantry: 3, cavalry: 0, cannons: 0 },
        defenderSurvivors: { infantry: 3, cavalry: 0, cannons: 0 },
      });
      expect(result.valid).toBe(false);
    });
  });

  describe("simulateBattle (AI auto-battle)", () => {
    it("produces a result with valid survivors", () => {
      const battle = createMiniBattle("p1", "alaska", 8, "p2", "kamchatka", 4);
      const result = simulateBattle(battle);

      expect(result.battleId).toBe(battle.battleId);
      expect(result.attackerSurvivors.infantry).toBeLessThanOrEqual(battle.attacker.infantry);
      expect(result.attackerSurvivors.cavalry).toBeLessThanOrEqual(battle.attacker.cavalry);
      expect(result.attackerSurvivors.cannons).toBeLessThanOrEqual(battle.attacker.cannons);
      expect(result.defenderSurvivors.infantry).toBeLessThanOrEqual(battle.defender.infantry);

      // Validate it passes validation
      const validation = validateBattleResult(battle, result);
      expect(validation.valid).toBe(true);
    });

    it("larger army usually wins (statistical)", () => {
      let largerWins = 0;
      for (let i = 0; i < 50; i++) {
        const battle = createMiniBattle("p1", "alaska", 12, "p2", "kamchatka", 3);
        const result = simulateBattle(battle);
        if (survivorsToTroops(result.attackerSurvivors) > 0) largerWins++;
      }
      // 12 vs 3 should win almost always
      expect(largerWins).toBeGreaterThan(40);
    });
  });
});
