/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Visual Effects & Styles
 */

import { ViewStyle } from 'react-native';
import { colors } from './colors';
import { sizes } from './sizes';

export const glassStyle: ViewStyle = {
  backgroundColor: colors.glassBackground,
  borderWidth: 1,
  borderColor: colors.glassBorder,
};

export const glowEffect: ViewStyle = {
  shadowColor: colors.ultraViolet,
  shadowOffset: sizes.shadowOffset,
  shadowRadius: sizes.shadowRadius,
  shadowOpacity: sizes.shadowOpacity,
  elevation: 8, // для Android
};

export const cardStyle: ViewStyle = {
  ...glassStyle,
  borderRadius: sizes.radiusLarge,
  padding: sizes.md,
  marginBottom: sizes.md,
};

export const neonGlow = {
  violet: {
    shadowColor: colors.ultraViolet,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.6,
    elevation: 10,
  } as ViewStyle,

  blue: {
    shadowColor: colors.cyberBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.6,
    elevation: 10,
  } as ViewStyle,
};
