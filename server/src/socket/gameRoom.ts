// ============================================================
// GameRoom — manages a single game lobby + active game session.
// One room per game. Handles Socket.io events for all players
// in that game.
// ============================================================

import type { Server, Socket } from "socket.io";
import type {
  GameState,
  GameConfig,
  LobbyState,
  LobbyPlayer,
  PlayerColor,
  ClientToServerEvents,
  ServerToClientEvents,
  TerritoryId,
  MiniBattleResult,
  AiDifficulty,
} from "@risk/shared";
import {
  createGame,
  DEFAULT_CONFIG,
  setupPlaceTroop,
  reinforcePlace,
  reinforceDone,
  tradeCards,
  attack,
  attackMove,
  attackDone,
  fortify,
  fortifyDone,
  sanitizeForClient,
} from "../game/engine.js";
import { createMiniBattle, validateBattleResult, simulateBattle } from "../game/miniBattle.js";
import { createPact, acceptPact, havePact, breakPact } from "../game/diplomacy.js";
import { planAiTurn } from "../game/ai.js";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;

const COLORS: PlayerColor[] = ["red", "blue", "green", "yellow", "purple", "orange"];
const MAX_PLAYERS = 6;

interface ConnectedPlayer {
  socketId: string;
  playerId: string;
  name: string;
  color: PlayerColor;
  isReady: boolean;
  isHost: boolean;
}

export class GameRoom {
  readonly gameId: string;
  private players: ConnectedPlayer[] = [];
  private gameState: GameState | null = null;
  private io: TypedServer;

  constructor(gameId: string, io: TypedServer) {
    this.gameId = gameId;
    this.io = io;
  }

  // --------------- Lobby ---------------

  addPlayer(socket: TypedSocket, name: string): boolean {
    if (this.players.length >= MAX_PLAYERS) return false;
    if (this.gameState) return false; // Game already started

    const isHost = this.players.length === 0;
    const color = COLORS[this.players.length];
    const playerId = `player-${this.players.length}`;

    this.players.push({
      socketId: socket.id,
      playerId,
      name,
      color,
      isReady: false,
      isHost,
    });

    socket.join(this.gameId);
    this.broadcastLobby();
    return true;
  }

  removePlayer(socketId: string): boolean {
    const index = this.players.findIndex((p) => p.socketId === socketId);
    if (index === -1) return false;

    this.players.splice(index, 1);

    // If host left and players remain, promote next player
    if (this.players.length > 0 && !this.players.some((p) => p.isHost)) {
      this.players[0].isHost = true;
    }

    this.broadcastLobby();
    return this.players.length === 0; // Returns true if room is now empty
  }

  setReady(socketId: string): void {
    const player = this.players.find((p) => p.socketId === socketId);
    if (player) {
      player.isReady = !player.isReady;
      this.broadcastLobby();
    }
  }

  startGame(socketId: string): void {
    const host = this.players.find((p) => p.socketId === socketId);
    if (!host?.isHost) {
      this.sendError(socketId, "Only the host can start the game");
      return;
    }

    if (this.players.length < 2) {
      this.sendError(socketId, "Need at least 2 players to start");
      return;
    }

    const allReady = this.players.every((p) => p.isHost || p.isReady);
    if (!allReady) {
      this.sendError(socketId, "All players must be ready");
      return;
    }

    const names = this.players.map((p) => p.name);
    this.gameState = createGame(names);
    this.broadcastState();
  }

  private broadcastLobby(): void {
    const lobby: LobbyState = {
      gameId: this.gameId,
      players: this.players.map((p) => ({
        id: p.playerId,
        name: p.name,
        color: p.color,
        isReady: p.isReady,
        isHost: p.isHost,
      })),
      maxPlayers: MAX_PLAYERS,
      isStarting: false,
    };
    this.io.to(this.gameId).emit("lobby:update", lobby);
  }

  // --------------- Game Actions ---------------

  private getPlayerId(socketId: string): string | null {
    return this.players.find((p) => p.socketId === socketId)?.playerId ?? null;
  }

  private withGameAction(socketId: string, action: (state: GameState, playerId: string) => GameState): void {
    if (!this.gameState) {
      this.sendError(socketId, "Game has not started");
      return;
    }

    const playerId = this.getPlayerId(socketId);
    if (!playerId) {
      this.sendError(socketId, "You are not in this game");
      return;
    }

    try {
      this.gameState = action(this.gameState, playerId);
      this.broadcastState();
    } catch (err) {
      this.sendError(socketId, err instanceof Error ? err.message : "Unknown error");
    }
  }

  handleSetupPlace(socketId: string, territoryId: TerritoryId): void {
    this.withGameAction(socketId, (state, playerId) =>
      setupPlaceTroop(state, playerId, territoryId),
    );
  }

