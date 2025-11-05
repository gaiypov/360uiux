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
