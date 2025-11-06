/**
 * 360° РАБОТА - ULTRA EDITION
 * Haptic Feedback Utilities
 */

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Platform } from 'react-native';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const haptics = {
  /**
   * Light impact feedback (button press, toggle)
   */
  light: () => {
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    } else {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  },

  /**
   * Medium impact feedback (swipe action, tab change)
   */
  medium: () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
  },

  /**
   * Heavy impact feedback (important action, delete)
   */
  heavy: () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
  },

  /**
   * Selection feedback (picker scroll, slider move)
   */
  selection: () => {
    ReactNativeHapticFeedback.trigger('selection', hapticOptions);
  },

  /**
   * Success feedback (operation completed)
   */
  success: () => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
  },

  /**
   * Warning feedback (important notification)
   */
  warning: () => {
    ReactNativeHapticFeedback.trigger('notificationWarning', hapticOptions);
  },

  /**
   * Error feedback (operation failed)
   */
  error: () => {
    ReactNativeHapticFeedback.trigger('notificationError', hapticOptions);
  },

  /**
   * Soft feedback for subtle interactions
   */
  soft: () => {
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger('soft', hapticOptions);
    } else {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  },

  /**
   * Rigid feedback for definitive actions
   */
  rigid: () => {
    if (Platform.OS === 'ios') {
      ReactNativeHapticFeedback.trigger('rigid', hapticOptions);
    } else {
      ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
    }
  },
};

// Wrapper for optional haptic (can be disabled in settings)
export function triggerHaptic(
  type: keyof typeof haptics,
  enabled: boolean = true
) {
  if (enabled) {
    haptics[type]();
  }
}
