"use strict";
/**
 * 360° РАБОТА - Redis Configuration
 * Used for: Video tokens, session management, caching
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisHelpers = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
// Parse Redis URL for connection options
const parseRedisUrl = (url) => {
    try {
        const urlObj = new URL(url);
        return {
            host: urlObj.hostname,
            port: parseInt(urlObj.port) || 6379,
            password: urlObj.password || undefined,
            db: parseInt(urlObj.pathname.slice(1)) || 0,
        };
    }
    catch {
        return {
            host: 'localhost',
            port: 6379,
        };
    }
};
const redisOptions = parseRedisUrl(REDIS_URL);
// Create Redis client
exports.redis = new ioredis_1.default({
    ...redisOptions,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
});
// Event handlers
exports.redis.on('connect', () => {
    console.log('✅ Redis connected');
});
exports.redis.on('ready', () => {
    console.log('🔥 Redis ready');
});
exports.redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});
exports.redis.on('close', () => {
    console.log('⚠️  Redis connection closed');
});
exports.redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Closing Redis connection...');
    await exports.redis.quit();
});
process.on('SIGINT', async () => {
    console.log('Closing Redis connection...');
    await exports.redis.quit();
});
// Helper functions
exports.redisHelpers = {
    /**
     * Set key with expiration in seconds
     */
    async setWithExpiry(key, value, ttlSeconds) {
        await exports.redis.setex(key, ttlSeconds, value);
    },
    /**
     * Get value and parse as JSON
     */
    async getJSON(key) {
        const value = await exports.redis.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    },
    /**
     * Set JSON value with expiration
     */
    async setJSON(key, value, ttlSeconds) {
        const jsonString = JSON.stringify(value);
        if (ttlSeconds) {
            await exports.redis.setex(key, ttlSeconds, jsonString);
        }
        else {
            await exports.redis.set(key, jsonString);
        }
    },
    /**
     * Delete multiple keys by pattern
     */
    async deleteByPattern(pattern) {
        const keys = await exports.redis.keys(pattern);
        if (keys.length === 0)
            return 0;
        return await exports.redis.del(...keys);
    },
    /**
     * Check if key exists
     */
    async exists(key) {
        const result = await exports.redis.exists(key);
        return result === 1;
    },
    /**
     * Increment counter with expiration
     */
    async incrementWithExpiry(key, ttlSeconds) {
        const value = await exports.redis.incr(key);
        if (value === 1) {
            // First increment, set TTL
            await exports.redis.expire(key, ttlSeconds);
        }
        return value;
    },
};
exports.default = exports.redis;
//# sourceMappingURL=redis.js.map