import { registerAs } from '@nestjs/config';

export default registerAs('engine', () => ({
  path: process.env.ENGINE_PATH || process.env.HOME + '/.local/bin/pikafish',
  hash: parseInt(process.env.ENGINE_HASH || '64', 10),
  threads: parseInt(process.env.ENGINE_THREADS || '1', 10),
  timeout: parseInt(process.env.ENGINE_TIMEOUT || '60000', 10),
  movetimeEasy: parseInt(process.env.ENGINE_TIME_EASY || '100', 10),
  movetimeMedium: parseInt(process.env.ENGINE_TIME_MEDIUM || '500', 10),
  movetimeHard: parseInt(process.env.ENGINE_TIME_HARD || '1500', 10),
  movetimeExpert: parseInt(process.env.ENGINE_TIME_EXPERT || '5000', 10),
}));
