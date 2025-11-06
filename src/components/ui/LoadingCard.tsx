/**
 * 360° РАБОТА - ULTRA EDITION
 * Loading Skeleton Card
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { colors, sizes } from '@/constants';

interface LoadingCardProps {
  variant?: 'vacancy' | 'company' | 'application';
}

export function LoadingCard({ variant = 'vacancy' }: LoadingCardProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (variant === 'vacancy') {
    return (
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Animated.View style={[styles.avatar, animatedStyle]} />
          <View style={styles.headerText}>
            <Animated.View style={[styles.textLine, styles.textShort, animatedStyle]} />
            <Animated.View style={[styles.textLine, styles.textTiny, animatedStyle]} />
          </View>
        </View>

        <Animated.View style={[styles.title, animatedStyle]} />
        <Animated.View style={[styles.title, styles.titleShort, animatedStyle]} />

        <Animated.View style={[styles.badge, animatedStyle]} />

        <View style={styles.chips}>
          <Animated.View style={[styles.chip, animatedStyle]} />
          <Animated.View style={[styles.chip, animatedStyle]} />
          <Animated.View style={[styles.chip, animatedStyle]} />
        </View>
      </GlassCard>
    );
  }

  if (variant === 'company') {
    return (
      <GlassCard style={[styles.card, styles.companyCard]}>
        <Animated.View style={[styles.companyLogo, animatedStyle]} />
        <Animated.View style={[styles.textLine, styles.textMedium, animatedStyle]} />
        <Animated.View style={[styles.textLine, styles.textShort, animatedStyle]} />
      </GlassCard>
    );
  }

  // application variant
  return (
    <GlassCard style={styles.card}>
      <Animated.View style={[styles.statusBadge, animatedStyle]} />
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, animatedStyle]} />
        <Animated.View style={[styles.textLine, animatedStyle]} />
      </View>
      <Animated.View style={[styles.title, animatedStyle]} />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: sizes.md,
  },
  companyCard: {
    alignItems: 'center',
    paddingVertical: sizes.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.sm,
    marginBottom: sizes.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(232, 232, 237, 0.15)',
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(232, 232, 237, 0.15)',
    marginBottom: sizes.lg,
  },
  headerText: {
    flex: 1,
    gap: sizes.xs,
  },
  textLine: {
    height: 14,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusSmall,
  },
  textShort: {
    width: '60%',
  },
  textMedium: {
    width: '80%',
  },
  textTiny: {
    width: '40%',
  },
  title: {
    height: 20,
    backgroundColor: colors.carbonGray,
    borderRadius: sizes.radiusSmall,
    marginBottom: sizes.sm,
  },
  titleShort: {
    width: '70%',
  },
  badge: {
    width: 120,
    height: 32,
    backgroundColor: 'rgba(232, 232, 237, 0.1)',
    borderRadius: sizes.radiusMedium,
    marginBottom: sizes.md,
  },
  statusBadge: {
    width: 80,
    height: 24,
    backgroundColor: 'rgba(200, 200, 208, 0.15)',
    borderRadius: sizes.radiusSmall,
    marginBottom: sizes.sm,
  },
  chips: {
    flexDirection: 'row',
    gap: sizes.sm,
  },
  chip: {
    width: 60,
    height: 24,
    backgroundColor: colors.slateGray,
    borderRadius: sizes.radiusSmall,
  },
});
