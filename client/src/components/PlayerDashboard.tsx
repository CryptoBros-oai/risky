import type { Player } from "@risk/shared";
import { useGameStore } from "../store/gameStore";
import { playerColorMap } from "../utils/playerColors";
import styles from "./PlayerDashboard.module.css";

const renderPlayerRow = (player: Player, isCurrent: boolean, isLocal: boolean): JSX.Element => {
  return (
    <div key={player.id} className={styles.playerRow}>
      <span className={styles.playerName}>
        <span
          className={styles.colorDot}
          style={{ backgroundColor: playerColorMap[player.color] }}
        />
        {player.name}
      </span>
      <span className={styles.playerMeta}>
        {player.isEliminated ? "Eliminated" : `${player.territoryCount} terr.`}
        {isCurrent && !player.isEliminated ? " • Turn" : ""}
        {isLocal ? " • You" : ""}
      </span>
    </div>
  );
};

export const PlayerDashboard = (): JSX.Element => {
  const gameState = useGameStore((state) => state.gameState);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const localPlayerName = useGameStore((state) => state.localPlayerName);

  if (!gameState) {
    return (
      <div className={styles.panel}>
        <h2>Players</h2>
        <p className={styles.muted}>Waiting for game state...</p>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const localPlayer =
    gameState.players.find((player) => player.id === localPlayerId) ??
    (localPlayerName
      ? gameState.players.find((player) => player.name === localPlayerName)
      : undefined);

  return (
    <div className={styles.panel}>
      <h2>Players</h2>
      <div className={styles.turnRow}>
        <span>Phase</span>
        <strong>{gameState.phase}</strong>
      </div>
      <div className={styles.turnRow}>
        <span>Turn</span>
        <strong>{gameState.turnNumber}</strong>
      </div>
      <div className={styles.turnRow}>
        <span>Current</span>
        <strong>{currentPlayer?.name ?? "—"}</strong>
      </div>

      {localPlayer && (
        <div className={styles.localPanel}>
          <div className={styles.localHeader}>You</div>
          <div className={styles.localGrid}>
            <div>
              <span className={styles.label}>Reinforcements</span>
              <strong>{localPlayer.reinforcements}</strong>
            </div>
            <div>
              <span className={styles.label}>Cards</span>
              <strong>{localPlayer.cards.length}</strong>
            </div>
            <div>
              <span className={styles.label}>Territories</span>
              <strong>{localPlayer.territoryCount}</strong>
            </div>
            <div>
              <span className={styles.label}>Conquered</span>
              <strong>{gameState.hasConqueredThisTurn ? "Yes" : "No"}</strong>
            </div>
          </div>
        </div>
      )}

      <div className={styles.playerList}>
        {gameState.players.map((player) =>
          renderPlayerRow(
            player,
            player.id === currentPlayer?.id,
            player.id === localPlayer?.id
          )
        )}
      </div>
    </div>
  );
};
