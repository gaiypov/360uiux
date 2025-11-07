import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Admin Logout API
 *
 * Logs out admin and clears token cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Get admin from request (if authenticated)
    const admin = await getAdminFromRequest(request);

    if (admin) {
      // Log logout action
      await db.none(
        `INSERT INTO admin_actions (admin_id, action_type, details)
         VALUES ($1, 'logout', $2)`,
        [admin.adminId, JSON.stringify({ ip: request.ip || 'unknown' })]
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear the token cookie
    response.cookies.delete('adminToken');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
