import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from '../../database/entities/game.entity';
import { Move } from '../../database/entities/move.entity';
import { EngineModule } from '../engine/engine.module';
import { PvPGateway } from './pvp.gateway';
import { PvPService } from './pvp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, Move]),
    EngineModule, // engine.service is @Global, but explicit for clarity
  ],
  providers: [PvPGateway, PvPService],
  exports: [PvPService],
})
export class PvpModule {}
