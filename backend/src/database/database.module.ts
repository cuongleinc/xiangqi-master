import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Game } from './entities/game.entity';
import { Move } from './entities/move.entity';
import { AnalysisCache } from './entities/analysis-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('database.host', 'localhost'),
        port: config.get<number>('database.port', 5432),
        username: config.get<string>('database.username', 'xiangqi'),
        password: config.get<string>('database.password', 'xiangqi_dev'),
        database: config.get<string>('database.database', 'xiangqi'),
        entities: [Game, Move, AnalysisCache],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development' ? ['error', 'warn'] : ['error'],
      }),
    }),
    TypeOrmModule.forFeature([Game, Move, AnalysisCache]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
