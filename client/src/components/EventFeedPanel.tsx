import { useMemo } from "react";
import type { GameEvent, LobbyState, GameState, TerritoryId } from "@risk/shared";
import { useGameStore } from "../store/gameStore";
import { territories } from "../utils/mapData";
import { playerColorMap } from "../utils/playerColors";
import styles from "./EventFeedPanel.module.css";

type FeedLine = {
  id: string;
  message: string;
  color?: string;
  timestamp: number;
};

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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
      return `Combat: ${from} → ${to} (A-${event.result.attackerLosses} / D-${event.result.defenderLosses})`;
    }
    case "cardAwarded":
      return `Card awarded to ${nameLookup.get(event.playerId) ?? event.playerId}`;
    case "playerEliminated":
      return `${nameLookup.get(event.playerId) ?? event.playerId} was eliminated`;
    case "gameOver":
      return `Game over — winner: ${nameLookup.get(event.winnerId) ?? event.winnerId}`;
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

export const EventFeedPanel = (): JSX.Element => {
  const eventLog = useGameStore((state) => state.eventLog);
  const gameState = useGameStore((state) => state.gameState);
  const lobby = useGameStore((state) => state.lobby);

  const nameLookup = useMemo(() => buildNameLookup(gameState, lobby), [gameState, lobby]);
  const territoryLookup = useMemo(() => buildTerritoryLookup(), []);

  const feed = useMemo<FeedLine[]>(() => {
    const entries = eventLog
      .filter((item) => item.kind !== "event" || item.event.type !== "chatMessage")
      .map((item) => {
        if (item.kind === "error") {
          return {
            id: item.id,
            message: `Error: ${item.message}`,
            timestamp: item.timestamp
          };
        }

        const message = describeEvent(item.event, nameLookup, territoryLookup);
        const playerId =
          item.event.type === "cardAwarded" || item.event.type === "playerEliminated"
            ? item.event.playerId
            : item.event.type === "gameOver"
              ? item.event.winnerId
              : null;
        const player = playerId
          ? gameState?.players.find((p) => p.id === playerId)
          : undefined;
        const color = player ? playerColorMap[player.color] : undefined;
        return {
          id: item.id,
          message,
          color,
          timestamp: item.timestamp
        };
      });

    return entries.slice(-12).reverse();
  }, [eventLog, gameState, nameLookup, territoryLookup]);

  return (
    <div className={styles.panel}>
      <h2>Event Feed</h2>
      {feed.length === 0 ? (
        <p className={styles.muted}>No events yet.</p>
      ) : (
        <div className={styles.feedList}>
          {feed.map((item) => (
            <div key={item.id} className={styles.feedItem}>
              <span className={styles.time}>{formatTime(item.timestamp)}</span>
              <span className={styles.message} style={item.color ? { color: item.color } : undefined}>
                {item.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
