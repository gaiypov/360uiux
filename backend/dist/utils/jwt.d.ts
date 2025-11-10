/**
 * 360° РАБОТА - JWT Utilities
 * 🔴 КРИТИЧНО: JWT секреты ОБЯЗАТЕЛЬНЫ!
 */
import { JWTPayload, AuthTokens } from '../types';
/**
 * Generate access token
 */
export declare function generateAccessToken(payload: JWTPayload): string;
/**
 * Generate refresh token
 */
export declare function generateRefreshToken(payload: JWTPayload): string;
/**
 * Generate both access and refresh tokens
 */
export declare function generateTokens(payload: JWTPayload): AuthTokens;
/**
 * Verify access token
 */
export declare function verifyAccessToken(token: string): JWTPayload;
/**
 * Verify refresh token
 */
export declare function verifyRefreshToken(token: string): JWTPayload;
/**
 * Decode token without verification
 */
export declare function decodeToken(token: string): JWTPayload | null;
//# sourceMappingURL=jwt.d.ts.map