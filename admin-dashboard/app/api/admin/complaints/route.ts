import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ComplaintRow {
  id: string;
  reporter_id: string;
  reported_id: string;
  reported_type: string;
  type: string;
  priority: string;
  description: string;
  status: string;
  resolution: string | null;
  notes: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter_name: string | null;
  reporter_phone: string;
  reported_name: string | null;
  reported_role: string | null;
  resolved_by_name: string | null;
}

/**
 * Admin Complaints API
 *
 * List and filter complaints
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const priority = searchParams.get('priority') || 'all';

    // Get admin ID from middleware headers
    const adminId = request.headers.get('x-admin-id');

    // Build WHERE clause
    const whereClauses: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (status !== 'all') {
      whereClauses.push(`c.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (type !== 'all') {
      whereClauses.push(`c.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (priority !== 'all') {
      whereClauses.push(`c.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    const whereClause = whereClauses.join(' AND ');

    // Query complaints with reporter and reported user info
    const query = `
      SELECT
        c.id,
        c.reporter_id,
        c.reported_id,
        c.reported_type,
        c.type,
        c.priority,
        c.description,
        c.status,
        c.resolution,
        c.notes,
        c.resolved_by,
        c.resolved_at,
        c.created_at,
        reporter.name as reporter_name,
        reporter.phone as reporter_phone,
        CASE
          WHEN c.reported_type = 'user' THEN
            COALESCE(reported.name, reported.company_name)
          WHEN c.reported_type = 'vacancy' THEN
            (SELECT title FROM vacancies WHERE id = c.reported_id::uuid)
          ELSE 'Unknown'
        END as reported_name,
        CASE
          WHEN c.reported_type = 'user' THEN reported.role
          ELSE c.reported_type
        END as reported_role,
        admin.name as resolved_by_name
      FROM complaints c
      JOIN users reporter ON reporter.id = c.reporter_id
      LEFT JOIN users reported ON reported.id = c.reported_id::uuid AND c.reported_type = 'user'
      LEFT JOIN admins admin ON admin.id = c.resolved_by
      WHERE ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT 100
    `;

    const complaintRows = await db.many<ComplaintRow>(query, params);

    // Format complaints for response
    const complaints = complaintRows.map(row => ({
      id: row.id,
      reporterId: row.reporter_id,
      reporterName: row.reporter_name || `Пользователь ${row.reporter_phone}`,
      reportedId: row.reported_id,
      reportedName: row.reported_name || 'Неизвестно',
      reportedRole: row.reported_role as 'jobseeker' | 'employer' | 'vacancy' | 'application',
      type: row.type as 'user_behavior' | 'content_violation' | 'technical_issue' | 'fraud' | 'other',
      priority: row.priority as 'low' | 'medium' | 'high' | 'critical',
      description: row.description,
      status: row.status as 'pending' | 'resolved' | 'rejected',
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by_name,
      resolution: row.resolution,
      notes: row.notes
    }));

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, details)
       VALUES ($1, 'view_complaints', $2)`,
      [adminId, JSON.stringify({ filters: { status, type, priority }, count: complaints.length })]
    );

    return NextResponse.json({ complaints });

  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
