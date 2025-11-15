/**
 * 360° РАБОТА - ULTRA EDITION
 * iOS Performance Configuration
 * ✅ P2-II-1: iOS-specific performance optimizations
 *
 * Note: Some settings should be configured in Info.plist
 */

/**
 * Recommended Info.plist optimizations:
 *
 * <key>UIViewControllerBasedStatusBarAppearance</key>
 * <false/>
 * <key>UIBackgroundModes</key>
 * <array>
 *   <string>audio</string> (only if needed for background audio)
 * </array>
 * <key>NSAppTransportSecurity</key>
 * <dict>
 *   <key>NSAllowsArbitraryLoads</key>
 *   <false/>
 * </dict>
 */

export const IOSPerformanceConfig = {
  /**
   * Video Player Settings
   */
  video: {
    // iOS-specific optimizations
    ignoreSilentSwitch: 'ignore' as const,
    playInBackground: false,
    // Better seeking performance on iOS
    progressUpdateInterval: 250,
    // Prefer AVPlayerViewController for better performance
    useNativeControls: false,
    // Picture in Picture (iOS 14+)
    pictureInPicture: false,
  },

  /**
   * FlatList / ScrollView Settings
   */
  lists: {
    // iOS handles scrolling well
    removeClippedSubviews: false, // iOS doesn't need this
    maxToRenderPerBatch: 5,
    windowSize: 5,
    updateCellsBatchingPeriod: 50,
    initialNumToRender: 3,
    // iOS-specific scroll optimization
    scrollEventThrottle: 16, // 60fps
  },

  /**
   * Image Loading Settings
   */
  images: {
    // iOS has better built-in caching
    cache: 'default' as const,
    resizeMode: 'cover' as const,
    fadeDuration: 300,
  },

  /**
   * Animation Settings
   */
  animations: {
    // iOS handles 60fps well
    useNativeDriver: true,
    duration: 300,
    // Spring animations work great on iOS
    springConfig: {
      damping: 15,
      mass: 1,
      stiffness: 150,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  },

  /**
   * Memory Management
   */
  memory: {
    // iOS typically has more memory
    warningThreshold: 150,
    enableMonitoring: __DEV__,
    clearCacheInterval: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * Network Settings
   */
  network: {
    timeout: 30000,
    maxRetries: 3,
    enableDeduplication: true,
    // iOS network optimizations
    allowsCellularAccess: true,
    waitsForConnectivity: true,
  },

  /**
   * Blur Settings
   */
  blur: {
    // iOS handles blur effects well
    blurType: 'dark' as const,
    blurAmount: 12,
    // Use UIVisualEffectView for better performance
    useNativeBlur: true,
  },

  /**
   * Haptic Feedback Settings
   */
  haptics: {
    // iOS has rich haptic engine
    enableVibrateFallback: false,
    // Use system settings
    ignoreSystemSettings: false,
  },
};

/**
 * Get performance mode for iOS
 * iOS devices generally have consistent performance
 */
export const getPerformanceMode = (): 'high' | 'medium' => {
  // Most iOS devices can handle high performance
  // TODO: Can check for older devices (iPhone 8 and below)
  return 'high';
};

/**
 * Apply performance mode adjustments for iOS
 */
export const getAdjustedConfig = (mode: 'high' | 'medium' = 'high') => {
  const config = { ...IOSPerformanceConfig };

  if (mode === 'medium') {
    // Slight reduction for older devices
    config.lists.maxToRenderPerBatch = 4;
    config.lists.windowSize = 4;
    config.blur.blurAmount = 10;
  }

  return config;
};
