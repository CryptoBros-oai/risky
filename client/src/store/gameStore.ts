import { create } from "zustand";
import type {
  ClientToServerEvents,
  GameEvent,
  GameState,
  LobbyState,
  ServerToClientEvents,
  TerritoryId
} from "@risk/shared";
import type { Socket } from "socket.io-client";
import { getSocket } from "../services/socket";

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

type GameStoreState = {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  connectionStatus: ConnectionStatus;
  connectionError: string | null;
  localPlayerName: string | null;
  localPlayerId: string | null;
  lobby: LobbyState | null;
  gameState: GameState | null;
  lastEvent: GameEvent | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  setLocalPlayerName: (name: string) => void;
  createLobby: (playerName: string) => Promise<string>;
  joinLobby: (gameId: string, playerName: string) => Promise<{ ok: boolean; error?: string }>;
  setReady: () => void;
  startGame: () => void;
  sendChat: (message: string) => void;
  setupPlace: (territoryId: TerritoryId) => void;
  reinforcePlace: (territoryId: TerritoryId, count: number) => void;
  tradeCards: (cardIds: [string, string, string]) => void;
  reinforceDone: () => void;
  attack: (fromId: TerritoryId, toId: TerritoryId, dice?: number) => void;
  attackMove: (fromId: TerritoryId, toId: TerritoryId, count: number) => void;
  attackDone: () => void;
  fortify: (fromId: TerritoryId, toId: TerritoryId, count: number) => void;
  fortifyDone: () => void;
};

const registerSocketListeners = (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  set: (state: Partial<GameStoreState>) => void,
  get: () => GameStoreState
): void => {
  socket.off("connect");
  socket.off("disconnect");
  socket.off("connect_error");
  socket.off("lobby:update");
  socket.off("game:state");
  socket.off("game:event");
  socket.off("error");

  socket.on("connect", () => {
    set({ connectionStatus: "connected", connectionError: null });
  });

  socket.on("disconnect", () => {
    set({ connectionStatus: "disconnected" });
  });

  socket.on("connect_error", (error) => {
    set({ connectionStatus: "disconnected", connectionError: error.message });
  });

  socket.on("lobby:update", (state) => {
    const localName = get().localPlayerName;
    const localPlayer =
      localName ? state.players.find((player) => player.name === localName) : undefined;
    set({
      lobby: state,
      localPlayerId: localPlayer?.id ?? get().localPlayerId
    });
  });

  socket.on("game:state", (state) => {
    const localName = get().localPlayerName;
    const localPlayer =
      localName ? state.players.find((player) => player.name === localName) : undefined;
    set({
      gameState: state,
      localPlayerId: localPlayer?.id ?? get().localPlayerId
    });
  });

  socket.on("game:event", (event) => {
    set({ lastEvent: event });
  });

  socket.on("error", (data) => {
    set({ connectionError: data.message });
  });
};

const ensureConnected = async (
  socket: Socket<ServerToClientEvents, ClientToServerEvents>,
  set: (state: Partial<GameStoreState>) => void
): Promise<void> => {
  if (socket.connected) {
    return;
  }

  set({ connectionStatus: "connecting", connectionError: null });

  await new Promise<void>((resolve, reject) => {
    const handleConnect = (): void => {
      socket.off("connect_error", handleError);
      resolve();
    };

    const handleError = (error: Error): void => {
      socket.off("connect", handleConnect);
      reject(error);
    };

    socket.once("connect", handleConnect);
    socket.once("connect_error", handleError);
    socket.connect();
  });
};

export const useGameStore = create<GameStoreState>((set, get) => {
  const socket = getSocket();
  registerSocketListeners(socket, set, get);

  return {
    socket,
    connectionStatus: socket.connected ? "connected" : "disconnected",
    connectionError: null,
    localPlayerName: null,
    localPlayerId: null,
    lobby: null,
    gameState: null,
    lastEvent: null,
    connect: async () => {
      try {
        await ensureConnected(socket, set);
      } catch (error) {
        set({
          connectionStatus: "disconnected",
          connectionError: error instanceof Error ? error.message : "Failed to connect"
        });
        throw error;
      }
    },
    disconnect: () => {
      socket.disconnect();
      set({ connectionStatus: "disconnected" });
    },
    setLocalPlayerName: (name) => {
      set({ localPlayerName: name });
    },
    createLobby: async (playerName) => {
      await ensureConnected(socket, set);
      set({ localPlayerName: playerName });

      return new Promise<string>((resolve) => {
        socket.emit("lobby:create", { playerName }, (res) => resolve(res.gameId));
      });
    },
    joinLobby: async (gameId, playerName) => {
      await ensureConnected(socket, set);
      set({ localPlayerName: playerName });

      return new Promise<{ ok: boolean; error?: string }>((resolve) => {
        socket.emit("lobby:join", { gameId, playerName }, (res) => resolve(res));
      });
    },
    setReady: () => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("lobby:ready");
    },
    startGame: () => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("lobby:start");
    },
    sendChat: (message) => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("chat:send", { message });
    },
    setupPlace: (territoryId) => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:setupPlace", { territoryId });
    },
    reinforcePlace: (territoryId, count) => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:reinforcePlace", { territoryId, count });
    },
    tradeCards: (cardIds) => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:tradeCards", { cardIds });
    },
    reinforceDone: () => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:reinforceDone");
    },
    attack: (fromId, toId, dice) => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:attack", { fromId, toId, dice });
    },
    attackMove: (fromId, toId, count) => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:attackMove", { fromId, toId, count });
    },
    attackDone: () => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:attackDone");
    },
    fortify: (fromId, toId, count) => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:fortify", { fromId, toId, count });
    },
    fortifyDone: () => {
      if (!socket.connected) {
        set({ connectionError: "Not connected" });
        return;
      }
      socket.emit("game:fortifyDone");
    }
  };
});
