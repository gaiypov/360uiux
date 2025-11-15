/**
 * 360° РАБОТА - ULTRA EDITION
 * Favorites Hook with Caching
 * ✅ P1-II-5: Example of optimized API hook usage
 */

import { useApiQuery } from './useApiQuery';
import { api } from '@/services/api';

interface UseFavoritesOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
  refetchOnMount?: boolean;
}

/**
 * Fetch favorite vacancies with automatic caching
 * Multiple screens accessing favorites will use cached data
 */
export function useFavorites(options?: UseFavoritesOptions) {
  const { limit = 50, offset = 0, enabled = true, refetchOnMount = false } = options || {};

  return useApiQuery<any[]>({
    cacheKey: `favorites-${limit}-${offset}`,
    queryFn: () => api.getFavorites({ limit, offset }),
    enabled,
    refetchOnMount,
    cacheTTL: 60 * 1000, // 1 minute cache
  });
}
