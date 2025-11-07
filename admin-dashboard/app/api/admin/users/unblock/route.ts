import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';

    // TODO: Replace with actual database update
    // Example SQL:
    // UPDATE users SET status = 'active', blocked_at = NULL, blocked_by = NULL WHERE id = $1
    const updateQuery = `
      UPDATE users
      SET status = 'active',
          blocked_at = NULL,
          blocked_by = NULL
      WHERE id = $1
      RETURNING *
    `;

    // Log admin action
    // TODO: Replace with actual database insert
    const logActionQuery = `
      INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
      VALUES ($1, 'user_unblock', $2, 'user', $3)
    `;

    // Mock success response
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
