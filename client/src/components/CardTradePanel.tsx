import { useEffect, useMemo, useState } from "react";
import type { TerritoryCard, TerritoryId } from "@risk/shared";
import { useGameStore } from "../store/gameStore";
import { territories } from "../utils/mapData";
import styles from "./CardTradePanel.module.css";

const cardLabelMap: Record<TerritoryCard["type"], string> = {
  infantry: "Inf",
  cavalry: "Cav",
  artillery: "Art",
  wild: "Wild"
};

const buildTerritoryLookup = (): Map<TerritoryId, string> => {
  return new Map(territories.map((territory) => [territory.id, territory.name]));
};

export const CardTradePanel = (): JSX.Element => {
  const gameState = useGameStore((state) => state.gameState);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const tradeCards = useGameStore((state) => state.tradeCards);

  const territoryLookup = useMemo(() => buildTerritoryLookup(), []);

  const localPlayer =
    gameState?.players.find((player) => player.id === localPlayerId) ?? null;

  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!localPlayer) {
      setSelected([]);
      return;
    }
    const validIds = new Set(localPlayer.cards.map((card) => card.id));
    setSelected((current) => current.filter((id) => validIds.has(id)));
  }, [localPlayer]);

  if (!localPlayer) {
    return (
      <div className={styles.panel}>
        <h2>Cards</h2>
        <p className={styles.muted}>Waiting for cards...</p>
      </div>
    );
  }

  const cards = localPlayer.cards;
  const canTrade = selected.length === 3;
  const mustTrade = cards.length >= 5;

  const toggleCard = (cardId: string): void => {
    setSelected((current) => {
      if (current.includes(cardId)) {
        return current.filter((id) => id !== cardId);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, cardId];
    });
  };

  const handleTrade = (): void => {
    if (selected.length !== 3) return;
    tradeCards([selected[0], selected[1], selected[2]]);
    setSelected([]);
  };

  return (
    <div className={styles.panel}>
      <h2>Cards</h2>
      <div className={styles.summary}>
        <span>Owned</span>
        <strong>{cards.length}</strong>
      </div>
      {mustTrade && <div className={styles.warning}>Must trade (5+ cards)</div>}
      <div className={styles.cardGrid}>
        {cards.length === 0 ? (
          <div className={styles.muted}>No cards yet.</div>
        ) : (
          cards.map((card) => {
            const territoryName = card.territoryId
              ? territoryLookup.get(card.territoryId) ?? card.territoryId
              : "Wild";
            const isSelected = selected.includes(card.id);
            return (
              <button
                key={card.id}
                type="button"
                className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                onClick={() => toggleCard(card.id)}
              >
                <div className={styles.cardType}>{cardLabelMap[card.type]}</div>
                <div className={styles.cardName}>{territoryName}</div>
              </button>
            );
          })
        )}
      </div>
      <button
        type="button"
        className={styles.tradeButton}
        disabled={!canTrade || gameState?.phase !== "reinforce"}
        onClick={handleTrade}
      >
        Trade Selected
      </button>
      {gameState?.phase !== "reinforce" && (
        <div className={styles.muted}>Trade-in available during reinforce phase.</div>
      )}
    </div>
  );
};