  handleReinforcePlace(socketId: string, territoryId: TerritoryId, count: number): void {
    this.withGameAction(socketId, (state, playerId) =>
      reinforcePlace(state, playerId, territoryId, count),
    );
  }

  handleTradeCards(socketId: string, cardIds: [string, string, string]): void {
    this.withGameAction(socketId, (state, playerId) =>
      tradeCards(state, playerId, cardIds),
    );
  }

  handleReinforceDone(socketId: string): void {
    this.withGameAction(socketId, (state, playerId) =>
      reinforceDone(state, playerId),
    );
  }

  handleAttack(socketId: string, fromId: TerritoryId, toId: TerritoryId, dice?: number): void {
    if (!this.gameState) {
      this.sendError(socketId, "Game has not started");
      return;
    }

    const playerId = this.getPlayerId(socketId);
    if (!playerId) {
      this.sendError(socketId, "You are not in this game");
      return;
    }

    try {
      const result = attack(this.gameState, playerId, fromId, toId, dice);
      this.gameState = result.state;

      // Broadcast combat result to all players
      this.io.to(this.gameId).emit("game:event", {
        type: "combatResult",
        result: result.combat,
        attackerId: fromId,
        defenderId: toId,
      });

      // Check for player elimination
      if (result.combat.conquered) {
        const defender = this.gameState.players.find(
          (p) => p.isEliminated && p.territoryCount === 0,
        );
        if (defender) {
          this.io.to(this.gameId).emit("game:event", {
            type: "playerEliminated",
            playerId: defender.id,
            eliminatedBy: playerId,
          });
        }
      }

      // Check for game over
      if (this.gameState.phase === "gameOver" && this.gameState.winnerId) {
        this.io.to(this.gameId).emit("game:event", {
          type: "gameOver",
          winnerId: this.gameState.winnerId,
        });
      }

      this.broadcastState();
    } catch (err) {
      this.sendError(socketId, err instanceof Error ? err.message : "Unknown error");
    }
  }

  handleAttackMove(socketId: string, fromId: TerritoryId, toId: TerritoryId, count: number): void {
    this.withGameAction(socketId, (state, playerId) =>
      attackMove(state, playerId, fromId, toId, count),
    );
  }

  handleAttackDone(socketId: string): void {
    if (!this.gameState) {
      this.sendError(socketId, "Game has not started");
      return;
    }

    const playerId = this.getPlayerId(socketId);
    if (!playerId) {
      this.sendError(socketId, "You are not in this game");
      return;
    }

    try {
      this.gameState = attackDone(this.gameState, playerId);

      // Check if a card was awarded (player conquered this turn)
      if (this.gameState.hasConqueredThisTurn) {
        const player = this.gameState.players.find((p) => p.id === playerId);
        if (player && player.cards.length > 0) {
          const lastCard = player.cards[player.cards.length - 1];
          // Send card award privately to the player who earned it
          const socket = this.getSocket(socketId);
          socket?.emit("game:event", {
            type: "cardAwarded",
            playerId,
            card: lastCard,
          });
        }
      }

      this.broadcastState();
    } catch (err) {
      this.sendError(socketId, err instanceof Error ? err.message : "Unknown error");
    }
  }

  handleFortify(socketId: string, fromId: TerritoryId, toId: TerritoryId, count: number): void {
    this.withGameAction(socketId, (state, playerId) =>
      fortify(state, playerId, fromId, toId, count),
    );
  }

  handleFortifyDone(socketId: string): void {
    this.withGameAction(socketId, (state, playerId) =>
      fortifyDone(state, playerId),
    );
  }

  handleChat(socketId: string, message: string): void {
    const playerId = this.getPlayerId(socketId);
    if (!playerId) return;

    this.io.to(this.gameId).emit("game:event", {
      type: "chatMessage",
      playerId,
      message,
    });
  }

  // --------------- Mini-Battle (Tactical Mode) ---------------

