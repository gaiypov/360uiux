import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Unblock User API
 *
 * Unblocks a previously blocked user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get admin ID from middleware headers
    const adminId = request.headers.get('x-admin-id');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user exists
    const user = await db.oneOrNone<{ id: string; phone: string }>(
      'SELECT id, phone FROM users WHERE id = $1',
      [userId]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Unblock the user
    await db.none(
      `UPDATE users
       SET blocked_at = NULL,
           blocked_by = NULL,
           blocked_reason = NULL
       WHERE id = $1`,
      [userId]
    );

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
       VALUES ($1, 'user_unblock', $2, 'user', $3)`,
      [
        adminId,
        userId,
        JSON.stringify({
          phone: user.phone
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'User unblocked successfully',
      userId
    });

  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
