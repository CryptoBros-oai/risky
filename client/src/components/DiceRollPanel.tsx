import { useEffect, useMemo, useState } from "react";
import type { GameEvent, TerritoryId } from "@risk/shared";
import { useGameStore } from "../store/gameStore";
import { territories } from "../utils/mapData";
import styles from "./DiceRollPanel.module.css";

const isCombatEvent = (event: GameEvent | null): event is Extract<GameEvent, { type: "combatResult" }> =>
  event?.type === "combatResult";

export const DiceRollPanel = (): JSX.Element => {
  const lastEvent = useGameStore((state) => state.lastEvent);
  const [rollKey, setRollKey] = useState(0);
  const territoryLookup = useMemo(() => {
    return new Map<TerritoryId, string>(territories.map((territory) => [territory.id, territory.name]));
  }, []);

  useEffect(() => {
    if (isCombatEvent(lastEvent)) {
      setRollKey((prev) => prev + 1);
    }
  }, [lastEvent]);

  if (!isCombatEvent(lastEvent)) {
    return (
      <div className={styles.panel}>
        <h2>Combat</h2>
        <p className={styles.muted}>Awaiting the next battle...</p>
      </div>
    );
  }

  const { result, attackerId, defenderId } = lastEvent;
  const attackerName = territoryLookup.get(attackerId) ?? attackerId;
  const defenderName = territoryLookup.get(defenderId) ?? defenderId;

  return (
    <div className={styles.panel}>
      <h2>Combat</h2>
      <div className={styles.subtitle}>
        {attackerName} → {defenderName}
      </div>
      <div className={styles.diceRow} key={rollKey}>
        <div className={styles.diceGroup}>
          <div className={styles.label}>Attacker</div>
          <div className={styles.diceList}>
            {result.roll.attacker.map((value, index) => (
              <div key={`a-${index}-${value}`} className={styles.die}>
                {value}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.diceGroup}>
          <div className={styles.label}>Defender</div>
          <div className={styles.diceList}>
            {result.roll.defender.map((value, index) => (
              <div key={`d-${index}-${value}`} className={styles.die}>
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.summary}>
        <span>Attacker losses: {result.attackerLosses}</span>
        <span>Defender losses: {result.defenderLosses}</span>
      </div>
      {result.conquered && <div className={styles.conquered}>Territory conquered!</div>}
    </div>
  );
};
