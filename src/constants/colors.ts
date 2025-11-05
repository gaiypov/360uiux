/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Premium Color Palette
 */

export const colors = {
  // Dark foundation
  primaryBlack: '#050505',       // Глубокий черный
  graphiteGray: '#1C1C1E',       // Графитовый серый

  // Neon акценты
  ultraViolet: '#8E7FFF',        // Ультрафиолет
  cyberBlue: '#39E0F8',          // Кибер-голубой

  // Neutrals
  liquidSilver: '#D0D0D5',       // Жидкое серебро
  softWhite: '#FAFAFA',          // Мягкий белый

  // Glass layers
  glassBackground: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Градиенты (для LinearGradient)
  gradientStart: '#8E7FFF',      // Фиолетовый
  gradientEnd: '#39E0F8',        // Голубой

  // Shadows & Glow
  glowViolet: 'rgba(142, 127, 255, 0.3)',
  glowBlue: 'rgba(57, 224, 248, 0.3)',

  // Status colors
  success: '#00D66F',
  warning: '#FFAA00',
  error: '#FF4757',
  info: '#39E0F8',
} as const;

// Gradient colors array
export const primaryGradient = [colors.ultraViolet, colors.cyberBlue];
export const glassGradient = ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'];
export const darkGradient = ['rgba(5,5,5,0)', 'rgba(5,5,5,0.9)'];
