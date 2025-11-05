/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Spacing & Sizing System
 */

export const sizes = {
  // Spacing (8px grid)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius (extra rounded)
  radiusSmall: 12,
  radiusMedium: 16,
  radiusLarge: 20,
  radiusXLarge: 24,
  radiusFull: 9999,

  // Glass blur
  blurAmount: 12,

  // Shadows
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 20,
  shadowOpacity: 0.3,

  // Animation durations (ms)
  animationFast: 200,
  animationNormal: 300,
  animationSlow: 500,
} as const;
