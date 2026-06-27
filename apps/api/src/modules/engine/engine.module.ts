import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EngineService } from './engine.service';
import { EngineController } from './engine.controller';

@Global()
@Module({
  controllers: [EngineController],
  providers: [
    {
      provide: 'ENGINE_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        path: configService.get<string>('engine.path') || process.env.ENGINE_PATH || (process.env.HOME ? process.env.HOME + '/.local/bin/pikafish' : '/usr/local/bin/pikafish'),
        hash: configService.get<number>('engine.hash', 64),
        threads: configService.get<number>('engine.threads', 1),
        evalFile: process.env.ENGINE_EVALFILE || (process.env.HOME ? process.env.HOME + '/.local/bin/pikafish.nnue' : undefined),
      }),
    },
    EngineService,
  ],
  exports: [EngineService],
})
export class EngineModule {}
