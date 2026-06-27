import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisCache } from '../../database/entities/analysis-cache.entity';
import { Move } from '../../database/entities/move.entity';
import { Game } from '../../database/entities/game.entity';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnalysisCache, Move, Game])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
