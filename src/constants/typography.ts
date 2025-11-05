/**
 * 360° РАБОТА - ULTRA EDITION
 * Premium Typography System
 */

import { TextStyle } from 'react-native';

export const typography = {
  // === HEADINGS · WIDE TRACKING ===
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 3,             // Ultra wide for premium feel
    textTransform: 'uppercase',
  } as TextStyle,

  h2: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  } as TextStyle,

  h3: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1.5,
  } as TextStyle,

  h4: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  } as TextStyle,

  // === BODY TEXT ===
  body: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 24,
  } as TextStyle,

  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 26,
  } as TextStyle,

  // === SMALL TEXT ===
  caption: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 18,
  } as TextStyle,

  captionMedium: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
  } as TextStyle,

  micro: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 0.5,
  } as TextStyle,

  // === NUMBERS · MONOSPACE FEEL ===
  numbers: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  } as TextStyle,

  numbersLarge: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
  } as TextStyle,

  // === BUTTONS ===
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2.5,           // Extra wide for CTAs
    textTransform: 'uppercase',
  } as TextStyle,

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  } as TextStyle,

  // === LABELS ===
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } as TextStyle,

  // === MONOSPACE (for technical data) ===
  mono: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0,
    fontFamily: 'monospace',
  } as TextStyle,
} as const;
