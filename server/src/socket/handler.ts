// ============================================================
// Socket.io connection handler — manages game rooms and routes
// client events to the appropriate GameRoom instance.
// ============================================================

import type { Server, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@risk/shared";
import { GameRoom } from "./gameRoom.js";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

// Active game rooms keyed by gameId
const rooms = new Map<string, GameRoom>();

// Track which room each socket is in
const socketRooms = new Map<string, string>();

let gameCounter = 0;

function generateGameId(): string {
  gameCounter++;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RISK-${rand}-${gameCounter}`;
}

export function setupSocketHandlers(io: TypedServer): void {
  io.on("connection", (socket: TypedSocket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // --- Lobby events ---

    socket.on("lobby:create", (data, ack) => {
      const gameId = generateGameId();
      const room = new GameRoom(gameId, io);
      rooms.set(gameId, room);
      room.addPlayer(socket, data.playerName);
      socketRooms.set(socket.id, gameId);
      ack({ gameId });
      console.log(`[lobby] ${data.playerName} created room ${gameId}`);
    });

    socket.on("lobby:join", (data, ack) => {
      const room = rooms.get(data.gameId);
      if (!room) {
        ack({ ok: false, error: "Game not found" });
        return;
      }
      if (room.isStarted) {
        ack({ ok: false, error: "Game already started" });
        return;
      }

      const added = room.addPlayer(socket, data.playerName);
      if (!added) {
        ack({ ok: false, error: "Game is full" });
        return;
      }

      socketRooms.set(socket.id, data.gameId);
      ack({ ok: true });
      console.log(`[lobby] ${data.playerName} joined room ${data.gameId}`);
    });

    socket.on("lobby:ready", () => {
      const room = getRoom(socket);
      room?.setReady(socket.id);
    });

    socket.on("lobby:start", () => {
      const room = getRoom(socket);
      room?.startGame(socket.id);
    });

    socket.on("lobby:addAi", (data, ack) => {
      const room = getRoom(socket);
      if (!room) {
        ack({ ok: false, error: "Not in a game" });
        return;
      }
      const result = room.addAiPlayer(socket.id, data.difficulty);
      ack(result);
    });

    socket.on("lobby:removeAi", (data, ack) => {
      const room = getRoom(socket);
      if (!room) {
        ack({ ok: false, error: "Not in a game" });
        return;
      }
      const result = room.removeAiPlayer(socket.id, data.playerId);
      ack(result);
    });

    // --- Game events ---

    socket.on("game:setupPlace", (data) => {
      const room = getRoom(socket);
      room?.handleSetupPlace(socket.id, data.territoryId);
    });

    socket.on("game:reinforcePlace", (data) => {
      const room = getRoom(socket);
      room?.handleReinforcePlace(socket.id, data.territoryId, data.count);
    });

    socket.on("game:tradeCards", (data) => {
      const room = getRoom(socket);
      room?.handleTradeCards(socket.id, data.cardIds);
    });

    socket.on("game:reinforceDone", () => {
      const room = getRoom(socket);
      room?.handleReinforceDone(socket.id);
    });

    socket.on("game:attack", (data) => {
      const room = getRoom(socket);
      room?.handleAttack(socket.id, data.fromId, data.toId, data.dice);
    });

    socket.on("game:attackMove", (data) => {
      const room = getRoom(socket);
      room?.handleAttackMove(socket.id, data.fromId, data.toId, data.count);
    });

    socket.on("game:attackDone", () => {
      const room = getRoom(socket);
      room?.handleAttackDone(socket.id);
    });

    socket.on("game:fortify", (data) => {
      const room = getRoom(socket);
      room?.handleFortify(socket.id, data.fromId, data.toId, data.count);
    });

    socket.on("game:fortifyDone", () => {
      const room = getRoom(socket);
      room?.handleFortifyDone(socket.id);
    });

    // --- Mini-battle events ---

    socket.on("game:battleResult", (data) => {
      const room = getRoom(socket);
      room?.handleBattleResult(socket.id, data);
    });

    // --- Diplomacy events ---

    socket.on("diplomacy:propose", (data) => {
      const room = getRoom(socket);
      room?.handleProposePact(socket.id, data.targetPlayerId);
    });

    socket.on("diplomacy:accept", (data) => {
      const room = getRoom(socket);
      room?.handleAcceptPact(socket.id, data.pactId);
    });

    socket.on("diplomacy:reject", (data) => {
      const room = getRoom(socket);
      room?.handleRejectPact(socket.id, data.pactId);
    });

    socket.on("chat:send", (data) => {
      const room = getRoom(socket);
      room?.handleChat(socket.id, data.message);
    });

    // --- Disconnect ---

    socket.on("disconnect", () => {
      const gameId = socketRooms.get(socket.id);
      if (gameId) {
        const room = rooms.get(gameId);
        if (room) {
          const empty = room.removePlayer(socket.id);
          if (empty) {
            rooms.delete(gameId);
            console.log(`[lobby] room ${gameId} deleted (empty)`);
          }
        }
        socketRooms.delete(socket.id);
      }
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
}

function getRoom(socket: TypedSocket): GameRoom | undefined {
  const gameId = socketRooms.get(socket.id);
  if (!gameId) return undefined;
  return rooms.get(gameId);
}

/** Exposed for testing — get current room count */
export function getRoomCount(): number {
  return rooms.size;
}
