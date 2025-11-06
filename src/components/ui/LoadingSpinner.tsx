/**
 * 360° РАБОТА - ULTRA EDITION
 * Loading Spinner Component
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { colors, metalGradients, sizes } from '@/constants';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'pulse' | 'dots';
  color?: string;
}

export function LoadingSpinner({
  size = 'medium',
  variant = 'spinner',
  color = colors.platinumSilver,
}: LoadingSpinnerProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const spinnerSize = sizeMap[size];

  useEffect(() => {
    if (variant === 'spinner') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else if (variant === 'pulse') {
      scale.value = withRepeat(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [variant]);

  const animatedStyle = useAnimatedStyle(() => {
    if (variant === 'spinner') {
      return {
        transform: [{ rotate: `${rotation.value}deg` }],
      };
    } else if (variant === 'pulse') {
      return {
        transform: [{ scale: scale.value }],
      };
    }
    return {};
  });

  if (variant === 'spinner') {
    return (
      <Animated.View style={[animatedStyle, { width: spinnerSize, height: spinnerSize }]}>
        <ActivityIndicator size={size === 'small' ? 'small' : 'large'} color={color} />
      </Animated.View>
    );
  }

  if (variant === 'pulse') {
    return (
      <Animated.View style={[animatedStyle]}>
        <View
          style={[
            styles.pulseCircle,
            {
              width: spinnerSize,
              height: spinnerSize,
              borderRadius: spinnerSize / 2,
              backgroundColor: color,
            },
          ]}
        />
      </Animated.View>
    );
  }

  // Dots variant
  return <LoadingDots size={size} color={color} />;
}

function LoadingDots({ size, color }: { size: 'small' | 'medium' | 'large'; color: string }) {
  const dot1 = useSharedValue(1);
  const dot2 = useSharedValue(1);
  const dot3 = useSharedValue(1);

  const dotSizeMap = {
    small: 6,
    medium: 8,
    large: 10,
  };

  const dotSize = dotSizeMap[size];

  useEffect(() => {
    const animateDot = (sharedValue: any, delay: number) => {
      sharedValue.value = withRepeat(
        withTiming(0.3, {
          duration: 600,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    };

    setTimeout(() => animateDot(dot1, 0), 0);
    setTimeout(() => animateDot(dot2, 200), 200);
    setTimeout(() => animateDot(dot3, 400), 400);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: dot3.value }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View
        style={[
          dot1Style,
          styles.dot,
          { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color },
        ]}
      />
      <Animated.View
        style={[
          dot2Style,
          styles.dot,
          { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color },
        ]}
      />
      <Animated.View
        style={[
          dot3Style,
          styles.dot,
          { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: color },
        ]}
      />
    </View>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ visible = false }: { visible?: boolean }) {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.overlayContent}>
        <LoadingSpinner size="large" variant="spinner" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pulseCircle: {
    opacity: 0.6,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
  },
  dot: {
    // Dynamic styles applied inline
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    padding: sizes.xl,
    borderRadius: sizes.radiusLarge,
    backgroundColor: colors.carbonGray,
  },
});
