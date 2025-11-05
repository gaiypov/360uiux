/**
 * 360° РАБОТА - ULTRA EDITION
 * Premium Spacing & Sizing System
 */

export const sizes = {
  // === SPACING · 8PX GRID ===
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // === BORDER RADIUS ===
  radiusSmall: 12,
  radiusMedium: 16,
  radiusLarge: 20,
  radiusXLarge: 24,
  radiusXXLarge: 32,
  radiusFull: 9999,

  // === GLASS BLUR AMOUNTS ===
  blurLight: 12,
  blurMedium: 20,
  blurStrong: 28,
  blurAmount: 20,          // Default (backward compatibility)

  // === ICON SIZES ===
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 48,
  iconXXLarge: 64,

  // === SHADOWS ===
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 20,
  shadowOpacity: 0.3,

  // === GLOW EFFECTS ===
  glowNeon: {
    offset: { width: 0, height: 0 },
    radius: 24,
    opacity: 0.6,
  },
  glowSoft: {
    offset: { width: 0, height: 0 },
    radius: 16,
    opacity: 0.4,
  },
  glowStrong: {
    offset: { width: 0, height: 0 },
    radius: 32,
    opacity: 0.8,
  },

  // === ANIMATION DURATIONS (MS) ===
  animationFast: 200,
  animationNormal: 300,
  animationSlow: 500,
  animationVerySlow: 800,

  // === SPRING CONFIGS ===
  springDefault: {
    damping: 15,
    mass: 1,
    stiffness: 150,
  },
  springSoft: {
    damping: 20,
    mass: 1,
    stiffness: 100,
  },
  springBouncy: {
    damping: 10,
    mass: 1,
    stiffness: 200,
  },
} as const;
