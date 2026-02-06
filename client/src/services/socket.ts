import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@risk/shared";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_SERVER_URL ?? "http://localhost:3001";
    socket = io(serverUrl, {
      autoConnect: false,
      transports: ["websocket"]
    });
  }

  return socket;
};
