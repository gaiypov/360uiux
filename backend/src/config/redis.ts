/**
 * Rework - Redis Configuration
 * Yandex Managed Redis connection
 */

import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('⚠️ REDIS_URL not configured, using mock Redis client');
}

// Create Redis client
const redis = redisUrl
  ? new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
    })
  : createMockRedis();

// Mock Redis for development without Redis
function createMockRedis() {
  const store = new Map<string, string>();

  return {
    ping: async () => 'PONG',
    get: async (key: string) => store.get(key) || null,
    set: async (key: string, value: string) => {
      store.set(key, value);
      return 'OK';
    },
    setex: async (key: string, seconds: number, value: string) => {
      store.set(key, value);
      setTimeout(() => store.delete(key), seconds * 1000);
      return 'OK';
    },
    del: async (key: string) => {
      store.delete(key);
      return 1;
    },
    quit: async () => 'OK',
    on: () => {},
  } as unknown as Redis;
}

// Event handlers
if (redisUrl) {
  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redis.on('close', () => {
    console.log('🔴 Redis connection closed');
  });
}

export default redis;
