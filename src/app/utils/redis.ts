import Redis from 'ioredis';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';

let redisClient: Redis | null = null;
let redisDisabled = false;
const memoryCache = new Map<string, { value: string; expiresAt: number }>();

class MockRedis {
  private memoryStore: Map<string, string> = new Map();

  async setex(key: string, ttl: number, value: string): Promise<'OK'> {
    this.memoryStore.set(key, value);
    setTimeout(() => this.memoryStore.delete(key), ttl * 1000);
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    return this.memoryStore.get(key) || null;
  }

  async del(key: string): Promise<number> {
    const existed = this.memoryStore.has(key);
    this.memoryStore.delete(key);
    return existed ? 1 : 0;
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    const list = JSON.parse(this.memoryStore.get(key) || '[]');
    list.unshift(...values);
    this.memoryStore.set(key, JSON.stringify(list));
    return list.length;
  }

  async rpop(key: string): Promise<string | null> {
    const list = JSON.parse(this.memoryStore.get(key) || '[]');
    const value = list.pop();
    if (list.length > 0) {
      this.memoryStore.set(key, JSON.stringify(list));
    } else {
      this.memoryStore.delete(key);
    }
    return value || null;
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = JSON.parse(this.memoryStore.get(key) || '[]');
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  }

  async publish(channel: string, message: string): Promise<number> {
    return 0;
  }

  async subscribe(channel: string): Promise<void> {
    
  }

  on(event: string, callback: (...args: any[]) => void): this {
    return this;
  }

  duplicate(): MockRedis {
    return new MockRedis();
  }

  async quit(): Promise<void> {
    
  }
}

let mockRedisClient: MockRedis | null = null;

export function getRedisClient(): Redis | MockRedis {
  if (redisDisabled) {
    if (!mockRedisClient) {
      mockRedisClient = new MockRedis();
    }
    return mockRedisClient;
  }

  if (!redisClient) {
    try {
      logger.info('[Redis] 尝试连接 Redis...');

      if (REDIS_URL) {
        redisClient = new Redis(REDIS_URL, {
          db: REDIS_DB,
          password: REDIS_PASSWORD,
          retryStrategy: (times) => {
            if (times > 3 && NODE_ENV === 'development') {
              logger.warn('[Redis] 连接重试次数过多，在开发环境中降级为内存模式');
              redisDisabled = true;
              return null;
            }
            const delay = Math.min(times * 50, 2000);
            logger.warn(`[Redis] 连接重试，延迟: ${delay}ms`);
            return delay;
          },
          lazyConnect: true
        });
      } else {
        redisClient = new Redis({
          host: REDIS_HOST,
          port: REDIS_PORT,
          password: REDIS_PASSWORD,
          db: REDIS_DB,
          retryStrategy: (times) => {
            if (times > 3 && NODE_ENV === 'development') {
              logger.warn('[Redis] 连接重试次数过多，在开发环境中降级为内存模式');
              redisDisabled = true;
              return null;
            }
            const delay = Math.min(times * 50, 2000);
            logger.warn(`[Redis] 连接重试，延迟: ${delay}ms`);
            return delay;
          },
          lazyConnect: true
        });
      }

      redisClient.on('connect', () => {
        logger.info('[Redis] ✅ Redis连接成功');
      });

      redisClient.on('error', (err) => {
        logger.error('[Redis] ❌ Redis连接错误', { error: err.message });
        
        if (NODE_ENV === 'development') {
          logger.warn('[Redis] ⚠️ 开发环境检测到Redis错误，已降级为内存队列模式');
          redisDisabled = true;
        }
      });

      redisClient.on('close', () => {
        logger.warn('[Redis] Redis连接已关闭');
      });

      redisClient.connect().catch((err) => {
        logger.error('[Redis] 初始连接失败', { error: err.message });
        if (NODE_ENV === 'development') {
          logger.warn('[Redis] ⚠️ 开发环境Redis不可用，已优雅降级为内存模式');
          redisDisabled = true;
        }
      });

    } catch (error) {
      logger.error('[Redis] Redis初始化失败', { error: (error as Error).message });
      
      if (NODE_ENV === 'development') {
        logger.warn('[Redis] ⚠️ 开发环境Redis初始化失败，已降级为内存模式');
        redisDisabled = true;
        if (!mockRedisClient) {
          mockRedisClient = new MockRedis();
        }
        return mockRedisClient;
      }
      
      throw error;
    }
  }

  if (redisDisabled) {
    if (!mockRedisClient) {
      mockRedisClient = new MockRedis();
    }
    return mockRedisClient;
  }

  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('[Redis] Redis连接已关闭');
  }
  mockRedisClient = null;
}
