// ============================================================
// Mini-Battle Engine — Tactical combat mode
// Converts troop counts into army compositions and validates
// battle results from the client-side real-time battle scene.
// ============================================================

import type {
  BattleArmy,
  MiniBattleState,
  MiniBattleResult,
  TerritoryId,
} from "@risk/shared";

// --------------- Army Composition ---------------
// Troop count → unit breakdown (inspired by North & South)
//
// Troops | Infantry | Cavalry | Cannons
// -------|----------|---------|--------
//   1    |    1     |    0    |    0
//   2    |    2     |    0    |    0
//   3    |    3     |    0    |    0
//   4    |    3     |    1    |    0
//   5    |    3     |    2    |    0
//   6    |    3     |    3    |    0
//   7    |    3     |    3    |    1
//   8    |    4     |    3    |    1
//   9    |    4     |    3    |    2
//  10    |    5     |    3    |    2
//  11    |    5     |    3    |    3
//  12+   |    6     |    3    |    3 (capped)

const MAX_INFANTRY = 6;
const MAX_CAVALRY = 3;
const MAX_CANNONS = 3;

export function troopsToArmy(
  playerId: string,
  territoryId: TerritoryId,
  troops: number,
): BattleArmy {
  let remaining = Math.max(1, troops);
  let infantry = 0;
  let cavalry = 0;
  let cannons = 0;

  // Infantry first (up to 3 base, then fill remaining)
  infantry = Math.min(remaining, 3);
  remaining -= infantry;

  // Cavalry next (up to 3)
  if (remaining > 0) {
    cavalry = Math.min(remaining, MAX_CAVALRY);
    remaining -= cavalry;
  }

  // Cannons next (up to 3)
  if (remaining > 0) {
    cannons = Math.min(remaining, MAX_CANNONS);
    remaining -= cannons;
  }

  // Any overflow goes back to infantry (up to cap)
  if (remaining > 0) {
    const extraInfantry = Math.min(remaining, MAX_INFANTRY - infantry);
    infantry += extraInfantry;
  }

  return {
    playerId,
    territoryId,
    infantry,
    cavalry,
    cannons,
    sourceTroops: troops,
  };
}

/** Total unit count for an army */
export function armyUnitCount(army: BattleArmy): number {
  return army.infantry + army.cavalry + army.cannons;
}

// --------------- Battle State ---------------

let battleCounter = 0;

export function createMiniBattle(
  attackerId: string,
  attackerTerritoryId: TerritoryId,
  attackerTroops: number,
  defenderId: string,
  defenderTerritoryId: TerritoryId,
  defenderTroops: number,
): MiniBattleState {
  battleCounter++;
  return {
    battleId: `battle-${Date.now()}-${battleCounter}`,
    attacker: troopsToArmy(attackerId, attackerTerritoryId, attackerTroops),
    defender: troopsToArmy(defenderId, defenderTerritoryId, defenderTroops),
    timeLimit: 60, // 60 seconds per battle
  };
}

// --------------- Result Validation ---------------
// Server validates the client-reported battle result to prevent cheating.

export interface ValidationResult {
  valid: boolean;
  error?: string;
  /** Troops remaining for attacker after battle */
  attackerTroopsRemaining: number;
  /** Troops remaining for defender after battle */
  defenderTroopsRemaining: number;
  conquered: boolean;
}

/** Convert surviving units back to troop count */
export function survivorsToTroops(survivors: {
  infantry: number;
  cavalry: number;
  cannons: number;
}): number {
  return survivors.infantry + survivors.cavalry + survivors.cannons;
}

