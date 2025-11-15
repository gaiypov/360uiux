/**
 * 360° РАБОТА - ULTRA EDITION
 * Comments Hook with Caching
 * ✅ P1-II-5: Example of optimized API hook usage
 */

import { useApiQuery } from './useApiQuery';
import { api } from '@/services/api';

interface UseCommentsOptions {
  vacancyId: string;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Fetch vacancy comments with automatic caching
 * Same vacancy comments will be cached and deduplicated
 */
export function useComments(options: UseCommentsOptions) {
  const { vacancyId, limit = 20, offset = 0, enabled = true } = options;

  return useApiQuery<any[]>({
    cacheKey: `comments-${vacancyId}-${limit}-${offset}`,
    queryFn: () => api.getComments(vacancyId, { limit, offset }),
    enabled,
    cacheTTL: 2 * 60 * 1000, // 2 minutes cache
  });
}
