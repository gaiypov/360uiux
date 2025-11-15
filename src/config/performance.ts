/**
 * 360° РАБОТА - ULTRA EDITION
 * Platform-Specific Performance Configuration
 * ✅ P2-II-1: Automatically exports correct config per platform
 */

import { Platform } from 'react-native';
import * as AndroidConfig from './performance.android';
import * as IOSConfig from './performance.ios';

/**
 * Get platform-specific performance configuration
 */
export const PerformanceConfig = Platform.select({
  ios: IOSConfig.IOSPerformanceConfig,
  android: AndroidConfig.AndroidPerformanceConfig,
  default: AndroidConfig.AndroidPerformanceConfig, // Fallback
});

/**
 * Get platform-specific performance mode
 */
export const getPerformanceMode = Platform.select({
  ios: IOSConfig.getPerformanceMode,
  android: AndroidConfig.getPerformanceMode,
  default: AndroidConfig.getPerformanceMode,
})!;

/**
 * Get adjusted config based on performance mode
 */
export const getAdjustedConfig = Platform.select({
  ios: IOSConfig.getAdjustedConfig,
  android: AndroidConfig.getAdjustedConfig,
  default: AndroidConfig.getAdjustedConfig,
})!;

// Re-export configs for direct access if needed
export { AndroidPerformanceConfig } from './performance.android';
export { IOSPerformanceConfig } from './performance.ios';
