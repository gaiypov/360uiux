/**
 * 360° РАБОТА - ULTRA EDITION
 * Android Performance Configuration
 * ✅ P2-II-1: Android-specific performance optimizations
 *
 * Note: Some of these settings should be configured in android/app/src/main/AndroidManifest.xml
 */

/**
 * Recommended AndroidManifest.xml optimizations:
 *
 * <application
 *   android:hardwareAccelerated="true"
 *   android:largeHeap="true"
 *   android:usesCleartextTraffic="false"
 *   android:allowBackup="false"
 * >
 *   <activity
 *     android:windowSoftInputMode="adjustResize"
 *     android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
 *     android:launchMode="singleTask"
 *   />
 * </application>
 */

export const AndroidPerformanceConfig = {
  /**
   * Video Player Settings
   */
  video: {
    // Use TextureView for better animation performance
    useTextureView: true,
    // Hardware acceleration
    hardwareAcceleration: true,
    // Buffer config for smoother playback
    bufferConfig: {
      minBufferMs: 15000,
      maxBufferMs: 50000,
      bufferForPlaybackMs: 2500,
      bufferForPlaybackAfterRebufferMs: 5000,
    },
  },

  /**
   * FlatList / ScrollView Settings
   */
  lists: {
    // Remove views outside viewport
    removeClippedSubviews: true,
    // Conservative rendering for Android
    maxToRenderPerBatch: 3,
    windowSize: 3,
    updateCellsBatchingPeriod: 100,
    initialNumToRender: 2,
  },

  /**
   * Image Loading Settings
   */
  images: {
    // Aggressive caching for Android
    cache: 'force-cache' as const,
    // Resize mode for memory efficiency
    resizeMode: 'cover' as const,
    // Fade duration
    fadeDuration: 200,
  },

  /**
   * Animation Settings
   */
  animations: {
    // Use native driver when possible
    useNativeDriver: true,
    // Shorter durations for better perceived performance
    duration: 250,
    // Reduce motion on low-end devices
    enableReducedMotion: false,
  },

  /**
   * Memory Management
   */
  memory: {
    // Warning threshold in MB
    warningThreshold: 100,
    // Enable memory monitoring
    enableMonitoring: __DEV__,
    // Clear cache interval (ms)
    clearCacheInterval: 5 * 60 * 1000, // 5 minutes
  },

  /**
   * Network Settings
   */
  network: {
    // Request timeout
    timeout: 30000,
    // Retry attempts
    maxRetries: 3,
    // Enable request deduplication
    enableDeduplication: true,
  },

  /**
   * Render Settings
   */
  render: {
    // Hardware acceleration for views
    renderToHardwareTextureAndroid: true,
    // Collapse empty views
    collapsable: false,
    // Reduce overdraw
    needsOffscreenAlphaCompositing: false,
  },
};

/**
 * Get performance mode based on device capabilities
 * Can be extended to detect device specs
 */
export const getPerformanceMode = (): 'high' | 'medium' | 'low' => {
  // TODO: Implement device detection
  // For now, assume medium performance
  return 'medium';
};

/**
 * Apply performance mode adjustments
 */
export const getAdjustedConfig = (mode: 'high' | 'medium' | 'low' = 'medium') => {
  const config = { ...AndroidPerformanceConfig };

  if (mode === 'low') {
    // Reduce quality for low-end devices
    config.lists.maxToRenderPerBatch = 2;
    config.lists.windowSize = 2;
    config.animations.duration = 200;
    config.video.bufferConfig.minBufferMs = 10000;
  } else if (mode === 'high') {
    // Increase quality for high-end devices
    config.lists.maxToRenderPerBatch = 5;
    config.lists.windowSize = 5;
    config.animations.duration = 300;
    config.video.bufferConfig.minBufferMs = 20000;
  }

  return config;
};
