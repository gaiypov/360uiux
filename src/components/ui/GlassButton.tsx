/**
 * 360° РАБОТА - ULTRA EDITION
 * Premium Glass Button Component
 * P1 FIX: Added accessibility support
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, metalGradients, typography, sizes } from '@/constants';
import { getShadowStyle, getRippleConfig } from '@/utils/platform';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}: GlassButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, getShadowStyle(8), style]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        {...getRippleConfig('rgba(255, 255, 255, 0.3)')}
      >
        <LinearGradient
          colors={metalGradients.platinum}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.graphiteBlack} />
          ) : (
            <Text style={styles.primaryText}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, styles.secondary, style]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        {...getRippleConfig('rgba(255, 255, 255, 0.2)')}
      >
        {loading ? (
          <ActivityIndicator color={colors.liquidSilver} />
        ) : (
          <Text style={styles.secondaryText}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.ghost, style]}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      {...getRippleConfig('rgba(255, 255, 255, 0.1)')}
    >
      {loading ? (
        <ActivityIndicator color={colors.liquidSilver} />
      ) : (
        <Text style={styles.ghostText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: sizes.radiusMedium,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    ...typography.button,
    color: colors.graphiteBlack,
  } as TextStyle,
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.steelGray,
    paddingVertical: sizes.md,
    paddingHorizontal: sizes.lg,
  },
  secondaryText: {
    ...typography.button,
    color: colors.liquidSilver,
    textAlign: 'center',
  } as TextStyle,
  ghost: {
    paddingVertical: sizes.sm,
    paddingHorizontal: sizes.md,
  },
  ghostText: {
    ...typography.bodyMedium,
    color: colors.chromeSilver,
  } as TextStyle,
});
