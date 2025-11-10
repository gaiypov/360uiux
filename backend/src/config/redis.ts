/**
 * 360° РАБОТА - Redis Configuration
 * Used for: Video tokens, session management, caching
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL for connection options
const parseRedisUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return {
      host: urlObj.hostname,
      port: parseInt(urlObj.port) || 6379,
      password: urlObj.password || undefined,
      db: parseInt(urlObj.pathname.slice(1)) || 0,
    };
  } catch {
    return {
      host: 'localhost',
      port: 6379,
    };
  }
};

const redisOptions = parseRedisUrl(REDIS_URL);

// Create Redis client
export const redis = new Redis({
  ...redisOptions,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('ready', () => {
  console.log('🔥 Redis ready');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis error:', err.message);
});

redis.on('close', () => {
  console.log('⚠️  Redis connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing Redis connection...');
  await redis.quit();
});

process.on('SIGINT', async () => {
  console.log('Closing Redis connection...');
  await redis.quit();
});

// Helper functions
export const redisHelpers = {
  /**
   * Set key with expiration in seconds
   */
  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    await redis.setex(key, ttlSeconds, value);
  },

  /**
   * Get value and parse as JSON
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set JSON value with expiration
   */
  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const jsonString = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, jsonString);
    } else {
      await redis.set(key, jsonString);
    }
  },

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;
    return await redis.del(...keys);
  },

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  },

  /**
   * Increment counter with expiration
   */
  async incrementWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    const value = await redis.incr(key);
    if (value === 1) {
      // First increment, set TTL
      await redis.expire(key, ttlSeconds);
    }
    return value;
  },
};

export default redis;
