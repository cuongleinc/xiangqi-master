import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis | null = null;
  private connected = false;

  constructor(private configService: ConfigService) {
    const host = configService.get<string>('redis.host');
    const port = configService.get<number>('redis.port');

    if (host && port) {
      try {
        this.redis = new Redis({
          host,
          port,
          password: configService.get<string>('redis.password') || undefined,
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => {
            if (times > 3) return null; // stop retrying
            return Math.min(times * 200, 2000);
          },
        });

        this.redis.on('connect', () => {
          this.connected = true;
          this.logger.log('Redis connected');
        });

        this.redis.on('error', (err) => {
          this.connected = false;
          this.logger.warn(`Redis error: ${err.message}. Running without cache.`);
        });
      } catch (err) {
        this.logger.warn(`Redis not available: ${(err as Error).message}`);
      }
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis || !this.connected) return null;
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.redis || !this.connected) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.set(key, serialized, 'EX', ttl);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch {
      // Silent fail — cache is best-effort
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis || !this.connected) return;
    try {
      await this.redis.del(key);
    } catch {
      // Silent fail
    }
  }

  async ping(): Promise<boolean> {
    if (!this.redis || !this.connected) return false;
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
