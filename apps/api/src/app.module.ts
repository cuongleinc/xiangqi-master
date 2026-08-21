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
      envFilePath: ['.env', '.env.local'],
    }),
    DatabaseModule,
    CacheModule,
    EngineModule,
    GameModule,
    AnalysisModule,
  ],
})
export class AppModule {}
