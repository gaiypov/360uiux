/**
 * 360° РАБОТА - ULTRA EDITION
 * Pressable Scale Component - Micro-interaction Animation
 */

import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { sizes } from '@/constants';

interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  scaleValue?: number;
  haptic?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  scaleValue = 0.95,
  haptic = true,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(scaleValue, sizes.springBouncy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, sizes.springDefault);
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, props.style]}
    >
      {children}
    </AnimatedPressable>
  );
}
