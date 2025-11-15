/**
 * 360° РАБОТА - ULTRA EDITION
 * Platform-specific utilities
 */

import { Platform, StatusBar, Dimensions } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Get StatusBar height for Android
 */
export const getStatusBarHeight = () => {
  if (isAndroid) {
    return StatusBar.currentHeight || 0;
  }
  return 0; // iOS uses SafeAreaView
};

/**
 * Get safe area padding for Android
 */
export const getSafeAreaPadding = () => {
  if (isAndroid) {
    return {
      paddingTop: getStatusBarHeight(),
    };
  }
  return {};
};

/**
 * Shadow style for cross-platform
 * iOS uses shadowColor, shadowOffset, etc.
 * Android uses elevation
 */
export const getShadowStyle = (elevation: number = 4) => {
  if (isIOS) {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.25,
      shadowRadius: elevation,
    };
  }
  return {
    elevation,
  };
};

/**
 * Keyboard behavior for KeyboardAvoidingView
 */
export const getKeyboardBehavior = (): 'padding' | 'height' | undefined => {
  return isIOS ? 'padding' : undefined;
};

/**
 * Keyboard vertical offset for KeyboardAvoidingView
 */
export const getKeyboardVerticalOffset = (defaultOffset: number = 0): number => {
  if (isIOS) {
    return defaultOffset || 0;
  }
  return 0;
};

/**
 * Check if device has notch (for Android 9+)
 */
export const hasNotch = () => {
  if (isAndroid) {
    const { height, width } = Dimensions.get('window');
    const aspectRatio = height / width;
    // Most devices with notch have aspect ratio > 2
    return aspectRatio > 2;
  }
  return false;
};

/**
 * Ripple effect config for Android
 */
export const getRippleConfig = (color: string = 'rgba(255, 255, 255, 0.2)') => {
  if (isAndroid) {
    return {
      android_ripple: {
        color,
        borderless: false,
      },
    };
  }
  return {};
};

/**
 * Text selection color for Android
 */
export const getTextSelectionProps = (color: string) => {
  if (isAndroid) {
    return {
      selectionColor: color,
      underlineColorAndroid: 'transparent',
    };
  }
  return {
    selectionColor: color,
  };
};

/**
 * Navigation bar height for Android
 */
export const getNavigationBarHeight = () => {
  if (isAndroid) {
    const { height } = Dimensions.get('screen');
    const windowHeight = Dimensions.get('window').height;
    return height - windowHeight - (getStatusBarHeight() || 0);
  }
  return 0;
};

/**
 * Bottom safe area padding for Android devices with gesture navigation
 */
export const getBottomSafeArea = () => {
  const navBarHeight = getNavigationBarHeight();
  if (navBarHeight > 0) {
    return navBarHeight;
  }
  return 0;
};

// ============================================
// ✅ P2-II-1: PERFORMANCE OPTIMIZATIONS
// ============================================

/**
 * Get performance-optimized view props for Android
 * Enables hardware acceleration and render optimization
 */
export const getOptimizedViewProps = () => {
  if (isAndroid) {
    return {
      // Enable hardware acceleration for smoother animations
      renderToHardwareTextureAndroid: true,
      // Collapse view hierarchy for better performance
      collapsable: false,
      // Remove clipped subviews to reduce memory
      removeClippedSubviews: true,
    };
  }
  return {};
};

/**
 * Get video player optimizations per platform
 */
export const getVideoPlayerOptimizations = () => {
  if (isIOS) {
    return {
      // iOS-specific optimizations
      ignoreSilentSwitch: 'ignore' as const,
      playInBackground: false,
      // Better seeking performance on iOS
      progressUpdateInterval: 250,
    };
  }

  // Android-specific optimizations
  return {
    // Android hardware acceleration for video
    useTextureView: true, // Better for animations
    // Prevent screen dimming during video playback
    preventsDisplaySleepDuringVideoPlayback: true,
    progressUpdateInterval: 500, // Less frequent on Android to save battery
  };
};

/**
 * Get FlatList optimizations per platform
 */
export const getFlatListOptimizations = () => {
  if (isIOS) {
    return {
      // iOS has better scroll performance with default settings
      maxToRenderPerBatch: 5,
      windowSize: 5,
      updateCellsBatchingPeriod: 50,
    };
  }

  // Android needs more conservative settings
  return {
    maxToRenderPerBatch: 3,
    windowSize: 3,
    updateCellsBatchingPeriod: 100,
    // Android-specific optimization
    removeClippedSubviews: true,
  };
};

/**
 * Get image caching strategy per platform
 */
export const getImageCacheStrategy = () => {
  if (isIOS) {
    return {
      // iOS has better built-in image caching
      cache: 'default' as const,
    };
  }

  // Android benefits from aggressive caching
  return {
    cache: 'force-cache' as const,
  };
};

/**
 * Get memory warning threshold per platform (MB)
 */
export const getMemoryWarningThreshold = () => {
  if (isIOS) {
    return 150; // iOS typically has more memory available
  }
  return 100; // Android devices vary, use conservative threshold
};

/**
 * Get animation config per platform
 */
export const getAnimationConfig = () => {
  if (isIOS) {
    return {
      // iOS handles 60fps animations well
      useNativeDriver: true,
      duration: 300,
    };
  }

  // Android may struggle on lower-end devices
  return {
    useNativeDriver: true,
    duration: 250, // Slightly faster for better perceived performance
  };
};

/**
 * Check if device should use reduced motion
 * (for accessibility and low-end devices)
 */
export const shouldUseReducedMotion = () => {
  // Can be extended to check AccessibilityInfo
  return false;
};

/**
 * Get blur view intensity per platform
 */
export const getBlurIntensity = (baseIntensity: number) => {
  if (isIOS) {
    return baseIntensity; // iOS handles blur well
  }
  // Reduce blur on Android for better performance
  return Math.max(baseIntensity * 0.7, 5);
};
