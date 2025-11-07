import { NextRequest, NextResponse } from 'next/server';

/**
 * Resolve Complaint API
 *
 * Marks a complaint as resolved with resolution details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { complaintId, resolution, notes } = body;

    if (!complaintId || !resolution) {
      return NextResponse.json(
        { error: 'complaintId and resolution are required' },
        { status: 400 }
      );
    }

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';
    const adminName = 'Иван Петров'; // TODO: Get from database

    // TODO: Replace with actual database update
    // Example SQL:
    // UPDATE complaints
    // SET status = 'resolved',
    //     resolved_at = NOW(),
    //     resolved_by = $1,
    //     resolution = $2,
    //     notes = $3
    // WHERE id = $4
    const updateQuery = `
      UPDATE complaints
      SET status = 'resolved',
          resolved_at = NOW(),
          resolved_by = $1,
          resolution = $2,
          notes = $3
      WHERE id = $4
      RETURNING *
    `;

    // Log admin action
    // TODO: Replace with actual database insert
    const logActionQuery = `
      INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
      VALUES ($1, 'complaint_resolve', $2, 'complaint', $3)
    `;

    // TODO: Send notification to reporter
    // notificationService.notifyComplaintResolved({
    //   recipientId: complaint.reporterId,
    //   complaintId,
    //   resolution
    // });

    // Mock success response
    return NextResponse.json({
      success: true,
      message: 'Complaint resolved successfully',
      complaintId,
      resolution,
      resolvedBy: adminName,
      resolvedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error resolving complaint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