  handleBattleResult(socketId: string, result: MiniBattleResult): void {
    if (!this.gameState || !this.gameState.activeBattle) {
      this.sendError(socketId, "No active battle");
      return;
    }

    const validation = validateBattleResult(this.gameState.activeBattle, result);
    if (!validation.valid) {
      this.sendError(socketId, `Invalid battle result: ${validation.error}`);
      return;
    }

    const battle = this.gameState.activeBattle;
    const fromId = battle.attacker.territoryId;
    const toId = battle.defender.territoryId;

    // Apply battle results to game state
    this.gameState.territories[fromId].troops = validation.attackerTroopsRemaining;
    this.gameState.territories[toId].troops = validation.defenderTroopsRemaining;

    if (validation.conquered) {
      const defenderId = this.gameState.territories[toId].ownerId!;
      this.gameState.territories[toId].ownerId = battle.attacker.playerId;
      this.gameState.hasConqueredThisTurn = true;

      // Update territory counts and check elimination
      for (const player of this.gameState.players) {
        player.territoryCount = Object.values(this.gameState.territories).filter(
          (t) => t.ownerId === player.id,
        ).length;
      }

      const defender = this.gameState.players.find((p) => p.id === defenderId);
      if (defender && defender.territoryCount === 0) {
        defender.isEliminated = true;
        const attacker = this.gameState.players.find((p) => p.id === battle.attacker.playerId);
        if (attacker) {
          attacker.cards.push(...defender.cards);
          defender.cards = [];
        }
        this.io.to(this.gameId).emit("game:event", {
          type: "playerEliminated",
          playerId: defenderId,
          eliminatedBy: battle.attacker.playerId,
        });
      }

      // Check win
      const alive = this.gameState.players.filter((p) => !p.isEliminated);
      if (alive.length === 1) {
        this.gameState.phase = "gameOver";
        this.gameState.winnerId = alive[0].id;
        this.io.to(this.gameId).emit("game:event", {
          type: "gameOver",
          winnerId: alive[0].id,
        });
      }
    }

    this.gameState.activeBattle = null;

    this.io.to(this.gameId).emit("game:event", {
      type: "miniBattleEnd",
      result,
      conquered: validation.conquered,
    });

    this.broadcastState();
  }

  // --------------- Diplomacy ---------------

  handleProposePact(socketId: string, targetPlayerId: string): void {
    if (!this.gameState) return;
    const playerId = this.getPlayerId(socketId);
    if (!playerId) return;

    if (havePact(this.gameState, playerId, targetPlayerId)) {
      this.sendError(socketId, "Pact already exists");
      return;
    }

    const pact = createPact(playerId, targetPlayerId, this.gameState.turnNumber);
    this.gameState.pacts.push(pact);

    // Notify target player
    const targetSocket = this.players.find((p) => p.playerId === targetPlayerId);
    if (targetSocket) {
      const socket = this.getSocket(targetSocket.socketId);
      socket?.emit("game:event", { type: "pactProposed", pact });
    }
  }

  handleAcceptPact(socketId: string, pactId: string): void {
    if (!this.gameState) return;

    try {
      this.gameState = acceptPact(this.gameState, pactId);
      const pact = this.gameState.pacts.find((p) => p.id === pactId);
      if (pact) {
        this.io.to(this.gameId).emit("game:event", { type: "pactAccepted", pact });
      }
      this.broadcastState();
    } catch (err) {
      this.sendError(socketId, err instanceof Error ? err.message : "Unknown error");
    }
  }

  handleRejectPact(socketId: string, pactId: string): void {
    if (!this.gameState) return;
    // Remove the pending pact
    this.gameState.pacts = this.gameState.pacts.filter((p) => p.id !== pactId);
  }

  // --------------- AI Turn Execution ---------------

  private async executeAiTurn(playerId: string): Promise<void> {
    if (!this.gameState) return;

    const player = this.gameState.players.find((p) => p.id === playerId);
    if (!player || player.isEliminated) return;
    if (!this.gameState.aiPlayerIds.includes(playerId)) return;

    const difficulty: AiDifficulty = player.name.includes("Hard")
      ? "hard"
      : player.name.includes("Easy")
        ? "easy"
        : "medium";

    this.io.to(this.gameId).emit("game:event", { type: "aiTurnStart", playerId });

    // Small delay so humans can see AI actions
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      const plan = planAiTurn(this.gameState, playerId, difficulty);

      if (this.gameState.phase === "setup" && plan.setupPlace) {
        this.gameState = setupPlaceTroop(this.gameState, playerId, plan.setupPlace.territoryId);
        this.broadcastState();
        await delay(500);
      }

      if (this.gameState.phase === "reinforce" && plan.reinforcements) {
        for (const placement of plan.reinforcements.placements) {
          this.gameState = reinforcePlace(this.gameState, playerId, placement.territoryId, placement.count);
          this.broadcastState();
          await delay(300);
        }
        this.gameState = reinforceDone(this.gameState, playerId);
        this.broadcastState();
        await delay(300);
      }

      if (this.gameState.phase === "attack") {
        for (const attackDecision of plan.attacks) {
          if (!attackDecision.attack) break;

          if (this.gameState.battleMode === "tactical") {
            // Auto-simulate for AI
            const from = this.gameState.territories[attackDecision.attack.fromId];
            const to = this.gameState.territories[attackDecision.attack.toId];
            const battle = createMiniBattle(
              playerId, attackDecision.attack.fromId, from.troops - 1,
              to.ownerId!, attackDecision.attack.toId, to.troops,
            );
            const result = simulateBattle(battle);
            this.gameState.activeBattle = battle;
            this.io.to(this.gameId).emit("game:event", { type: "miniBattleStart", battle });
            await delay(1000);
            // Auto-resolve
            this.handleBattleResultInternal(result);
          } else {
            const result = attack(this.gameState, playerId, attackDecision.attack.fromId, attackDecision.attack.toId);
            this.gameState = result.state;
            this.io.to(this.gameId).emit("game:event", {
              type: "combatResult",
              result: result.combat,
              attackerId: attackDecision.attack.fromId,
              defenderId: attackDecision.attack.toId,
            });
            this.broadcastState();
          }
          await delay(800);
          if (this.gameState.phase === "gameOver") return;
        }

        this.gameState = attackDone(this.gameState, playerId);
        this.broadcastState();
        await delay(300);
      }

      if (this.gameState.phase === "fortify" && plan.fortify?.fortify) {
        try {
          this.gameState = fortify(
            this.gameState, playerId,
            plan.fortify.fortify.fromId, plan.fortify.fortify.toId, plan.fortify.fortify.count,
          );
          this.broadcastState();
          await delay(300);
        } catch {
          // Fortify might fail if territories aren't connected — skip
        }
        this.gameState = fortifyDone(this.gameState, playerId);
        this.broadcastState();
      } else if (this.gameState.phase === "fortify") {
        this.gameState = fortifyDone(this.gameState, playerId);
        this.broadcastState();
      }
    } catch (err) {
      console.error(`[AI] Error during ${playerId} turn:`, err);
    }

