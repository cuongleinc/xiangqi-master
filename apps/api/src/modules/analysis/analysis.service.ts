import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalysisCache } from '../../database/entities/analysis-cache.entity';
import { Move } from '../../database/entities/move.entity';
import { Game } from '../../database/entities/game.entity';
import { EngineService } from '../engine/engine.service';
import {
  hashFen,
  normalizeFen,
  classifyMove,
  calculateAccuracy,
  calculateAccuracyFromClassifications,
} from '@repo/xiangqi-core';
import {
  Color,
  MoveClassification,
  DEFAULT_THRESHOLDS,
} from '@repo/shared';
import type { GameReviewData, PlayerReview, CriticalMoment } from '@repo/shared';

@Injectable()
export class AnalysisService {
  private readonly logger = new Logger(AnalysisService.name);

  constructor(
    private readonly engineService: EngineService,
    @InjectRepository(AnalysisCache) private cacheRepo: Repository<AnalysisCache>,
    @InjectRepository(Move) private moveRepo: Repository<Move>,
    @InjectRepository(Game) private gameRepo: Repository<Game>,
  ) {}

  async evaluatePosition(fen: string, force = false) {
    if (!this.engineService.isEngineReady()) {
      throw new Error('Engine not available');
    }

    // Check cache
    const fenHash = hashFen(fen);
    if (!force) {
      const cached = await this.cacheRepo.findOne({ where: { fenHash } });
      if (cached) {
        return {
          score: cached.score,
          mate: cached.mate,
          depth: cached.depth,
          pv: cached.pv || [],
          cached: true,
        };
      }
    }

    // Call engine
    const result = await this.engineService.evaluate(fen, 2000);

    // Cache the result
    const cacheEntry = this.cacheRepo.create({
      fenHash,
      fen: normalizeFen(fen),
      bestMove: result.pv[0] || '',
      score: result.score,
      mate: result.mate || null,
      depth: result.depth,
      pv: result.pv,
    });
    await this.cacheRepo.save(cacheEntry).catch(() => {});

    return {
      score: result.score,
      mate: result.mate,
      depth: result.depth,
      pv: result.pv,
      cached: false,
    };
  }

  async getBestMove(fen: string, movetime?: number) {
    if (!this.engineService.isEngineReady()) {
      throw new Error('Engine not available');
    }

    const fenHash = hashFen(fen);
    const cached = await this.cacheRepo.findOne({ where: { fenHash } });
    if (cached && !movetime) {
      return {
        bestMove: cached.bestMove,
        score: cached.score,
        depth: cached.depth,
        pv: cached.pv || [],
      };
    }

    const result = await this.engineService.getBestMove(fen, movetime || 2000);
    return result;
  }

  classifyMove(
    evalBefore: number,
    evalAfter: number,
    bestEval: number,
    color: Color,
  ): string {
    return classifyMove(evalAfter, bestEval, color, DEFAULT_THRESHOLDS);
  }

  async generateGameReview(gameId: string): Promise<GameReviewData> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) throw new Error('Game not found');

    const moves = await this.moveRepo.find({
      where: { gameId },
      order: { moveNumber: 'ASC' },
    });

    // Red moves are odd (1, 3, 5...), Black moves are even (2, 4, 6...)
    const redMoves = moves.filter((m) => m.moveNumber % 2 === 1);
    const blackMoves = moves.filter((m) => m.moveNumber % 2 === 0);

    const redReview = this.calculatePlayerReview(redMoves, Color.RED);
    const blackReview = this.calculatePlayerReview(blackMoves, Color.BLACK);

    // Identify critical moments (top 5 biggest eval swings)
    const criticalMoments = this.findCriticalMoments(moves);

    return {
      gameId,
      red: redReview,
      black: blackReview,
      criticalMoments,
      totalMoves: moves.length,
    };
  }

  private calculatePlayerReview(moves: Move[], color: Color): PlayerReview {
    const counts: Record<string, number> = {
      [MoveClassification.BEST]: 0,
      [MoveClassification.EXCELLENT]: 0,
      [MoveClassification.GOOD]: 0,
      [MoveClassification.INACCURACY]: 0,
      [MoveClassification.MISTAKE]: 0,
      [MoveClassification.BLUNDER]: 0,
    };

    for (const move of moves) {
      if (move.classification) {
        counts[move.classification] = (counts[move.classification] || 0) + 1;
      }
    }

    const accuracy = calculateAccuracyFromClassifications(
      counts as Record<MoveClassification, number>,
      moves.length,
    );

    return {
      accuracy,
      bestCount: counts[MoveClassification.BEST] || 0,
      excellentCount: counts[MoveClassification.EXCELLENT] || 0,
      goodCount: counts[MoveClassification.GOOD] || 0,
      inaccuracyCount: counts[MoveClassification.INACCURACY] || 0,
      mistakeCount: counts[MoveClassification.MISTAKE] || 0,
      blunderCount: counts[MoveClassification.BLUNDER] || 0,
    };
  }

  private findCriticalMoments(moves: Move[]): CriticalMoment[] {
    const moments: CriticalMoment[] = [];

    for (const move of moves) {
      if (
        move.evaluationBefore !== null &&
        move.evaluationAfter !== null
      ) {
        const evalSwing = Math.abs(move.evaluationAfter - move.evaluationBefore);
        if (evalSwing > 100) {
          // Significant evaluation swing
          moments.push({
            moveNumber: move.moveNumber,
            player: move.moveNumber % 2 === 1 ? 'red' : 'black',
            beforeScore: move.evaluationBefore,
            afterScore: move.evaluationAfter,
            classification: move.classification || 'UNKNOWN',
          });
        }
      }
    }

    // Sort by eval swing (largest first), take top 5
    moments.sort((a, b) =>
      Math.abs(b.afterScore - b.beforeScore) -
      Math.abs(a.afterScore - a.beforeScore),
    );

    return moments.slice(0, 5);
  }
}
