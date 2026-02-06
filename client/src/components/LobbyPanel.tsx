import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import styles from "./LobbyPanel.module.css";

export const LobbyPanel = (): JSX.Element => {
  const {
    connectionStatus,
    connectionError,
    lobby,
    connect,
    disconnect,
    createLobby,
    joinLobby,
    setReady,
    startGame
  } = useGameStore();

  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleConnect = async (): Promise<void> => {
    setActionError(null);
    setBusy(true);
    try {
      await connect();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to connect");
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async (): Promise<void> => {
    if (!playerName.trim()) {
      setActionError("Enter a player name");
      return;
    }

    setActionError(null);
    setBusy(true);
    try {
      const id = await createLobby(playerName.trim());
      setGameId(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to create lobby");
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async (): Promise<void> => {
    if (!playerName.trim() || !gameId.trim()) {
      setActionError("Enter name and game ID");
      return;
    }

    setActionError(null);
    setBusy(true);
    try {
      const result = await joinLobby(gameId.trim(), playerName.trim());
      if (!result.ok) {
        setActionError(result.error ?? "Unable to join lobby");
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Failed to join lobby");
    } finally {
      setBusy(false);
    }
  };

  const statusLabel =
    connectionStatus === "connected"
      ? "Connected"
      : connectionStatus === "connecting"
        ? "Connecting..."
        : "Disconnected";

  return (
    <div className={styles.panel}>
      <h2>Lobby</h2>
      <div className={styles.statusRow}>
        <span>Status</span>
        <strong className={styles.statusValue}>{statusLabel}</strong>
      </div>

      {connectionError && <div className={styles.error}>{connectionError}</div>}
      {actionError && <div className={styles.error}>{actionError}</div>}

      <label className={styles.label}>
        Player name
        <input
          className={styles.input}
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          placeholder="Commander"
        />
      </label>

      <label className={styles.label}>
        Game ID
        <input
          className={styles.input}
          value={gameId}
          onChange={(event) => setGameId(event.target.value)}
          placeholder="RISK-XXXX-1"
        />
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={handleConnect} disabled={busy}>
          Connect
        </button>
        <button type="button" className={styles.button} onClick={disconnect} disabled={busy}>
          Disconnect
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={handleCreate}
          disabled={busy}
        >
          Create
        </button>
        <button type="button" className={styles.button} onClick={handleJoin} disabled={busy}>
          Join
        </button>
      </div>

      {lobby && (
        <>
          <div className={styles.lobbyMeta}>
            <span>Game</span>
            <strong>{lobby.gameId}</strong>
          </div>
          <div className={styles.players}>
            {lobby.players.map((player) => (
              <div key={player.id} className={styles.playerRow}>
                <span>{player.name}</span>
                <span className={styles.playerStatus}>
                  {player.isHost ? "Host" : player.isReady ? "Ready" : "Waiting"}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={setReady}
              disabled={busy}
            >
              Ready
            </button>
            <button type="button" className={styles.button} onClick={startGame} disabled={busy}>
              Start
            </button>
          </div>
        </>
      )}
    </div>
  );
};
