import type { DiceRoll, CombatResult } from "@risk/shared";

/** Roll n dice, return sorted descending */
export function rollDice(count: number): number[] {
  const results: number[] = [];
  for (let i = 0; i < count; i++) {
    results.push(Math.floor(Math.random() * 6) + 1);
  }
  return results.sort((a, b) => b - a);
}

/** Resolve a single round of combat given pre-rolled dice */
export function resolveCombat(
  attackerDice: number[],
  defenderDice: number[],
): CombatResult {
  const roll: DiceRoll = {
    attacker: [...attackerDice].sort((a, b) => b - a),
    defender: [...defenderDice].sort((a, b) => b - a),
  };

  let attackerLosses = 0;
  let defenderLosses = 0;

  // Compare pairs of highest dice
  const comparisons = Math.min(roll.attacker.length, roll.defender.length);
  for (let i = 0; i < comparisons; i++) {
    if (roll.attacker[i] > roll.defender[i]) {
      defenderLosses++;
    } else {
      // Ties go to defender
      attackerLosses++;
    }
  }

  return {
    roll,
    attackerLosses,
    defenderLosses,
    conquered: false, // Caller determines this based on remaining troops
  };
}

/** Determine the max dice an attacker can roll (1-3, must leave 1 troop behind) */
export function maxAttackDice(attackerTroops: number): number {
  return Math.min(3, attackerTroops - 1);
}

/** Determine the max dice a defender can roll (1-2) */
export function maxDefendDice(defenderTroops: number): number {
  return Math.min(2, defenderTroops);
}

/** Validate attack dice count */
export function isValidAttackDice(dice: number, attackerTroops: number): boolean {
  return dice >= 1 && dice <= maxAttackDice(attackerTroops);
}

/** Validate defend dice count */
export function isValidDefendDice(dice: number, defenderTroops: number): boolean {
  return dice >= 1 && dice <= maxDefendDice(defenderTroops);
}
