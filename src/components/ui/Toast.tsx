/**
 * 360° РАБОТА - ULTRA EDITION
 * Toast Notification Component
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { colors, typography, sizes } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export function Toast({
  type,
  message,
  visible,
  onHide,
  duration = 3000,
}: ToastProps) {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });

      const timeout = setTimeout(() => {
        translateY.value = withSpring(-100, { damping: 15 }, () => {
          runOnJS(onHide)();
        });
      }, duration);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'info':
        return 'information';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.cyberBlue;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView
        style={styles.blur}
        blurType="dark"
        blurAmount={12}
        reducedTransparencyFallbackColor={colors.graphiteBlack}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: `${getColor()}20` }]}>
            <Icon name={getIcon()} size={24} color={getColor()} />
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
      </BlurView>
      <View style={[styles.accent, { backgroundColor: getColor() }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: sizes.md,
    right: sizes.md,
    zIndex: 9999,
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.primaryBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.3,
    elevation: 10,
  },
  blur: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: sizes.md,
    gap: sizes.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...typography.bodyMedium,
    color: colors.softWhite,
    flex: 1,
  },
  accent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
