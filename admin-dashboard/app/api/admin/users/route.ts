import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface UserRow {
  id: string;
  phone: string;
  email: string | null;
  role: 'jobseeker' | 'employer';
  name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
  blocked_at: string | null;
  deleted_at: string | null;
  applications_count?: string;
  vacancies_count?: string;
}

/**
 * Admin Users API
 *
 * List and manage platform users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';

    // Admin ID from middleware headers
    const adminId = request.headers.get('x-admin-id');

    // Build WHERE clause based on filters
    const whereClauses: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    // Role filter
    if (role !== 'all') {
      whereClauses.push(`u.role = $${paramIndex}`);
      params.push(role);
      paramIndex++;
    }

    // Status filter (active = not blocked/deleted, blocked = blocked_at is not null)
    if (status === 'active') {
      whereClauses.push('u.blocked_at IS NULL');
      whereClauses.push('u.deleted_at IS NULL');
    } else if (status === 'blocked') {
      whereClauses.push('u.blocked_at IS NOT NULL');
    }

    const whereClause = whereClauses.join(' AND ');

    // Query users with stats
    const query = `
      SELECT
        u.id,
        u.phone,
        u.email,
        u.role,
        u.name,
        u.company_name,
        u.created_at,
        u.updated_at,
        u.blocked_at,
        u.deleted_at,
        COALESCE(
          (SELECT COUNT(*) FROM applications WHERE user_id = u.id),
          0
        ) as applications_count,
        COALESCE(
          (SELECT COUNT(*) FROM vacancies WHERE employer_id = u.id),
          0
        ) as vacancies_count
      FROM users u
      WHERE ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT 100
    `;

    const userRows = await db.many<UserRow>(query, params);

    // Format users for response
    const users = userRows.map(row => ({
      id: row.id,
      name: row.role === 'jobseeker' ? row.name || 'Без имени' : row.company_name || 'Без названия',
      email: row.email || '',
      phone: row.phone,
      role: row.role,
      status: row.blocked_at ? 'blocked' as const : 'active' as const,
      registeredAt: row.created_at,
      lastActive: row.updated_at,
      stats: row.role === 'jobseeker'
        ? { applicationsCount: parseInt(row.applications_count || '0') }
        : { vacanciesCount: parseInt(row.vacancies_count || '0') }
    }));

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, details)
       VALUES ($1, 'view_users', $2)`,
      [adminId, JSON.stringify({ filters: { role, status }, count: users.length })]
    );

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
