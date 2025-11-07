import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ResolveRequest {
  complaintId: string;
  resolution: string;
  notes?: string;
}

/**
 * Resolve Complaint API
 *
 * Marks a complaint as resolved with resolution details
 */
export async function POST(request: NextRequest) {
  try {
    const body: ResolveRequest = await request.json();
    const { complaintId, resolution, notes } = body;

    if (!complaintId || !resolution) {
      return NextResponse.json(
        { error: 'complaintId and resolution are required' },
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

    // Check if complaint exists and get reporter info
    const complaint = await db.oneOrNone<{ id: string; reporter_id: string; description: string }>(
      'SELECT id, reporter_id, description FROM complaints WHERE id = $1',
      [complaintId]
    );

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Update complaint status to resolved
    await db.none(
      `UPDATE complaints
       SET status = 'resolved',
           resolved_at = CURRENT_TIMESTAMP,
           resolved_by = $1,
           resolution = $2,
           notes = $3
       WHERE id = $4`,
      [adminId, resolution, notes || null, complaintId]
    );

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
       VALUES ($1, 'complaint_resolve', $2, 'complaint', $3)`,
      [
        adminId,
        complaintId,
        JSON.stringify({
          resolution,
          notes,
          reporter_id: complaint.reporter_id
        })
      ]
    );

    // TODO: Send notification to reporter
    // await notificationService.send({
    //   userId: complaint.reporter_id,
    //   title: 'Ваша жалоба рассмотрена',
    //   body: `Решение: ${resolution}`,
    //   type: 'complaint_resolved'
    // });

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
