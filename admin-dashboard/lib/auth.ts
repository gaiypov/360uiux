/**
 * JWT Authentication Utilities
 * Handles token generation, verification, and admin authentication
 */

import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Token payload interface
export interface AdminTokenPayload {
  adminId: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
}

// Extended payload with JWT standard fields
interface JWTPayload extends AdminTokenPayload {
  iat?: number;
  exp?: number;
}

/**
 * Generate JWT token for admin
 */
export async function generateToken(
  payload: AdminTokenPayload
): Promise<string> {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AdminTokenPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Extract token from cookies
 */
export function extractTokenFromCookies(request: NextRequest): string | null {
  return request.cookies.get('adminToken')?.value || null;
}

/**
 * Get admin from request
 * Checks both Authorization header and cookies
 */
export async function getAdminFromRequest(
  request: NextRequest
): Promise<AdminTokenPayload | null> {
  // Try Authorization header first
  let token = extractTokenFromHeader(request);

  // Fallback to cookies
  if (!token) {
    token = extractTokenFromCookies(request);
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Check if admin has required role
 */
export function hasRole(
  admin: AdminTokenPayload,
  requiredRole: 'admin' | 'moderator'
): boolean {
  if (requiredRole === 'moderator') {
    // Both admin and moderator can access moderator routes
    return admin.role === 'admin' || admin.role === 'moderator';
  }

  // Only admin can access admin routes
  return admin.role === 'admin';
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Require authentication middleware helper
 * Use in API routes to enforce authentication
 */
export async function requireAuth(
  request: NextRequest,
  requiredRole?: 'admin' | 'moderator'
): Promise<{ admin: AdminTokenPayload } | { error: string; status: number }> {
  const admin = await getAdminFromRequest(request);

  if (!admin) {
    return { error: 'Unauthorized. Please log in.', status: 401 };
  }

  if (requiredRole && !hasRole(admin, requiredRole)) {
    return {
      error: `Forbidden. ${requiredRole} role required.`,
      status: 403
    };
  }

  return { admin };
}

/**
 * Create API error response
 */
export function createErrorResponse(message: string, status: number) {
  return Response.json(
    { error: message },
    { status }
  );
}

/**
 * Create API success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return Response.json(data, { status });
}
