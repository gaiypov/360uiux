/**
 * 360° РАБОТА - JWT Utilities
 * 🔴 КРИТИЧНО: JWT секреты ОБЯЗАТЕЛЬНЫ!
 */

import jwt from 'jsonwebtoken';
import { JWTPayload, AuthTokens } from '../types';

// 🔴 БЕЗОПАСНОСТЬ: Без установленных секретов приложение НЕ запустится!
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('🔴 КРИТИЧЕСКАЯ ОШИБКА: JWT_SECRET и JWT_REFRESH_SECRET должны быть установлены!');
  console.error('Добавьте их в .env файл:');
  console.error('  JWT_SECRET=<ваш_сгенерированный_секрет>');
  console.error('  JWT_REFRESH_SECRET=<ваш_сгенерированный_секрет>');
  console.error('\nДля генерации используйте:');
  console.error('  node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
  process.exit(1);
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '90d';

/**
 * Generate access token
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(payload: JWTPayload): AuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode token without verification
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
}
