/**
 * 360° РАБОТА - ULTRA EDITION
 * Premium Monochrome Color Palette
 */

// === OBSIDIAN SERIES · BLACKS ===
export const obsidianSeries = {
  voidBlack: '#000000',         // Absolute void
  primaryBlack: '#020204',      // Main background
  deepVoid: '#0A0A0F',          // Deep backgrounds
  graphiteBlack: '#18181C',     // Cards, containers
  carbonGray: '#242429',        // Elevated surfaces
  slateGray: '#2D2D35',         // Input backgrounds
  steelGray: '#3A3A42',         // Borders, dividers
} as const;

// === CHROME SERIES · SILVERS ===
export const chromeSeries = {
  darkChrome: '#66687A',        // Disabled text
  graphiteSilver: '#888895',    // Secondary text
  chromeSilver: '#A8A8B5',      // Body text
  liquidSilver: '#C8C8D0',      // Primary text
  platinumSilver: '#E8E8ED',    // Emphasized text
} as const;

// === ARCTIC SERIES · WHITES ===
export const arcticSeries = {
  softWhite: '#FAFAFA',         // Headings
  pureWhite: '#FFFFFF',         // Max contrast
} as const;

// === METAL GRADIENTS ===
export const metalGradients = {
  platinum: ['#FFFFFF', '#E8E8ED', '#C8C8D0'],
  chrome: ['#E8E8ED', '#C8C8D0', '#A8A8B5'],
  steel: ['#888895', '#C8C8D0', '#E8E8ED'],
  carbon: ['#18181C', '#0A0A0F'],
  obsidian: ['#020204', '#000000'],
} as const;

// === GLASS VARIANTS ===
export const glassVariants = {
  light: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    blur: 12,
  },
  medium: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    blur: 20,
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.18)',
    blur: 28,
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.4)',
    border: 'rgba(255, 255, 255, 0.1)',
    blur: 20,
  },
} as const;

// === STATUS COLORS ===
export const statusColors = {
  success: '#00D66F',
  warning: '#FFAA00',
  error: '#FF4757',
  info: '#39E0F8',
} as const;

// === ACCENT COLORS (Revolut Ultra - Muted & Elegant) ===
export const accentColors = {
  accentGreen: '#00D66F',      // Success, positive, money
  accentBlue: '#39E0F8',       // Info, neutral, primary
  accentPurple: '#8E7FFF',     // Premium, special features
  accentOrange: '#FFAA00',     // Warning, attention
  accentRed: '#FF4757',        // Error, critical, negative
  accentGray: '#A8A8B5',       // Neutral, disabled
} as const;

// === UNIFIED COLORS OBJECT ===
export const colors = {
  // Obsidian series
  voidBlack: obsidianSeries.voidBlack,
  primaryBlack: obsidianSeries.primaryBlack,
  deepVoid: obsidianSeries.deepVoid,
  graphiteBlack: obsidianSeries.graphiteBlack,
  carbonGray: obsidianSeries.carbonGray,
  slateGray: obsidianSeries.slateGray,
  steelGray: obsidianSeries.steelGray,

  // Chrome series
  darkChrome: chromeSeries.darkChrome,
  graphiteSilver: chromeSeries.graphiteSilver,
  chromeSilver: chromeSeries.chromeSilver,
  liquidSilver: chromeSeries.liquidSilver,
  platinumSilver: chromeSeries.platinumSilver,

  // Arctic series
  softWhite: arcticSeries.softWhite,
  pureWhite: arcticSeries.pureWhite,

  // Glass (backward compatibility)
  glassBackground: glassVariants.medium.background,
  glassBorder: glassVariants.medium.border,

  // Status colors
  success: statusColors.success,
  warning: statusColors.warning,
  error: statusColors.error,
  info: statusColors.info,

  // Accent colors
  accentGreen: accentColors.accentGreen,
  accentBlue: accentColors.accentBlue,
  accentPurple: accentColors.accentPurple,
  accentOrange: accentColors.accentOrange,
  accentRed: accentColors.accentRed,
  accentGray: accentColors.accentGray,

  // Legacy aliases for gradual migration
  ultraViolet: '#8E7FFF',
  cyberBlue: '#39E0F8',
  graphiteGray: obsidianSeries.graphiteBlack,
  textSecondary: chromeSeries.chromeSilver,
} as const;

// === GRADIENT ARRAYS ===
export const primaryGradient = metalGradients.platinum;
export const glassGradient = ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'];
export const darkGradient = ['rgba(2,2,4,0)', 'rgba(2,2,4,0.9)'];
