/**
 * 360° РАБОТА - ULTRA EDITION
 * Premium Glass Card Component with Variants
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { glassVariants, colors, sizes } from '@/constants';
import { isIOS, getShadowStyle } from '@/utils/platform';

type GlassVariant = 'light' | 'medium' | 'strong' | 'dark';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: GlassVariant;
  blurAmount?: number;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  variant = 'medium',
  blurAmount,
  noPadding = false,
}: GlassCardProps) {
  const glassConfig = glassVariants[variant];
  const finalBlurAmount = blurAmount ?? glassConfig.blur;

  // iOS: Use BlurView for glass effect
  // Android: Use solid background with subtle transparency
  if (isIOS) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: glassConfig.background,
            borderColor: glassConfig.border,
          },
          getShadowStyle(2),
          style,
        ]}
      >
        <BlurView
          style={styles.blur}
          blurType="dark"
          blurAmount={finalBlurAmount}
          reducedTransparencyFallbackColor={colors.graphiteBlack}
        >
          <View style={[styles.content, noPadding && styles.noPadding]}>
            {children}
          </View>
        </BlurView>
      </View>
    );
  }

  // Android fallback - no BlurView
  return (
    <View
      style={[
        styles.container,
        styles.androidContainer,
        {
          backgroundColor: glassConfig.background,
          borderColor: glassConfig.border,
        },
        getShadowStyle(2),
        style,
      ]}
    >
      <View style={[styles.content, noPadding && styles.noPadding]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    borderWidth: 1,
  },
  androidContainer: {
    // On Android, make background slightly more opaque since we don't have blur
    backgroundColor: colors.carbonGray,
  },
  blur: {
    flex: 1,
  },
  content: {
    padding: sizes.md,
  },
  noPadding: {
    padding: 0,
  },
});