    this.io.to(this.gameId).emit("game:event", { type: "aiTurnEnd", playerId });

    // Check if next player is also AI
    await delay(500);
    this.checkAndRunAiTurn();
  }

  /** After any state change, check if the current player is AI and run their turn */
  private checkAndRunAiTurn(): void {
    if (!this.gameState) return;
    if (this.gameState.phase === "gameOver") return;

    const currentPlayerId = this.gameState.players[this.gameState.currentPlayerIndex]?.id;
    if (currentPlayerId && this.gameState.aiPlayerIds.includes(currentPlayerId)) {
      // Use setTimeout to avoid blocking
      setTimeout(() => this.executeAiTurn(currentPlayerId), 300);
    }
  }

  /** Internal battle result handler (for AI auto-resolve, skips socket validation) */
  private handleBattleResultInternal(result: MiniBattleResult): void {
    if (!this.gameState?.activeBattle) return;

    const validation = validateBattleResult(this.gameState.activeBattle, result);
    if (!validation.valid) return;

    const battle = this.gameState.activeBattle;
    const fromId = battle.attacker.territoryId;
    const toId = battle.defender.territoryId;

    this.gameState.territories[fromId].troops = validation.attackerTroopsRemaining;
    this.gameState.territories[toId].troops = validation.defenderTroopsRemaining;

    if (validation.conquered) {
      const defenderId = this.gameState.territories[toId].ownerId!;
      this.gameState.territories[toId].ownerId = battle.attacker.playerId;
      this.gameState.hasConqueredThisTurn = true;
      for (const player of this.gameState.players) {
        player.territoryCount = Object.values(this.gameState.territories).filter(
          (t) => t.ownerId === player.id,
        ).length;
      }
      const defender = this.gameState.players.find((p) => p.id === defenderId);
      if (defender && defender.territoryCount === 0) {
        defender.isEliminated = true;
      }
      const alive = this.gameState.players.filter((p) => !p.isEliminated);
      if (alive.length === 1) {
        this.gameState.phase = "gameOver";
        this.gameState.winnerId = alive[0].id;
      }
    }

    this.gameState.activeBattle = null;

    this.io.to(this.gameId).emit("game:event", {
      type: "miniBattleEnd",
      result,
      conquered: validation.conquered,
    });
    this.broadcastState();
  }

  // --------------- Helpers ---------------

  private broadcastState(): void {
    if (!this.gameState) return;

    // Send per-player sanitized state (each player sees their own cards)
    for (const player of this.players) {
      const socket = this.getSocket(player.socketId);
      if (socket) {
        const sanitized = sanitizeForClient(this.gameState, player.playerId);
        socket.emit("game:state", sanitized);
      }
    }
  }

  private sendError(socketId: string, message: string): void {
    const socket = this.getSocket(socketId);
    socket?.emit("error", { message });
  }

  private getSocket(socketId: string): TypedSocket | undefined {
    return this.io.sockets.sockets.get(socketId) as TypedSocket | undefined;
  }

  get isEmpty(): boolean {
    return this.players.length === 0;
  }

  get isStarted(): boolean {
    return this.gameState !== null;
  }

  hasPlayer(socketId: string): boolean {
    return this.players.some((p) => p.socketId === socketId);
  }
}
