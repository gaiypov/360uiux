/**
 * 360° РАБОТА - Redis Cache Service
 * Ultra-fast caching for production performance
 *
 * Cache Strategy:
 * - Video tokens: 5 minutes
 * - Vacancy lists: 1 hour
 * - User profiles: 30 minutes
 * - Stats: 15 minutes
 */

import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    // Initialize Redis client
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
      this.isConnected = true;
    });

    this.redis.on('error', (error) => {
      console.error('❌ Redis error:', error);
      this.isConnected = false;
    });

    this.redis.on('close', () => {
      console.log('🔌 Redis connection closed');
      this.isConnected = false;
    });
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key: string, value: any, ttlSeconds: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttlSeconds, serialized);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.redis.del(...keys);
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get or set with callback
   */
  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    callback: () => Promise<T>
  ): Promise<T | null> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, execute callback
      const value = await callback();
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttlSeconds);
      }

      return value;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      return null;
    }
  }

  // ============= SPECIFIC CACHE METHODS =============

  /**
   * Cache video token (5 minutes)
   */
  async cacheVideoToken(videoId: string, token: string): Promise<boolean> {
    const key = `video:token:${videoId}`;
    return await this.set(key, token, 300); // 5 minutes
  }

  /**
   * Get video token
   */
  async getVideoToken(videoId: string): Promise<string | null> {
    const key = `video:token:${videoId}`;
    return await this.get<string>(key);
  }

  /**
   * Cache vacancy list (1 hour)
   */
  async cacheVacancyList(filters: any, vacancies: any[]): Promise<boolean> {
    const key = `vacancies:list:${JSON.stringify(filters)}`;
    return await this.set(key, vacancies, 3600); // 1 hour
  }

  /**
   * Get cached vacancy list
   */
  async getVacancyList(filters: any): Promise<any[] | null> {
    const key = `vacancies:list:${JSON.stringify(filters)}`;
    return await this.get<any[]>(key);
  }

  /**
   * Invalidate all vacancy caches
   */
  async invalidateVacancies(): Promise<number> {
    return await this.delPattern('vacancies:list:*');
  }

  /**
   * Cache user profile (30 minutes)
   */
  async cacheUserProfile(userId: string, profile: any): Promise<boolean> {
    const key = `user:profile:${userId}`;
    return await this.set(key, profile, 1800); // 30 minutes
  }

  /**
   * Get cached user profile
   */
  async getUserProfile(userId: string): Promise<any | null> {
    const key = `user:profile:${userId}`;
    return await this.get<any>(key);
  }

  /**
   * Invalidate user profile
   */
  async invalidateUserProfile(userId: string): Promise<boolean> {
    const key = `user:profile:${userId}`;
    return await this.del(key);
  }

  /**
   * Cache stats (15 minutes)
   */
  async cacheStats(type: string, data: any): Promise<boolean> {
    const key = `stats:${type}`;
    return await this.set(key, data, 900); // 15 minutes
  }

  /**
   * Get cached stats
   */
  async getStats(type: string): Promise<any | null> {
    const key = `stats:${type}`;
    return await this.get<any>(key);
  }

  /**
   * Cache vacancy by ID (1 hour)
   */
  async cacheVacancy(vacancyId: string, vacancy: any): Promise<boolean> {
    const key = `vacancy:${vacancyId}`;
    return await this.set(key, vacancy, 3600); // 1 hour
  }

  /**
   * Get cached vacancy
   */
  async getVacancy(vacancyId: string): Promise<any | null> {
    const key = `vacancy:${vacancyId}`;
    return await this.get<any>(key);
  }

  /**
   * Invalidate specific vacancy
   */
  async invalidateVacancy(vacancyId: string): Promise<boolean> {
    const key = `vacancy:${vacancyId}`;
    const deleted = await this.del(key);
    // Also invalidate all vacancy lists
    await this.invalidateVacancies();
    return deleted;
  }

  /**
   * Cache application count for vacancy (5 minutes)
   */
  async cacheApplicationCount(vacancyId: string, count: number): Promise<boolean> {
    const key = `vacancy:${vacancyId}:applications:count`;
    return await this.set(key, count, 300); // 5 minutes
  }

  /**
   * Get cached application count
   */
  async getApplicationCount(vacancyId: string): Promise<number | null> {
    const key = `vacancy:${vacancyId}:applications:count`;
    return await this.get<number>(key);
  }

  /**
   * Increment counter (for rate limiting)
   */
  async incrementCounter(key: string, ttlSeconds: number): Promise<number> {
    try {
      const count = await this.redis.incr(key);
      if (count === 1) {
        // First increment, set TTL
        await this.redis.expire(key, ttlSeconds);
      }
      return count;
    } catch (error) {
      console.error('Counter increment error:', error);
      return 0;
    }
  }

  /**
   * Rate limiting: Check if action is allowed
   */
  async checkRateLimit(
    userId: string,
    action: string,
    maxAttempts: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${action}:${userId}`;
    const count = await this.incrementCounter(key, windowSeconds);

    return {
      allowed: count <= maxAttempts,
      remaining: Math.max(0, maxAttempts - count),
    };
  }

  /**
   * Clear all cache (use with caution!)
   */
  async flushAll(): Promise<boolean> {
    try {
      await this.redis.flushdb();
      console.log('🗑️  Cache cleared');
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  /**
   * Get cache stats
   */
  async getInfo(): Promise<string> {
    try {
      return await this.redis.info();
    } catch (error) {
      console.error('Cache info error:', error);
      return '';
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
    this.isConnected = false;
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const cacheService = new CacheService();
