import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { CacheModule } from './cache/cache.module';
import { EngineModule } from './modules/engine/engine.module';
import { GameModule } from './modules/game/game.module';
import { AnalysisModule } from './modules/analysis/analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Dev runs with CWD = apps/api, so also load the monorepo-root .env
      // (created by `pnpm setup` / `cp .env.example .env`).
      envFilePath: ['.env', '.env.local', '../../.env'],
    }),
    DatabaseModule,
    CacheModule,
    EngineModule,
    GameModule,
    AnalysisModule,
  ],
})
export class AppModule {}
