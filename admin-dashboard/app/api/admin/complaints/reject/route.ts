import { NextRequest, NextResponse } from 'next/server';

/**
 * Reject Complaint API
 *
 * Marks a complaint as rejected (invalid or unfounded)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { complaintId } = body;

    if (!complaintId) {
      return NextResponse.json(
        { error: 'complaintId is required' },
        { status: 400 }
      );
    }

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';
    const adminName = 'Иван Петров'; // TODO: Get from database

    // TODO: Replace with actual database update
    // Example SQL:
    // UPDATE complaints
    // SET status = 'rejected',
    //     resolved_at = NOW(),
    //     resolved_by = $1,
    //     resolution = 'Жалоба отклонена'
    // WHERE id = $2
    const updateQuery = `
      UPDATE complaints
      SET status = 'rejected',
          resolved_at = NOW(),
          resolved_by = $1,
          resolution = 'Жалоба отклонена как необоснованная'
      WHERE id = $2
      RETURNING *
    `;

    // Log admin action
    // TODO: Replace with actual database insert
    const logActionQuery = `
      INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
      VALUES ($1, 'complaint_reject', $2, 'complaint', $3)
    `;

    // Mock success response
    return NextResponse.json({
      success: true,
      message: 'Complaint rejected successfully',
      complaintId,
      resolvedBy: adminName,
      resolvedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error rejecting complaint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
