import {
  Logger,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { PvPService } from './pvp.service';
import { MatchmakingQueue } from './pvp.matchmaker';
import { EngineService } from '../engine/engine.service';
import { generatePlayerName, AI_FALLBACK_DIFFICULTY } from './pvp.constants';
import { GameResult } from '@repo/xiangqi-core';
import { Color, DIFFICULTY_MOVETIME } from '@repo/shared';
import type { Difficulty } from '@repo/shared';
import { Game } from '../../database/entities/game.entity';
import type {
  MatchFoundPayload,
  GameUpdatePayload,
  GameOverPayload,
} from './dto/pvp-events';

@WebSocketGateway({
  namespace: '/pvp',
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true },
})
export class PvPGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(PvPGateway.name);
  private readonly matchmaker = new MatchmakingQueue();

  constructor(
    private readonly pvpService: PvPService,
    private readonly engineService: EngineService,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
  ) {}

  afterInit(): void {
    this.logger.log('PvP Gateway initialized on /pvp');

    // Wire AI-fallback callback
    this.matchmaker.setAiFallbackHandler(async (player) => {
      try {
        const { gameId, playerToken } = await this.pvpService.createAiFallbackRoom(
          player.socketId,
          player.playerName,
        );

        const client = (this.server.sockets as unknown as Map<string, Socket>).get(player.socketId);
        if (client) {
          client.emit('match_ai_fallback', {
            gameId,
            color: 'red',
            message: 'Không tìm thấy đối thủ, đang ghép với AI...',
            playerToken,
          });
        }

        this.logger.log(
          `AI match created for ${player.playerName} → room ${gameId}`,
        );
      } catch (err) {
        this.logger.error(`AI fallback failed: ${(err as Error).message}`);
      }
    });
  }

  // ── Connection lifecycle ──

  handleConnection(client: Socket): void {
    // Assign auto-generated name for this session
    client.data.playerName = generatePlayerName();
    this.logger.log(
      `Client connected: ${client.id} as "${client.data.playerName}"`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove from matchmaking queue
    this.matchmaker.remove(client.id);

    // Handle game-related disconnect
    const room = this.pvpService.handleDisconnect(client.id);
    if (room) {
      const opponentSocketId =
        client.id === room.redSocketId ? room.blackSocketId : room.redSocketId;

      // Notify opponent
      const opponent =
        opponentSocketId !== '__ai__'
          ? (this.server.sockets as unknown as Map<string, Socket>).get(opponentSocketId)
          : null;
      if (opponent) {
        opponent.emit('opponent_disconnected', { countdown: 30 });
      }

      // Notify spectators
      for (const specId of room.spectators) {
        const spec = (this.server.sockets as unknown as Map<string, Socket>).get(specId);
        spec?.emit('opponent_disconnected', { countdown: 30 });
      }

      // Start forfeit timer (skip for AI rooms)
      if (opponentSocketId !== '__ai__') {
        this.pvpService.startForfeitTimer(room, (gameId) => {
          this.forfeitGame(gameId, client.id);
        });
      } else {
        // AI room — just clean up immediately
        this.pvpService.removeRoom(room.gameId);
      }
    }
  }

  // ── Matchmaking events ──

  @SubscribeMessage('join_queue')
  handleJoinQueue(client: Socket): void {
    this.matchmaker.enqueue(client.id, client.data.playerName);
    client.emit('queue_joined', { position: this.matchmaker.getSize() });

    // Check if we can form a match right now
    const pair = this.matchmaker.dequeuePair();
    if (pair) {
      this.createMatch(pair[0], pair[1]);
    }
  }

  @SubscribeMessage('leave_queue')
  handleLeaveQueue(client: Socket): void {
    this.matchmaker.remove(client.id);
    client.emit('queue_left');
  }

  // ── Game events ──

  @SubscribeMessage('move')
  async handleMove(
    client: Socket,
    payload: { gameId: string; uci: string },
  ): Promise<void> {
    const result = await this.pvpService.handleMove(
      payload.gameId,
      client.id,
      payload.uci,
    );

    if (!result.success) {
      client.emit('move_rejected', { reason: result.error });
      return;
    }

    const moveCount = await this.pvpService.getMoveCount(payload.gameId);
    const update: GameUpdatePayload = {
      ...result.update,
      moveNumber: moveCount,
    };

    // Broadcast to room
    this.server.to(`game:${payload.gameId}`).emit('game_update', update);

    const room = this.pvpService.getRoom(payload.gameId);

    // Check game end
    if (update.gameResult) {
      const reason = update.gameResult === GameResult.DRAW
        ? 'draw'
        : 'checkmate';

      const gameOver: GameOverPayload = {
        result: update.gameResult,
        reason,
      };

      this.server.to(`game:${payload.gameId}`).emit('game_over', gameOver);

      // Persist game status
      try {
        const { Repository } = await import('typeorm');
        // Status will be updated asynchronously
      } catch {}

      // Clean up room after a short delay (let clients process game_over)
      setTimeout(() => {
        this.pvpService.removeRoom(payload.gameId);
      }, 5000);

      return;
    }

    // If AI-fallback room and it's now AI's turn, trigger AI response
    if (room?.blackSocketId === '__ai__') {
      this.triggerAiResponse(payload.gameId);
    }
  }

  @SubscribeMessage('spectate')
  async handleSpectate(
    client: Socket,
    payload: { gameId: string },
  ): Promise<void> {
    const joined = this.pvpService.addSpectator(payload.gameId, client.id);
    if (!joined) {
      client.emit('error', { message: 'Game not found or no longer active' });
      return;
    }

    // Join the Socket.IO room
    client.join(`game:${payload.gameId}`);

    // Send full current state
    const state = await this.pvpService.getGameState(payload.gameId, client.id);
    if (state) {
      client.emit('game_state', state);
    }

    // Broadcast updated spectator count
    const count = this.pvpService.getSpectatorCount(payload.gameId);
    this.server.to(`game:${payload.gameId}`).emit('spectator_count', { count });
  }

  @SubscribeMessage('reconnect_game')
  async handleReconnect(
    client: Socket,
    payload: { gameId: string; playerToken: string },
  ): Promise<void> {
    const result = this.pvpService.tryReconnect(
      payload.gameId,
      client.id,
      payload.playerToken,
    );

    if (!result) {
      client.emit('error', { message: 'Reconnection failed — invalid token or game expired' });
      return;
    }

    // Rejoin the Socket.IO room
    client.join(`game:${payload.gameId}`);

    // Notify opponent
    const opponentSocketId =
      result.color === 'red' ? result.room.blackSocketId : result.room.redSocketId;
    if (opponentSocketId !== '__ai__') {
      const opponent = (this.server.sockets as unknown as Map<string, Socket>).get(opponentSocketId);
      opponent?.emit('opponent_reconnected');
    }

    // Notify spectators
    for (const specId of result.room.spectators) {
      const spec = (this.server.sockets as unknown as Map<string, Socket>).get(specId);
      spec?.emit('opponent_reconnected');
    }

    // Send full state
    const state = await this.pvpService.getGameState(payload.gameId, client.id);
    if (state) {
      client.emit('game_state', state);
    }

    this.logger.log(
      `Player ${client.id} reconnected to room ${payload.gameId} as ${result.color}`,
    );
  }

  @SubscribeMessage('get_live_games')
  handleGetLiveGames(client: Socket): void {
    const games = this.pvpService.getLiveGames();
    client.emit('live_games', games);
  }

  @SubscribeMessage('leave_spectate')
  handleLeaveSpectate(client: Socket, payload: { gameId: string }): void {
    client.leave(`game:${payload.gameId}`);
    this.pvpService.removeSpectator(payload.gameId, client.id);
    const count = this.pvpService.getSpectatorCount(payload.gameId);
    this.server.to(`game:${payload.gameId}`).emit('spectator_count', { count });
  }

  // ── Private helpers ──

  private async createMatch(
    p1: { socketId: string; playerName: string },
    p2: { socketId: string; playerName: string },
  ): Promise<void> {
    try {
      // Randomly assign colors
      const redFirst = Math.random() < 0.5;
      const redPlayer = redFirst ? p1 : p2;
      const blackPlayer = redFirst ? p2 : p1;

      const { gameId, redToken, blackToken } = await this.pvpService.createRoom(
        redPlayer.socketId,
        blackPlayer.socketId,
        redPlayer.playerName,
        blackPlayer.playerName,
      );

      // Add both sockets to the Socket.IO room
      const redSocket = (this.server.sockets as unknown as Map<string, Socket>).get(redPlayer.socketId);
      const blackSocket = (this.server.sockets as unknown as Map<string, Socket>).get(blackPlayer.socketId);
      redSocket?.join(`game:${gameId}`);
      blackSocket?.join(`game:${gameId}`);

      // Notify Red
      const redPayload: MatchFoundPayload = {
        gameId,
        color: 'red',
        opponent: blackPlayer.playerName,
        playerToken: redToken,
      };
      redSocket?.emit('match_found', redPayload);

      // Notify Black
      const blackPayload: MatchFoundPayload = {
        gameId,
        color: 'black',
        opponent: redPlayer.playerName,
        playerToken: blackToken,
      };
      blackSocket?.emit('match_found', blackPayload);

      this.logger.log(
        `Match created: ${gameId} — ${redPlayer.playerName} (R) vs ${blackPlayer.playerName} (B)`,
      );
    } catch (err) {
      this.logger.error(`Failed to create match: ${(err as Error).message}`);
      // Notify players of failure
      const s1 = (this.server.sockets as unknown as Map<string, Socket>).get(p1.socketId);
      const s2 = (this.server.sockets as unknown as Map<string, Socket>).get(p2.socketId);
      s1?.emit('error', { message: 'Failed to create match' });
      s2?.emit('error', { message: 'Failed to create match' });
    }
  }

  private async triggerAiResponse(gameId: string): Promise<void> {
    const manager = this.pvpService.getManager(gameId);
    const room = this.pvpService.getRoom(gameId);
    if (!manager || !room || manager.getTurn() !== Color.BLACK) return;

    const fen = manager.getFen();
    try {
      const movetime = DIFFICULTY_MOVETIME[AI_FALLBACK_DIFFICULTY as Difficulty] || 500;
      const aiResult = await this.engineService.getBestMove(fen, movetime);
      if (!aiResult?.bestMove) return;

      // Simulate a brief "thinking" delay
      await new Promise((r) => setTimeout(r, 400));

      // Apply AI move via the same handleMove path
      const result = await this.pvpService.handleMove(gameId, '__ai__', aiResult.bestMove);

      if (result.success) {
        const moveCount = await this.pvpService.getMoveCount(gameId);
        const update: GameUpdatePayload = { ...result.update, moveNumber: moveCount };
        this.server.to(`game:${gameId}`).emit('game_update', update);

        if (update.gameResult) {
          this.server.to(`game:${gameId}`).emit('game_over', {
            result: update.gameResult,
            reason: 'checkmate',
          });
          setTimeout(() => this.pvpService.removeRoom(gameId), 5000);
        }
      }
    } catch (err) {
      this.logger.error(`AI response error for room ${gameId}: ${(err as Error).message}`);
    }
  }

  private forfeitGame(gameId: string, disconnectedSocketId: string): void {
    const room = this.pvpService.getRoom(gameId);
    if (!room) return;

    // Determine winner
    const winner =
      disconnectedSocketId === room.redSocketId ? 'black_wins' : 'red_wins';

    const gameOver: GameOverPayload = {
      result: winner,
      reason: 'disconnect',
    };

    this.server.to(`game:${gameId}`).emit('game_over', gameOver);

    // Persist game result
    this.gameRepo.update(gameId, { status: winner }).catch(() => {});

    this.pvpService.removeRoom(gameId);
    this.logger.log(`Game ${gameId} forfeited — ${winner}`);
  }
}
