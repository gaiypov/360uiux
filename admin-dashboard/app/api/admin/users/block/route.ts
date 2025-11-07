import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface BlockRequest {
  userId: string;
  reason?: string;
}

/**
 * Block User API
 *
 * Blocks a user from using the platform
 */
export async function POST(request: NextRequest) {
  try {
    const body: BlockRequest = await request.json();
    const { userId, reason } = body;

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

    // Block the user
    await db.none(
      `UPDATE users
       SET blocked_at = CURRENT_TIMESTAMP,
           blocked_by = $1,
           blocked_reason = $2
       WHERE id = $3`,
      [adminId, reason || 'Blocked by administrator', userId]
    );

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
       VALUES ($1, 'user_block', $2, 'user', $3)`,
      [
        adminId,
        userId,
        JSON.stringify({
          reason: reason || 'Blocked by administrator',
          phone: user.phone
        })
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully',
      userId
    });

  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
