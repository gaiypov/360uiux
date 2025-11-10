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
export declare class CacheService {
    private redis;
    private isConnected;
    constructor();
    /**
     * Setup Redis event handlers
     */
    private setupEventHandlers;
    /**
     * Get value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set value in cache with TTL
     */
    set(key: string, value: any, ttlSeconds: number): Promise<boolean>;
    /**
     * Delete key from cache
     */
    del(key: string): Promise<boolean>;
    /**
     * Delete multiple keys by pattern
     */
    delPattern(pattern: string): Promise<number>;
    /**
     * Check if key exists
     */
    exists(key: string): Promise<boolean>;
    /**
     * Get or set with callback
     */
    getOrSet<T>(key: string, ttlSeconds: number, callback: () => Promise<T>): Promise<T | null>;
    /**
     * Cache video token (5 minutes)
     */
    cacheVideoToken(videoId: string, token: string): Promise<boolean>;
    /**
     * Get video token
     */
    getVideoToken(videoId: string): Promise<string | null>;
    /**
     * Cache vacancy list (1 hour)
     */
    cacheVacancyList(filters: any, vacancies: any[]): Promise<boolean>;
    /**
     * Get cached vacancy list
     */
    getVacancyList(filters: any): Promise<any[] | null>;
    /**
     * Invalidate all vacancy caches
     */
    invalidateVacancies(): Promise<number>;
    /**
     * Cache user profile (30 minutes)
     */
    cacheUserProfile(userId: string, profile: any): Promise<boolean>;
    /**
     * Get cached user profile
     */
    getUserProfile(userId: string): Promise<any | null>;
    /**
     * Invalidate user profile
     */
    invalidateUserProfile(userId: string): Promise<boolean>;
    /**
     * Cache stats (15 minutes)
     */
    cacheStats(type: string, data: any): Promise<boolean>;
    /**
     * Get cached stats
     */
    getStats(type: string): Promise<any | null>;
    /**
     * Cache vacancy by ID (1 hour)
     */
    cacheVacancy(vacancyId: string, vacancy: any): Promise<boolean>;
    /**
     * Get cached vacancy
     */
    getVacancy(vacancyId: string): Promise<any | null>;
    /**
     * Invalidate specific vacancy
     */
    invalidateVacancy(vacancyId: string): Promise<boolean>;
    /**
     * Cache application count for vacancy (5 minutes)
     */
    cacheApplicationCount(vacancyId: string, count: number): Promise<boolean>;
    /**
     * Get cached application count
     */
    getApplicationCount(vacancyId: string): Promise<number | null>;
    /**
     * Increment counter (for rate limiting)
     */
    incrementCounter(key: string, ttlSeconds: number): Promise<number>;
    /**
     * Rate limiting: Check if action is allowed
     */
    checkRateLimit(userId: string, action: string, maxAttempts: number, windowSeconds: number): Promise<{
        allowed: boolean;
        remaining: number;
    }>;
    /**
     * Clear all cache (use with caution!)
     */
    flushAll(): Promise<boolean>;
    /**
     * Get cache stats
     */
    getInfo(): Promise<string>;
    /**
     * Close Redis connection
     */
    close(): Promise<void>;
    /**
     * Check if cache is available
     */
    isAvailable(): boolean;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=CacheService.d.ts.map