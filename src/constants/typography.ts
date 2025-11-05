/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Typography System
 */

import { TextStyle } from 'react-native';

export const typography = {
  // Headings - Bold, Caps, Wide tracking
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,             // +2%
  } as TextStyle,

  h2: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.5,
  } as TextStyle,

  h3: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  } as TextStyle,

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
  } as TextStyle,

  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
  } as TextStyle,

  // Small
  caption: {
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.5,
  } as TextStyle,

  // Numbers (для зарплат)
  numbers: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0,
  } as TextStyle,

  // Button text
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  } as TextStyle,
} as const;
