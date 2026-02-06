import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameRoom } from "../src/socket/gameRoom.js";

// Minimal mock for Socket.io Server and Socket
function createMockServer() {
  const emittedEvents: Array<{ room: string; event: string; data: unknown }> = [];
  const socketMap = new Map<string, ReturnType<typeof createMockSocket>>();

  const io = {
    to: vi.fn((room: string) => ({
      emit: vi.fn((event: string, data: unknown) => {
        emittedEvents.push({ room, event, data });
      }),
    })),
    sockets: {
      sockets: socketMap,
    },
  } as any;

  return { io, emittedEvents, socketMap };
}

function createMockSocket(id: string) {
  const emitted: Array<{ event: string; data: unknown }> = [];
  return {
    id,
    join: vi.fn(),
    emit: vi.fn((event: string, data: unknown) => {
      emitted.push({ event, data });
    }),
    emitted,
  } as any;
}

describe("GameRoom", () => {
  let mockServer: ReturnType<typeof createMockServer>;
  let room: GameRoom;

  beforeEach(() => {
    mockServer = createMockServer();
    room = new GameRoom("TEST-001", mockServer.io);
  });

  describe("lobby", () => {
    it("adds a player and broadcasts lobby update", () => {
      const socket = createMockSocket("s1");
      mockServer.socketMap.set("s1", socket);

      const added = room.addPlayer(socket, "Alice");
      expect(added).toBe(true);
      expect(socket.join).toHaveBeenCalledWith("TEST-001");

      // Should broadcast lobby:update
      expect(mockServer.emittedEvents).toHaveLength(1);
      expect(mockServer.emittedEvents[0].event).toBe("lobby:update");
      const lobby = mockServer.emittedEvents[0].data as any;
      expect(lobby.players).toHaveLength(1);
      expect(lobby.players[0].name).toBe("Alice");
      expect(lobby.players[0].isHost).toBe(true);
    });

    it("first player is host", () => {
      const s1 = createMockSocket("s1");
      const s2 = createMockSocket("s2");
      mockServer.socketMap.set("s1", s1);
      mockServer.socketMap.set("s2", s2);

      room.addPlayer(s1, "Alice");
      room.addPlayer(s2, "Bob");

      const lastLobby = mockServer.emittedEvents[mockServer.emittedEvents.length - 1].data as any;
      expect(lastLobby.players[0].isHost).toBe(true);
      expect(lastLobby.players[1].isHost).toBe(false);
    });

    it("rejects 7th player", () => {
      for (let i = 0; i < 6; i++) {
        const s = createMockSocket(`s${i}`);
        mockServer.socketMap.set(`s${i}`, s);
        room.addPlayer(s, `Player${i}`);
      }
      const extra = createMockSocket("s6");
      expect(room.addPlayer(extra, "TooMany")).toBe(false);
    });

    it("toggles ready state", () => {
      const s1 = createMockSocket("s1");
      mockServer.socketMap.set("s1", s1);
      room.addPlayer(s1, "Alice");

      room.setReady("s1");
      let lobby = mockServer.emittedEvents[mockServer.emittedEvents.length - 1].data as any;
      expect(lobby.players[0].isReady).toBe(true);

      room.setReady("s1");
      lobby = mockServer.emittedEvents[mockServer.emittedEvents.length - 1].data as any;
      expect(lobby.players[0].isReady).toBe(false);
    });

    it("removes player and promotes new host", () => {
      const s1 = createMockSocket("s1");
      const s2 = createMockSocket("s2");
      mockServer.socketMap.set("s1", s1);
      mockServer.socketMap.set("s2", s2);

      room.addPlayer(s1, "Alice");
      room.addPlayer(s2, "Bob");

      room.removePlayer("s1");
      const lobby = mockServer.emittedEvents[mockServer.emittedEvents.length - 1].data as any;
      expect(lobby.players).toHaveLength(1);
      expect(lobby.players[0].name).toBe("Bob");
      expect(lobby.players[0].isHost).toBe(true);
    });

    it("returns true when last player leaves", () => {
      const s1 = createMockSocket("s1");
      mockServer.socketMap.set("s1", s1);
      room.addPlayer(s1, "Alice");

      const empty = room.removePlayer("s1");
      expect(empty).toBe(true);
      expect(room.isEmpty).toBe(true);
    });

    it("rejects start if not host", () => {
      const s1 = createMockSocket("s1");
      const s2 = createMockSocket("s2");
      mockServer.socketMap.set("s1", s1);
      mockServer.socketMap.set("s2", s2);

      room.addPlayer(s1, "Alice");
      room.addPlayer(s2, "Bob");
      room.setReady("s2");

      room.startGame("s2"); // Bob is not host
      // Should emit error to s2
      expect(s2.emit).toHaveBeenCalledWith("error", { message: "Only the host can start the game" });
    });

    it("rejects start if not all ready", () => {
      const s1 = createMockSocket("s1");
      const s2 = createMockSocket("s2");
      mockServer.socketMap.set("s1", s1);
      mockServer.socketMap.set("s2", s2);

      room.addPlayer(s1, "Alice");
      room.addPlayer(s2, "Bob");
      // Bob is not ready

      room.startGame("s1");
      expect(s1.emit).toHaveBeenCalledWith("error", { message: "All players must be ready" });
    });

    it("rejects joining after game started", () => {
      const s1 = createMockSocket("s1");
      const s2 = createMockSocket("s2");
      const s3 = createMockSocket("s3");
      mockServer.socketMap.set("s1", s1);
      mockServer.socketMap.set("s2", s2);
      mockServer.socketMap.set("s3", s3);

      room.addPlayer(s1, "Alice");
      room.addPlayer(s2, "Bob");
      room.setReady("s2");
      room.startGame("s1");

      expect(room.isStarted).toBe(true);
      expect(room.addPlayer(s3, "Charlie")).toBe(false);
    });
  });

  describe("game actions", () => {
    function startTwoPlayerGame() {
      const s1 = createMockSocket("s1");
      const s2 = createMockSocket("s2");
      mockServer.socketMap.set("s1", s1);
      mockServer.socketMap.set("s2", s2);

      room.addPlayer(s1, "Alice");
      room.addPlayer(s2, "Bob");
      room.setReady("s2");
      room.startGame("s1");

      return { s1, s2 };
    }

    it("starts game and sends state to each player", () => {
      const { s1, s2 } = startTwoPlayerGame();

      // Both players should receive game:state
      const s1States = s1.emitted.filter((e: any) => e.event === "game:state");
      const s2States = s2.emitted.filter((e: any) => e.event === "game:state");
      expect(s1States.length).toBeGreaterThan(0);
      expect(s2States.length).toBeGreaterThan(0);

      // Verify sanitization — no deck in client state
      const state = s1States[0].data as any;
      expect(state.deck).toBeUndefined();
      expect(state.phase).toBe("setup");
    });

    it("handles setup place troop", () => {
      const { s1 } = startTwoPlayerGame();

      // Find a territory owned by player-0
      const stateEvent = s1.emitted.find((e: any) => e.event === "game:state");
      const state = stateEvent.data as any;
      const ownedTerritoryId = Object.values(state.territories)
        .find((t: any) => t.ownerId === "player-0")! as any;

      room.handleSetupPlace("s1", ownedTerritoryId.id);

      // Should have broadcast an updated state
      const latestState = s1.emitted.filter((e: any) => e.event === "game:state");
      expect(latestState.length).toBeGreaterThan(1);
    });

    it("sends error for wrong player turn", () => {
      startTwoPlayerGame();

      // s2 tries to act during s1's turn
      room.handleSetupPlace("s2", "alaska");
      const s2Socket = mockServer.socketMap.get("s2");
      const errors = s2Socket.emitted.filter((e: any) => e.event === "error");
      expect(errors.length).toBeGreaterThan(0);
    });

    it("sends error for invalid action", () => {
      startTwoPlayerGame();

      // Try to reinforce during setup phase
      room.handleReinforcePlace("s1", "alaska", 1);
      const s1Socket = mockServer.socketMap.get("s1");
      const errors = s1Socket.emitted.filter((e: any) => e.event === "error");
      expect(errors.length).toBeGreaterThan(0);
    });

    it("handles chat messages", () => {
      startTwoPlayerGame();

      room.handleChat("s1", "Hello!");

      const chatEvents = mockServer.emittedEvents.filter((e) => e.event === "game:event");
      const chatMsg = chatEvents.find((e) => (e.data as any).type === "chatMessage");
      expect(chatMsg).toBeDefined();
      expect((chatMsg!.data as any).message).toBe("Hello!");
    });
  });
});