export function validateBattleResult(
  battle: MiniBattleState,
  result: MiniBattleResult,
): ValidationResult {
  const invalid = (error: string): ValidationResult => ({
    valid: false,
    error,
    attackerTroopsRemaining: 0,
    defenderTroopsRemaining: 0,
    conquered: false,
  });

  // Battle ID must match
  if (result.battleId !== battle.battleId) {
    return invalid("Battle ID mismatch");
  }

  const aSurv = result.attackerSurvivors;
  const dSurv = result.defenderSurvivors;

  // Survivors can't exceed starting units
  if (aSurv.infantry > battle.attacker.infantry) return invalid("Attacker infantry exceeds start");
  if (aSurv.cavalry > battle.attacker.cavalry) return invalid("Attacker cavalry exceeds start");
  if (aSurv.cannons > battle.attacker.cannons) return invalid("Attacker cannons exceeds start");
  if (dSurv.infantry > battle.defender.infantry) return invalid("Defender infantry exceeds start");
  if (dSurv.cavalry > battle.defender.cavalry) return invalid("Defender cavalry exceeds start");
  if (dSurv.cannons > battle.defender.cannons) return invalid("Defender cannons exceeds start");

  // No negative values
  if (aSurv.infantry < 0 || aSurv.cavalry < 0 || aSurv.cannons < 0) return invalid("Negative attacker units");
  if (dSurv.infantry < 0 || dSurv.cavalry < 0 || dSurv.cannons < 0) return invalid("Negative defender units");

  // At least one side must be wiped out, OR both have survivors (partial retreat)
  const attackerAlive = survivorsToTroops(aSurv) > 0;
  const defenderAlive = survivorsToTroops(dSurv) > 0;

  // Both sides can't be fully alive (someone has to have taken losses)
  const attackerLosses =
    (battle.attacker.infantry - aSurv.infantry) +
    (battle.attacker.cavalry - aSurv.cavalry) +
    (battle.attacker.cannons - aSurv.cannons);
  const defenderLosses =
    (battle.defender.infantry - dSurv.infantry) +
    (battle.defender.cavalry - dSurv.cavalry) +
    (battle.defender.cannons - dSurv.cannons);

  if (attackerLosses === 0 && defenderLosses === 0) {
    return invalid("No casualties — someone must take losses");
  }

  const conquered = !defenderAlive && attackerAlive;

  return {
    valid: true,
    attackerTroopsRemaining: survivorsToTroops(aSurv),
    defenderTroopsRemaining: survivorsToTroops(dSurv),
    conquered,
  };
}

// --------------- AI Auto-Battle ---------------
// When AI is involved, server resolves the battle automatically using
// a simplified simulation instead of real-time client play.

export function simulateBattle(battle: MiniBattleState): MiniBattleResult {
  // Each unit type has attack power and HP
  // Infantry: 1 atk, 1 hp  |  Cavalry: 2 atk, 2 hp  |  Cannon: 3 atk, 3 hp
  let atkInf = battle.attacker.infantry;
  let atkCav = battle.attacker.cavalry;
  let atkCan = battle.attacker.cannons;
  let defInf = battle.defender.infantry;
  let defCav = battle.defender.cavalry;
  let defCan = battle.defender.cannons;

  // Simulate 10 rounds of exchange (or until one side is wiped)
  for (let round = 0; round < 10; round++) {
    const atkTotal = atkInf + atkCav + atkCan;
    const defTotal = defInf + defCav + defCan;
    if (atkTotal === 0 || defTotal === 0) break;

    // Attacker damage: each unit deals damage proportional to type
    const atkDamage = atkInf * 1 + atkCav * 2 + atkCan * 3;
    // Defender damage
    const defDamage = defInf * 1 + defCav * 2 + defCan * 3;

    // Apply attacker's damage to defender (weakest units die first)
    let dmgToApply = atkDamage;
    // Add randomness: effective damage is 60%-100% of calculated
    dmgToApply = Math.floor(dmgToApply * (0.6 + Math.random() * 0.4));

    // Kill defender infantry first, then cavalry, then cannons
    const defInfKilled = Math.min(defInf, Math.ceil(dmgToApply / 1));
    dmgToApply = Math.max(0, dmgToApply - defInfKilled * 1);
    defInf -= defInfKilled;

    const defCavKilled = Math.min(defCav, Math.ceil(dmgToApply / 2));
    dmgToApply = Math.max(0, dmgToApply - defCavKilled * 2);
    defCav -= defCavKilled;

    const defCanKilled = Math.min(defCan, Math.ceil(dmgToApply / 3));
    defCan -= defCanKilled;

    // Apply defender's damage to attacker
    let dmgToAtk = defDamage;
    dmgToAtk = Math.floor(dmgToAtk * (0.6 + Math.random() * 0.4));

    const atkInfKilled = Math.min(atkInf, Math.ceil(dmgToAtk / 1));
    dmgToAtk = Math.max(0, dmgToAtk - atkInfKilled * 1);
    atkInf -= atkInfKilled;

    const atkCavKilled = Math.min(atkCav, Math.ceil(dmgToAtk / 2));
    dmgToAtk = Math.max(0, dmgToAtk - atkCavKilled * 2);
    atkCav -= atkCavKilled;

    const atkCanKilled = Math.min(atkCan, Math.ceil(dmgToAtk / 3));
    atkCan -= atkCanKilled;
  }

  return {
    battleId: battle.battleId,
    attackerSurvivors: {
      infantry: Math.max(0, atkInf),
      cavalry: Math.max(0, atkCav),
      cannons: Math.max(0, atkCan),
    },
    defenderSurvivors: {
      infantry: Math.max(0, defInf),
      cavalry: Math.max(0, defCav),
      cannons: Math.max(0, defCan),
    },
  };
}
