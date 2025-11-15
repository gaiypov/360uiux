/**
 * 360° РАБОТА - ULTRA EDITION
 * Hooks Index
 * ✅ P1-II-5: Centralized hooks export
 */

// Core optimized query hook
export { useApiQuery, clearAllQueryCache, clearQueryCache, cleanExpiredCache } from './useApiQuery';

// Specialized hooks with caching
export { useWalletBalance } from './useWalletBalance';
export { useComments } from './useComments';
export { useFavorites } from './useFavorites';

// Legacy hooks
export { useVacancyFeed } from './useVacancyFeed';
