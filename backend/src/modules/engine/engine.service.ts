import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PikafishEngine } from '@repo/engine-client';
import type { PikafishConfig, EngineHealth } from '@repo/engine-client';

@Injectable()
export class EngineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EngineService.name);
  private engine: PikafishEngine | null = null;
  private isReady = false;

  constructor(
    @Inject('ENGINE_CONFIG') private config: PikafishConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.engine = PikafishEngine.getInstance(this.config);
      await this.engine.start();
      this.isReady = true;
      this.logger.log('Pikafish engine started successfully');
    } catch (err) {
      this.isReady = false;
      this.logger.warn(
        `Engine not available (set ENGINE_PATH in .env): ${(err as Error).message}`,
      );
      this.logger.warn('API will start without engine — analysis features disabled');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.stop();
        this.logger.log('Engine stopped');
      } catch (err) {
        this.logger.error(`Error stopping engine: ${(err as Error).message}`);
      }
    }
  }

  async getBestMove(
    fen: string,
    movetime?: number,
  ): Promise<{ bestMove: string; score: number; depth: number; pv: string[] }> {
    if (!this.engine || !this.isReady) {
      throw new Error('Engine not available');
    }
    return this.engine.getBestMove(fen, movetime);
  }

  async evaluate(fen: string, movetime?: number): Promise<{
    score: number;
    mate?: number;
    depth: number;
    pv: string[];
  }> {
    if (!this.engine || !this.isReady) {
      throw new Error('Engine not available');
    }
    return this.engine.evaluate(fen, movetime);
  }

  getHealth(): { healthy: boolean; engine: EngineHealth | null } {
    return {
      healthy: this.isReady,
      engine: this.engine?.getStatus() ?? null,
    };
  }

  isEngineReady(): boolean {
    return this.isReady;
  }

  getDifficultyMovetime(difficulty: string): number {
    const { ConfigService } = require('@nestjs/config');
    // Map difficulty to configured movetime
    switch (difficulty) {
      case 'easy': return 100;
      case 'medium': return 500;
      case 'hard': return 1500;
      case 'expert': return 5000;
      default: return 500;
    }
  }
}
