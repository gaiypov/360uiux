/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Glass Card Component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { colors, sizes } from '@/constants';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurAmount?: number;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  blurAmount = 12,
  noPadding = false,
}: GlassCardProps) {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        style={styles.blur}
        blurType="dark"
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={colors.graphiteGray}
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
    backgroundColor: colors.glassBackground,
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
