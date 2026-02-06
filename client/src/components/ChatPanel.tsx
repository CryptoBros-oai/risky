import { useMemo, useState } from "react";
import type { LobbyState, GameState } from "@risk/shared";
import { useGameStore } from "../store/gameStore";
import { playerColorMap } from "../utils/playerColors";
import styles from "./ChatPanel.module.css";

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

export const ChatPanel = (): JSX.Element => {
  const eventLog = useGameStore((state) => state.eventLog);
  const gameState = useGameStore((state) => state.gameState);
  const lobby = useGameStore((state) => state.lobby);
  const sendChat = useGameStore((state) => state.sendChat);

  const [message, setMessage] = useState("");

  const nameLookup = useMemo(() => buildNameLookup(gameState, lobby), [gameState, lobby]);

  const chatItems = useMemo(() => {
    return eventLog
      .filter((item) => item.kind === "event" && item.event.type === "chatMessage")
      .map((item) => {
        if (item.kind !== "event" || item.event.type !== "chatMessage") {
          return null;
        }
        const player = gameState?.players.find((p) => p.id === item.event.playerId);
        return {
          id: item.id,
          name: nameLookup.get(item.event.playerId) ?? item.event.playerId,
          message: item.event.message,
          color: player ? playerColorMap[player.color] : undefined
        };
      })
      .filter((item): item is { id: string; name: string; message: string; color?: string } =>
        Boolean(item)
      )
      .slice(-12);
  }, [eventLog, gameState, nameLookup]);

  const handleSend = (): void => {
    if (!message.trim()) return;
    sendChat(message.trim());
    setMessage("");
  };

  return (
    <div className={styles.panel}>
      <h2>Chat</h2>
      <div className={styles.messages}>
        {chatItems.length === 0 ? (
          <div className={styles.muted}>No messages yet.</div>
        ) : (
          chatItems.map((item) => (
            <div key={item.id} className={styles.messageRow}>
              <span className={styles.name} style={item.color ? { color: item.color } : undefined}>
                {item.name}
              </span>
              <span className={styles.text}>{item.message}</span>
            </div>
          ))
        )}
      </div>
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Type a message..."
        />
        <button type="button" className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};
