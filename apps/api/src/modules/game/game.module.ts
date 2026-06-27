import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../../database/entities/game.entity';
import { Move } from '../../database/entities/move.entity';
import { AnalysisCache } from '../../database/entities/analysis-cache.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Move, AnalysisCache])],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
