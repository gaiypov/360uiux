/**
 * 360° РАБОТА - ULTRA EDITION
 * Premium Glass Card Component with Variants
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { glassVariants, colors, sizes } from '@/constants';

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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: glassConfig.background,
          borderColor: glassConfig.border,
        },
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

const styles = StyleSheet.create({
  container: {
    borderRadius: sizes.radiusLarge,
    overflow: 'hidden',
    borderWidth: 1,
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
