import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameManager, GameResult } from '@repo/xiangqi-core';
import { STARTING_FEN, Color } from '@repo/shared';
import { Game } from '../../database/entities/game.entity';
import { Move } from '../../database/entities/move.entity';
import { EngineService } from '../engine/engine.service';
import {
  AI_FALLBACK_DIFFICULTY,
  DISCONNECT_GRACE_MS,
  generatePlayerName,
} from './pvp.constants';
import type {
  PvPRoomData,
  LiveGameInfo,
  MatchFoundPayload,
  GameUpdatePayload,
  GameStatePayload,
} from './dto/pvp-events';

@Injectable()
export class PvPService {
  private readonly logger = new Logger(PvPService.name);

  /** Active PvP rooms: gameId → room data (in-memory) */
  private rooms = new Map<string, PvPRoomData>();

  /** GameManager per room for server-authoritative validation */
  private managers = new Map<string, GameManager>();

  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(Move)
    private readonly moveRepo: Repository<Move>,
    private readonly engineService: EngineService,
  ) {}

  // ── Room management ──

  /** Create a new PvP room for two human players */
  async createRoom(
    redSocketId: string,
    blackSocketId: string,
    redName: string,
    blackName: string,
  ): Promise<{ gameId: string; redToken: string; blackToken: string }> {
    const game = this.gameRepo.create({
      currentFen: STARTING_FEN,
      status: 'playing',
      matchType: 'pvp',
      difficulty: 'medium',
      hintsRemaining: 0,
    });
    const saved = await this.gameRepo.save(game);
    const gameId = saved.id;

    const manager = new GameManager(STARTING_FEN);
    this.managers.set(gameId, manager);

    const redToken = this.makeToken();
    const blackToken = this.makeToken();

    this.rooms.set(gameId, {
      gameId,
      redSocketId,
      blackSocketId,
      redName,
      blackName,
      redToken,
      blackToken,
      spectators: new Set(),
      disconnected: null,
      forfeitTimer: null,
    });

    this.logger.log(
      `Room created: ${gameId} — ${redName} (Red) vs ${blackName} (Black)`,
    );
    return { gameId, redToken, blackToken };
  }

  /** Create an AI-fallback room (human vs engine) */
  async createAiFallbackRoom(
    socketId: string,
    playerName: string,
  ): Promise<{ gameId: string; playerToken: string }> {
    const game = this.gameRepo.create({
      currentFen: STARTING_FEN,
      status: 'playing',
      matchType: 'pvc',
      difficulty: AI_FALLBACK_DIFFICULTY,
      hintsRemaining: 3,
    });
    const saved = await this.gameRepo.save(game);
    const gameId = saved.id;

    const manager = new GameManager(STARTING_FEN);
    this.managers.set(gameId, manager);

    const playerToken = this.makeToken();

    // Store as a PvP-style room for reconnection support, but with AI as black
    this.rooms.set(gameId, {
      gameId,
      redSocketId: socketId,
      blackSocketId: '__ai__', // sentinel — AI plays black
      redName: playerName,
      blackName: 'AI (Pikafish)',
      redToken: playerToken,
      blackToken: '',
      spectators: new Set(),
      disconnected: null,
      forfeitTimer: null,
    });

    this.logger.log(`AI-fallback room created: ${gameId} — ${playerName} vs AI`);
    return { gameId, playerToken };
  }

  // ── Move handling ──

  /**
   * Validate and apply a move. Returns the update payload on success,
   * or an error string on failure.
   */
  async handleMove(
    gameId: string,
    socketId: string,
    uci: string,
  ): Promise<{ success: true; update: GameUpdatePayload } | { success: false; error: string }> {
    const room = this.rooms.get(gameId);
    if (!room) return { success: false, error: 'Room not found' };

    // Spectators cannot move
    if (room.spectators.has(socketId)) {
      return { success: false, error: 'Spectators cannot make moves' };
    }

    // Turn enforcement
    const manager = this.managers.get(gameId);
    if (!manager) return { success: false, error: 'Game manager not found' };

    const currentTurn = manager.getTurn();
    const isRedTurn = currentTurn === Color.RED;
    const expectedSocket = isRedTurn ? room.redSocketId : room.blackSocketId;
    if (socketId !== expectedSocket) {
      return { success: false, error: 'Not your turn' };
    }

    // Server-authoritative validation
    const result = manager.makeMove(uci);
    if (!result.success) {
      return { success: false, error: result.error || 'Illegal move' };
    }

    // Persist move to DB
    const currentMoveCount = await this.getMoveCount(gameId);
    const moveEntity = this.moveRepo.create({
      gameId,
      moveNumber: currentMoveCount + 1,
      uciMove: uci,
      fenBefore: '', // will be set after save
      fenAfter: result.fen!,
      isCheck: result.isCheck || false,
      isCapture: result.captured !== undefined,
    });
    await this.moveRepo.save(moveEntity);
    await this.gameRepo.increment({ id: gameId }, 'moveCount', 1);

    // Check game end
    const gameOver = result.gameResult && result.gameResult !== GameResult.PLAYING;

    return {
      success: true,
      update: {
        fen: result.fen!,
        lastMove: uci,
        turn: result.fen!.includes(' w ') ? 'w' : 'b',
        isCheck: result.isCheck || false,
        moveNumber: 0, // will be queried from DB by caller
        gameResult: gameOver ? result.gameResult : undefined,
      },
    };
  }

  /** Get full move count from DB for a game */
  async getMoveCount(gameId: string): Promise<number> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    return game?.moveCount ?? 0;
  }

  // ── Spectator ──

  addSpectator(gameId: string, socketId: string): boolean {
    const room = this.rooms.get(gameId);
    if (!room) return false;
    room.spectators.add(socketId);
    this.logger.log(`Spectator ${socketId} joined room ${gameId} (total=${room.spectators.size})`);
    return true;
  }

  removeSpectator(gameId: string, socketId: string): void {
    const room = this.rooms.get(gameId);
    if (!room) return;
    room.spectators.delete(socketId);
  }

  getSpectatorCount(gameId: string): number {
    return this.rooms.get(gameId)?.spectators.size ?? 0;
  }

  /** Build full game state payload for a joining spectator / reconnecting player */
  async getGameState(gameId: string, socketId: string): Promise<GameStatePayload | null> {
    const room = this.rooms.get(gameId);
    const manager = this.managers.get(gameId);
    if (!room || !manager) return null;

    const fen = manager.getFen();
    const state = manager.getState();
    const moves = await this.moveRepo.find({
      where: { gameId },
      order: { moveNumber: 'ASC' },
    });

    let yourColor: 'red' | 'black' | undefined;
    if (socketId === room.redSocketId) yourColor = 'red';
    else if (socketId === room.blackSocketId) yourColor = 'black';

    return {
      fen,
      turn: state.turn === Color.RED ? 'w' : 'b',
      status: state.status,
      moveNumber: moves.length,
      moves: moves.map((m) => ({
        moveNumber: m.moveNumber,
        uci: m.uciMove,
        fenBefore: m.fenBefore,
        fenAfter: m.fenAfter,
        isCheck: m.isCheck,
        isCapture: m.isCapture,
      })),
      players: { red: room.redName, black: room.blackName },
      yourColor,
    };
  }

  // ── Disconnect / Reconnect ──

  /**
   * Handle a socket disconnect. Returns the gameId if the socket belonged
   * to an active game (so the gateway can start the grace timer).
   */
  handleDisconnect(socketId: string): PvPRoomData | null {
    for (const room of this.rooms.values()) {
      const isPlayer =
        socketId === room.redSocketId || socketId === room.blackSocketId;
      if (!isPlayer) {
        // Clean up spectator
        room.spectators.delete(socketId);
        continue;
      }

      // Already in grace period? (duplicate disconnect event)
      if (room.disconnected) return null;

      room.disconnected = { socketId, since: Date.now() };
      this.logger.warn(
        `Player ${socketId} disconnected from room ${room.gameId} — grace period started`,
      );
      return room;
    }
    return null;
  }

  /**
   * Attempt reconnection. Returns the room + player color on success,
   * or null if the token is invalid or grace expired.
   */
  tryReconnect(
    gameId: string,
    socketId: string,
    playerToken: string,
  ): { room: PvPRoomData; color: 'red' | 'black' } | null {
    const room = this.rooms.get(gameId);
    if (!room || !room.disconnected) return null;

    // Validate token
    if (room.disconnected.socketId !== socketId) {
      // New socket — check token matches
      const isRed = playerToken === room.redToken;
      const isBlack = playerToken === room.blackToken;
      if (!isRed && !isBlack) return null;

      // Update socket ID
      if (isRed) room.redSocketId = socketId;
      else room.blackSocketId = socketId;
    }

    // Clear grace state
    if (room.forfeitTimer) {
      clearTimeout(room.forfeitTimer);
      room.forfeitTimer = null;
    }
    room.disconnected = null;

    const color: 'red' | 'black' =
      socketId === room.redSocketId ? 'red' : 'black';

    this.logger.log(
      `Player ${socketId} reconnected to room ${gameId} as ${color}`,
    );
    return { room, color };
  }

  /** Start the forfeit timer for a disconnected player's room */
  startForfeitTimer(room: PvPRoomData, onForfeit: (gameId: string) => void): void {
    if (room.forfeitTimer) return;

    room.forfeitTimer = setTimeout(() => {
      this.logger.warn(`Forfeit: room ${room.gameId} — player did not reconnect`);
      onForfeit(room.gameId);
    }, DISCONNECT_GRACE_MS);
  }

  // ── Live games ──

  getLiveGames(): LiveGameInfo[] {
    const list: LiveGameInfo[] = [];
    for (const room of this.rooms.values()) {
      const manager = this.managers.get(room.gameId);
      list.push({
        gameId: room.gameId,
        redName: room.redName,
        blackName: room.blackName,
        moveCount: manager?.getState().moveHistory.length ?? 0,
        spectatorCount: room.spectators.size,
      });
    }
    return list;
  }

  // ── Cleanup ──

  /** Remove a room entirely (game over or forfeit) */
  removeRoom(gameId: string): void {
    this.rooms.delete(gameId);
    this.managers.delete(gameId);
    this.logger.log(`Room ${gameId} removed`);
  }

  /** Check if a socket is a player in any active room */
  findRoomBySocket(socketId: string): PvPRoomData | undefined {
    for (const room of this.rooms.values()) {
      if (
        socketId === room.redSocketId ||
        socketId === room.blackSocketId ||
        room.spectators.has(socketId)
      ) {
        return room;
      }
    }
    return undefined;
  }

  getRoom(gameId: string): PvPRoomData | undefined {
    return this.rooms.get(gameId);
  }

  getManager(gameId: string): GameManager | undefined {
    return this.managers.get(gameId);
  }

  // ── Private ──

  private makeToken(): string {
    return Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
  }
}
