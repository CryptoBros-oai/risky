import { describe, it, expect } from "vitest";
import {
  territoryReinforcements,
  continentBonuses,
  cardSetBonus,
} from "../src/game/reinforcements.js";
import { createTerritories, CONTINENTS } from "../src/game/mapData.js";

describe("reinforcements", () => {
  describe("territoryReinforcements", () => {
    it("returns minimum 3 for small territory counts", () => {
      expect(territoryReinforcements(1)).toBe(3);
      expect(territoryReinforcements(6)).toBe(3);
      expect(territoryReinforcements(9)).toBe(3);
    });

    it("returns floor(count/3) when > 9", () => {
      expect(territoryReinforcements(10)).toBe(3);
      expect(territoryReinforcements(12)).toBe(4);
      expect(territoryReinforcements(15)).toBe(5);
      expect(territoryReinforcements(34)).toBe(11);
    });
  });

  describe("continentBonuses", () => {
    it("returns 0 when player controls no full continent", () => {
      const territories = createTerritories();
      // Give player1 just alaska
      territories["alaska"].ownerId = "player1";
      expect(continentBonuses(territories, "player1")).toBe(0);
    });

    it("returns correct bonus for controlling Australia", () => {
      const territories = createTerritories();
      for (const tid of CONTINENTS["australia"].territoryIds) {
        territories[tid].ownerId = "player1";
      }
      expect(continentBonuses(territories, "player1")).toBe(2);
    });

    it("returns combined bonus for multiple continents", () => {
      const territories = createTerritories();
      for (const tid of CONTINENTS["australia"].territoryIds) {
        territories[tid].ownerId = "player1";
      }
      for (const tid of CONTINENTS["south-america"].territoryIds) {
        territories[tid].ownerId = "player1";
      }
      // Australia(2) + South America(2) = 4
      expect(continentBonuses(territories, "player1")).toBe(4);
    });

    it("does not count continent if one territory is missing", () => {
      const territories = createTerritories();
      for (const tid of CONTINENTS["europe"].territoryIds) {
        territories[tid].ownerId = "player1";
      }
      // Remove one territory
      territories["ukraine"].ownerId = "player2";
      expect(continentBonuses(territories, "player1")).toBe(0);
    });
  });

  describe("cardSetBonus", () => {
    it("returns progressive bonuses", () => {
      expect(cardSetBonus(0)).toBe(4);
      expect(cardSetBonus(1)).toBe(6);
      expect(cardSetBonus(2)).toBe(8);
      expect(cardSetBonus(3)).toBe(10);
      expect(cardSetBonus(4)).toBe(12);
      expect(cardSetBonus(5)).toBe(15);
    });

    it("increments by 5 after 6th set", () => {
      expect(cardSetBonus(6)).toBe(20);
      expect(cardSetBonus(7)).toBe(25);
      expect(cardSetBonus(8)).toBe(30);
    });
  });
});
