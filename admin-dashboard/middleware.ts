/**
 * Next.js Middleware for Route Protection
 * Handles authentication and authorization
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/admin/login'];

// API routes that don't require authentication
const PUBLIC_API_ROUTES = ['/api/admin/auth/login'];

/**
 * Middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_API_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Try to get token from cookies or Authorization header
    let token = request.cookies.get('adminToken')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // No token found
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized. Please log in.' },
          { status: 401 }
        );
      }
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token
    const admin = await verifyToken(token);

    if (!admin) {
      // Invalid token
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Invalid or expired token. Please log in again.' },
          { status: 401 }
        );
      }
      // Redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid token
      response.cookies.delete('adminToken');
      return response;
    }

    // Check role-based access
    if (pathname.startsWith('/admin/analytics') || pathname.startsWith('/api/admin/analytics')) {
      // Only admins can access analytics
      if (admin.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Forbidden. Admin role required.' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }

    // Add admin info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-admin-id', admin.adminId);
      requestHeaders.set('x-admin-email', admin.email);
      requestHeaders.set('x-admin-role', admin.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

/**
 * Matcher configuration
 * Specifies which routes this middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
