import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from '../../database/entities/game.entity';
import { Move } from '../../database/entities/move.entity';
import { AnalysisCache } from '../../database/entities/analysis-cache.entity';
import { EngineService } from '../engine/engine.service';
import { GameManager, GameResult, classifyMove } from '@repo/xiangqi-core';
import { generateFen, parseFen } from '@repo/xiangqi-core';
import { hashFen, normalizeFen } from '@repo/xiangqi-core';
import { Color, STARTING_FEN, DEFAULT_THRESHOLDS } from '@repo/shared';
import type { Difficulty } from '@repo/shared';

const DIFFICULTY_MOVETIME: Record<string, number> = {
  easy: 100,
  medium: 500,
  hard: 1500,
  expert: 5000,
};

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);
  private activeGames = new Map<string, GameManager>();

  constructor(
    @InjectRepository(Game) private gameRepo: Repository<Game>,
    @InjectRepository(Move) private moveRepo: Repository<Move>,
    @InjectRepository(AnalysisCache) private cacheRepo: Repository<AnalysisCache>,
    private readonly engineService: EngineService,
  ) {}

  async createGame(difficulty: string = 'medium', matchType: string = 'pvc'): Promise<{ gameId: string; fen: string }> {
    const game = this.gameRepo.create({
      currentFen: STARTING_FEN,
      difficulty,
      matchType,
      hintsRemaining: matchType === 'pvc' ? 3 : 0, // hints only for PvC
    });
    const saved = await this.gameRepo.save(game);

    // Create in-memory game manager
    const manager = new GameManager(STARTING_FEN);
    this.activeGames.set(saved.id, manager);

    // For CvC, trigger AI to play the first move (Red)
    if (matchType === 'cvc') {
      game.aiThinking = true;
      await this.gameRepo.save(game);
      this.computeCvcLoop(saved.id, STARTING_FEN, difficulty).catch((err) => {
        this.logger.error(`CvC loop failed: ${err.message}`);
        game.aiThinking = false;
        this.gameRepo.save(game).catch(() => {});
      });
    }

    return { gameId: saved.id, fen: STARTING_FEN };
  }

  async getGame(id: string) {
    const game = await this.gameRepo.findOne({
      where: { id },
      relations: ['moves'],
      order: { moves: { moveNumber: 'ASC' } },
    });

    if (!game) throw new Error('Game not found');

    return {
      id: game.id,
      fen: game.currentFen,
      moveCount: game.moveCount,
      status: game.status,
      result: game.result,
      difficulty: game.difficulty,
      hintsRemaining: game.hintsRemaining,
      moves: (game.moves || []).map((m) => ({
        moveNumber: m.moveNumber,
        uci: m.uciMove,
        fenBefore: m.fenBefore,
        fenAfter: m.fenAfter,
        evaluationBefore: m.evaluationBefore,
        evaluationAfter: m.evaluationAfter,
        classification: m.classification,
        isCheck: m.isCheck,
        isCapture: m.isCapture,
      })),
      recentAiMove: game.recentAiMove,
      isAiThinking: game.aiThinking,
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    };
  }

  async makeMove(gameId: string, uci: string) {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) throw new Error('Game not found');

    if (game.status !== 'playing') {
      throw new Error(`Game is over: ${game.status}`);
    }

    // Get or create in-memory manager
    let manager = this.activeGames.get(gameId);
    if (!manager) {
      manager = new GameManager(game.currentFen);
      this.activeGames.set(gameId, manager);
    }

    // Validate and apply the move
    const result = manager.makeMove(uci);
    if (!result.success) {
      throw new Error(result.error || 'Illegal move');
    }

    const fenBefore = game.currentFen;
    const fenAfter = result.fen!;

    // Save the move
    const moveEntity = this.moveRepo.create({
      gameId,
      moveNumber: game.moveCount + 1,
      uciMove: uci,
      fenBefore,
      fenAfter,
      isCheck: result.isCheck || false,
      isCapture: result.captured !== undefined,
    });
    await this.moveRepo.save(moveEntity);

    // Update game state
    game.currentFen = fenAfter;
    await this.gameRepo.increment({ id: gameId }, 'moveCount', 1);
    game.moveCount = game.moveCount + 1; // for local reference

    if (result.gameResult) {
      game.status = result.gameResult;
      game.result = result.isMate
        ? 'checkmate'
        : result.isStalemate
          ? 'stalemate'
          : 'draw';
    }

    // If game continues, trigger AI response only for PvC mode
    const isGameOver = !!result.gameResult;

    // Classify the human's move FIRST (fast, ~400ms engine time),
    // THEN launch the AI computation. This ensures classification is
    // stored before the frontend polls and receives the AI response.
    if (!isGameOver && this.engineService.isEngineReady()) {
      await this.evaluateAndClassify(fenBefore, fenAfter, uci, moveEntity.id).catch((err) => {
        this.logger.warn(`Classification failed: ${err.message}`);
      });
    }

    if (!isGameOver && game.matchType === 'pvc') {
      game.aiThinking = true;
      game.recentAiMove = null;
      await this.gameRepo.save(game);

      // Fire and forget AI computation (classification is already done)
      this.computeAiResponse(gameId, fenAfter, game.difficulty).catch((err) => {
        this.logger.error(`AI response failed: ${err.message}`);
        game.aiThinking = false;
        this.gameRepo.save(game).catch(() => {});
      });
    } else {
      await this.gameRepo.save(game);
    }

    return {
      success: true,
      fen: fenAfter,
      turn: fenAfter.includes(' w ') ? 'w' : 'b',
      isCheck: result.isCheck || false,
      isMate: result.isMate || false,
      isStalemate: result.isStalemate || false,
      isDraw: result.isDraw || false,
      gameResult: result.gameResult,
      moveNumber: game.moveCount,
      isAiThinking: game.aiThinking,
    };
  }

  private async computeAiResponse(gameId: string, fen: string, difficulty: string): Promise<void> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game || game.status !== 'playing') return;

    const movetime = DIFFICULTY_MOVETIME[difficulty] || 500;

    try {
      const aiResult = await this.engineService.getBestMove(fen, movetime);

      // Validate AI move
      let manager = this.activeGames.get(gameId);
      if (!manager) {
        manager = new GameManager(fen);
        this.activeGames.set(gameId, manager);
      }

      const moveResult = manager.makeMove(aiResult.bestMove);
      if (!moveResult.success || !moveResult.fen) {
        this.logger.error(`AI generated illegal move: ${aiResult.bestMove}`);
        game.aiThinking = false;
        game.recentAiMove = null;
        await this.gameRepo.save(game);
        return;
      }

      // Save AI move
      const aiMoveEntity = this.moveRepo.create({
        gameId,
        moveNumber: game.moveCount + 1,
        uciMove: aiResult.bestMove,
        fenBefore: fen,
        fenAfter: moveResult.fen,
        isCheck: moveResult.isCheck || false,
        isCapture: moveResult.captured !== undefined,
        evaluationBefore: aiResult.score,
      });
      await this.moveRepo.save(aiMoveEntity);

      // Update game
      game.currentFen = moveResult.fen;
      await this.gameRepo.increment({ id: gameId }, 'moveCount', 1);
      game.moveCount = game.moveCount + 1;

      if (moveResult.gameResult) {
        game.status = moveResult.gameResult;
        game.result = moveResult.isMate
          ? 'checkmate'
          : moveResult.isStalemate
            ? 'stalemate'
            : 'draw';
      }

      // Store AI move for frontend polling
      game.recentAiMove = {
        uci: aiResult.bestMove,
        fen: moveResult.fen,
        evaluation: aiResult.score,
      };

      game.aiThinking = false;
      await this.gameRepo.save(game);

      // Classify the AI's move asynchronously
      if (this.engineService.isEngineReady()) {
        this.evaluateAndClassify(fen, moveResult.fen, aiResult.bestMove, aiMoveEntity.id).catch((err) => {
          this.logger.warn(`AI move classification failed: ${err.message}`);
        });
      }

    } catch (err) {
      this.logger.error(`AI computation error: ${(err as Error).message}`);
      game.aiThinking = false;
      game.recentAiMove = null;
      await this.gameRepo.save(game);
    }
  }

  /**
   * CvC auto-play loop: AI plays both Red and Black until the game ends.
   * Uses a small delay between moves so the frontend can poll and render each move.
   */
  private async computeCvcLoop(gameId: string, fen: string, difficulty: string): Promise<void> {
    const movetime = DIFFICULTY_MOVETIME[difficulty] || 500;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    let currentFen = fen;
    while (true) {
      const game = await this.gameRepo.findOne({ where: { id: gameId } });
      if (!game || game.status !== 'playing') return;

      try {
        const aiResult = await this.engineService.getBestMove(currentFen, movetime);

        // Validate AI move
        let manager = this.activeGames.get(gameId);
        if (!manager) {
          manager = new GameManager(currentFen);
          this.activeGames.set(gameId, manager);
        }

        const moveResult = manager.makeMove(aiResult.bestMove);
        if (!moveResult.success || !moveResult.fen) {
          this.logger.error(`CvC: AI generated illegal move: ${aiResult.bestMove}`);
          game.aiThinking = false;
          await this.gameRepo.save(game);
          return;
        }

        // Save AI move
        const moveEntity = this.moveRepo.create({
          gameId,
          moveNumber: game.moveCount + 1,
          uciMove: aiResult.bestMove,
          fenBefore: currentFen,
          fenAfter: moveResult.fen,
          isCheck: moveResult.isCheck || false,
          isCapture: moveResult.captured !== undefined,
          evaluationBefore: aiResult.score,
        });
        await this.moveRepo.save(moveEntity);

        // Update game
        currentFen = moveResult.fen;
        game.currentFen = currentFen;
        await this.gameRepo.increment({ id: gameId }, 'moveCount', 1);
        game.moveCount = game.moveCount + 1;

        game.recentAiMove = {
          uci: aiResult.bestMove,
          fen: currentFen,
          evaluation: aiResult.score,
        };

        if (moveResult.gameResult) {
          game.status = moveResult.gameResult;
          game.result = moveResult.isMate
            ? 'checkmate'
            : moveResult.isStalemate
              ? 'stalemate'
              : 'draw';
          game.aiThinking = false;
          await this.gameRepo.save(game);
          return;
        }

        await this.gameRepo.save(game);

        // Small delay so frontend has time to poll and render
        await delay(600);
      } catch (err) {
        this.logger.error(`CvC loop error: ${(err as Error).message}`);
        game.aiThinking = false;
        await this.gameRepo.save(game);
        return;
      }
    }
  }

  private async evaluateAndClassify(
    fenBefore: string,
    fenAfter: string,
    uci: string,
    moveId: string,
  ): Promise<void> {
    try {
      // Evaluate position before move
      let evalBefore: number | null = null;
      const cachedBefore = await this.getCachedEval(fenBefore);
      if (cachedBefore !== null) {
        evalBefore = cachedBefore;
      } else {
        const result = await this.engineService.evaluate(fenBefore, 200);
        evalBefore = result.score;
        await this.cacheEvaluation(fenBefore, result.score, result.depth, result.pv);
      }

      // Evaluate position after move
      let evalAfter: number | null = null;
      const result = await this.engineService.evaluate(fenAfter, 200);
      evalAfter = result.score;
      await this.cacheEvaluation(fenAfter, result.score, result.depth, result.pv);

      // Classify the move
      if (evalBefore !== null && evalAfter !== null) {
        const fenData = parseFen(fenBefore);
        const color = fenData.turn;
        const classification = classifyMove(evalAfter, evalBefore, color, DEFAULT_THRESHOLDS);

        this.logger.log(`Classified move ${uci} (${color}): ${classification} (before=${evalBefore}, after=${evalAfter})`);

        // Use save on the found entity — more reliable than raw update
        const move = await this.moveRepo.findOne({ where: { id: moveId } });
        if (move) {
          move.evaluationBefore = evalBefore;
          move.evaluationAfter = evalAfter;
          move.classification = classification;
          await this.moveRepo.save(move);
        }
      }
    } catch (err) {
      this.logger.warn(`Evaluation/classification failed: ${(err as Error).message}`);
    }
  }

  private async getCachedEval(fen: string): Promise<number | null> {
    const fenHash = hashFen(fen);
    const cached = await this.cacheRepo.findOne({ where: { fenHash } });
    return cached?.score ?? null;
  }

  private async cacheEvaluation(fen: string, score: number, depth: number, pv: string[]): Promise<void> {
    const fenHash = hashFen(fen);
    const cached = await this.cacheRepo.findOne({ where: { fenHash } });
    if (!cached) {
      const entry = this.cacheRepo.create({
        fenHash,
        fen: normalizeFen(fen),
        bestMove: pv[0] || '',
        score,
        depth,
        pv,
      });
      await this.cacheRepo.save(entry).catch(() => {}); // ignore duplicate key errors
    }
  }

  async getHint(gameId: string): Promise<{
    bestMove: string;
    score: number;
    depth: number;
    hintsRemaining: number;
  }> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) throw new Error('Game not found');
    if (game.status !== 'playing') throw new Error('Game is over');
    if (game.hintsRemaining <= 0) throw new Error('No hints remaining');

    const result = await this.engineService.getBestMove(game.currentFen, 1000);

    game.hintsRemaining = game.hintsRemaining - 1;
    await this.gameRepo.save(game);

    return {
      bestMove: result.bestMove,
      score: result.score,
      depth: result.depth,
      hintsRemaining: game.hintsRemaining,
    };
  }

  async getGameMoves(gameId: string) {
    return this.moveRepo.find({
      where: { gameId },
      order: { moveNumber: 'ASC' },
    });
  }
}
