/**
 * 360° РАБОТА - Redis Configuration
 * Used for: Video tokens, session management, caching
 */
import Redis from 'ioredis';
export declare const redis: Redis;
export declare const redisHelpers: {
    /**
     * Set key with expiration in seconds
     */
    setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void>;
    /**
     * Get value and parse as JSON
     */
    getJSON<T>(key: string): Promise<T | null>;
    /**
     * Set JSON value with expiration
     */
    setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
    /**
     * Delete multiple keys by pattern
     */
    deleteByPattern(pattern: string): Promise<number>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Increment counter with expiration
     */
    incrementWithExpiry(key: string, ttlSeconds: number): Promise<number>;
};
export default redis;
//# sourceMappingURL=redis.d.ts.map