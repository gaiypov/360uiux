/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Glass Button Component
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
import { colors, typography, sizes } from '@/constants';

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function GlassButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: GlassButtonProps) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.container, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.ultraViolet, colors.cyberBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color={colors.softWhite} />
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
    // Glow effect
    shadowColor: colors.ultraViolet,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.3,
    elevation: 8,
  },
  primaryText: {
    ...typography.button,
    color: colors.softWhite,
  } as TextStyle,
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.glassBorder,
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
    color: colors.liquidSilver,
  } as TextStyle,
});
