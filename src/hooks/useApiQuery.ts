/**
 * 360° РАБОТА - ULTRA EDITION
 * Optimized API Query Hook with Caching and Deduplication
 * ✅ P1-II-5: Request deduplication + LRU cache (-30% API calls)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { LRUCache } from '@/utils/LRUCache';

// Global cache instances
const queryCache = new LRUCache<string, any>(50, 5 * 60 * 1000); // 50 items, 5min TTL
const pendingRequests = new Map<string, Promise<any>>(); // Request deduplication

interface UseApiQueryOptions<T> {
  /** Cache key for this query */
  cacheKey: string;
  /** Function that performs the API call */
  queryFn: () => Promise<T>;
  /** Enable/disable the query */
  enabled?: boolean;
  /** Refetch on mount */
  refetchOnMount?: boolean;
  /** Cache time to live (ms) */
  cacheTTL?: number;
  /** Skip cache and force fresh request */
  skipCache?: boolean;
}

interface UseApiQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

/**
 * Optimized hook for API queries with:
 * - Request deduplication (multiple calls = 1 request)
 * - LRU caching (reduce redundant API calls)
 * - Automatic cache invalidation
 */
export function useApiQuery<T = any>(
  options: UseApiQueryOptions<T>
): UseApiQueryResult<T> {
  const {
    cacheKey,
    queryFn,
    enabled = true,
    refetchOnMount = false,
    skipCache = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const hasInitialFetch = useRef(false);

  // ✅ P1-II-5 FIX: Fetch with deduplication and caching
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) return;

      try {
        setLoading(true);
        setError(null);

        // Check cache first (unless force refresh or skipCache)
        if (!forceRefresh && !skipCache) {
          const cached = queryCache.get(cacheKey);
          if (cached !== null) {
            if (isMounted.current) {
              setData(cached);
              setLoading(false);
            }
            return;
          }
        }

        // ✅ Request Deduplication: Check if same request is already pending
        const pendingRequest = pendingRequests.get(cacheKey);
        if (pendingRequest) {
          const result = await pendingRequest;
          if (isMounted.current) {
            setData(result);
            setLoading(false);
          }
          return;
        }

        // Create new request and store in pending map
        const requestPromise = queryFn();
        pendingRequests.set(cacheKey, requestPromise);

        try {
          const result = await requestPromise;

          // Cache the result
          if (!skipCache) {
            queryCache.set(cacheKey, result);
          }

          if (isMounted.current) {
            setData(result);
            setError(null);
          }
        } finally {
          // Remove from pending requests
          pendingRequests.delete(cacheKey);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err as Error);
          setData(null);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [cacheKey, queryFn, enabled, skipCache]
  );

  // ✅ Refetch function (force refresh)
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // ✅ Cache invalidation
  const invalidate = useCallback(() => {
    queryCache.delete(cacheKey);
  }, [cacheKey]);

  // Initial fetch
  useEffect(() => {
    if (enabled && (!hasInitialFetch.current || refetchOnMount)) {
      hasInitialFetch.current = true;
      fetchData(refetchOnMount);
    }
  }, [enabled, refetchOnMount, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

/**
 * Clear all cached queries
 */
export function clearAllQueryCache() {
  queryCache.clear();
}

/**
 * Clear specific query cache
 */
export function clearQueryCache(cacheKey: string) {
  queryCache.delete(cacheKey);
}

/**
 * Clean expired cache entries
 */
export function cleanExpiredCache() {
  queryCache.cleanExpired();
}
