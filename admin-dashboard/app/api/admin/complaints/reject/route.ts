import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Get admin ID from middleware headers
    const adminId = request.headers.get('x-admin-id');
    const adminName = request.headers.get('x-admin-email') || 'Admin';

    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if complaint exists
    const complaint = await db.oneOrNone<{ id: string; reporter_id: string }>(
      'SELECT id, reporter_id FROM complaints WHERE id = $1',
      [complaintId]
    );

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Update complaint status to rejected
    await db.none(
      `UPDATE complaints
       SET status = 'rejected',
           resolved_at = CURRENT_TIMESTAMP,
           resolved_by = $1,
           resolution = 'Жалоба отклонена как необоснованная'
       WHERE id = $2`,
      [adminId, complaintId]
    );

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
       VALUES ($1, 'complaint_reject', $2, 'complaint', $3)`,
      [
        adminId,
        complaintId,
        JSON.stringify({
          reporter_id: complaint.reporter_id
        })
      ]
    );

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
