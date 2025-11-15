/**
 * 360° РАБОТА - ULTRA EDITION
 * Wallet Balance Hook with Caching
 * ✅ P1-II-5: Example of optimized API hook usage
 */

import { useApiQuery } from './useApiQuery';
import { api } from '@/services/api';
import type { WalletBalance } from '@/services/api';

/**
 * Fetch wallet balance with automatic caching
 * Multiple components calling this hook will share the same request
 */
export function useWalletBalance(options?: {
  enabled?: boolean;
  refetchOnMount?: boolean;
}) {
  return useApiQuery<WalletBalance>({
    cacheKey: 'wallet-balance',
    queryFn: () => api.getWalletBalance(),
    enabled: options?.enabled ?? true,
    refetchOnMount: options?.refetchOnMount ?? false,
    cacheTTL: 30 * 1000, // 30 seconds cache
  });
}
