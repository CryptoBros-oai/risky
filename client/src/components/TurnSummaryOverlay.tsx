import { useMemo } from "react";
import type { GameEvent, GameState, LobbyState, TerritoryId } from "@risk/shared";
import { useGameStore } from "../store/gameStore";
import { territories } from "../utils/mapData";
import styles from "./TurnSummaryOverlay.module.css";

const buildNameLookup = (gameState: GameState | null, lobby: LobbyState | null): Map<string, string> => {
  const map = new Map<string, string>();
  if (lobby) {
    lobby.players.forEach((player) => map.set(player.id, player.name));
  }
  if (gameState) {
    gameState.players.forEach((player) => map.set(player.id, player.name));
  }
  return map;
};

const buildTerritoryLookup = (): Map<TerritoryId, string> => {
  return new Map(territories.map((territory) => [territory.id, territory.name]));
};

const describeEvent = (
  event: GameEvent,
  nameLookup: Map<string, string>,
  territoryLookup: Map<TerritoryId, string>
): string => {
  switch (event.type) {
    case "combatResult": {
      const from = territoryLookup.get(event.attackerId) ?? event.attackerId;
      const to = territoryLookup.get(event.defenderId) ?? event.defenderId;
      return `${from} → ${to} (A-${event.result.attackerLosses} / D-${event.result.defenderLosses})`;
    }
    case "cardAwarded":
      return `Card awarded to ${nameLookup.get(event.playerId) ?? event.playerId}`;
    case "playerEliminated":
      return `${nameLookup.get(event.playerId) ?? event.playerId} eliminated`;
    case "gameOver":
      return `Winner: ${nameLookup.get(event.winnerId) ?? event.winnerId}`;
    case "stateUpdate":
      return "State updated";
    case "chatMessage":
      return `${nameLookup.get(event.playerId) ?? event.playerId}: ${event.message}`;
    case "error":
      return `Error: ${event.message}`;
    default:
      return "Event";
  }
};

export const TurnSummaryOverlay = (): JSX.Element => {
  const gameState = useGameStore((state) => state.gameState);
  const lobby = useGameStore((state) => state.lobby);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const eventLog = useGameStore((state) => state.eventLog);
  const connectionStatus = useGameStore((state) => state.connectionStatus);

  const nameLookup = useMemo(() => buildNameLookup(gameState, lobby), [gameState, lobby]);
  const territoryLookup = useMemo(() => buildTerritoryLookup(), []);

  const currentPlayer = gameState?.players[gameState.currentPlayerIndex];
  const localPlayer =
    gameState?.players.find((player) => player.id === localPlayerId) ?? null;

  const recentEvents = useMemo(() => {
    return eventLog
      .filter((item) => item.kind === "event" && item.event.type !== "chatMessage")
      .slice(-3)
      .reverse()
      .map((item) => {
        if (item.kind !== "event") {
          return null;
        }
        return {
          id: item.id,
          message: describeEvent(item.event, nameLookup, territoryLookup)
        };
      })
      .filter((item): item is { id: string; message: string } => Boolean(item));
  }, [eventLog, nameLookup, territoryLookup]);

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Turn Summary</div>
        <div className={styles.row}>
          <span>Status</span>
          <strong>{connectionStatus}</strong>
        </div>
        <div className={styles.row}>
          <span>Phase</span>
          <strong>{gameState?.phase ?? "—"}</strong>
        </div>
        <div className={styles.row}>
          <span>Turn</span>
          <strong>{gameState?.turnNumber ?? 0}</strong>
        </div>
        <div className={styles.row}>
          <span>Current</span>
          <strong>{currentPlayer?.name ?? "—"}</strong>
        </div>
        {localPlayer && (
          <div className={styles.row}>
            <span>Reinforcements</span>
            <strong>{localPlayer.reinforcements}</strong>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Action Log</div>
        {recentEvents.length === 0 ? (
          <div className={styles.muted}>No actions yet.</div>
        ) : (
          <ul className={styles.logList}>
            {recentEvents.map((event) => (
              <li key={event.id}>{event.message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
