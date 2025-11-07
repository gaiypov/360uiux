import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface VacancyRow {
  id: string;
  title: string;
  profession: string;
  video_url: string;
  thumbnail_url: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  city: string;
  moderation_status: string;
  created_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  rejection_comment: string | null;
  approved_by_name: string | null;
  rejected_by_name: string | null;
  employer_id: string;
  employer_name: string | null;
}

/**
 * Admin Moderation API
 *
 * List vacancies for moderation
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    // Get admin ID from middleware headers
    const adminId = request.headers.get('x-admin-id');

    // Query vacancies for moderation
    const query = `
      SELECT
        v.id,
        v.title,
        v.profession,
        v.video_url,
        v.thumbnail_url,
        v.salary_min,
        v.salary_max,
        v.currency,
        v.city,
        v.moderation_status,
        v.created_at,
        v.approved_at,
        v.rejected_at,
        v.rejection_reason,
        v.rejection_comment,
        v.employer_id,
        u.company_name as employer_name,
        admin_approved.name as approved_by_name,
        admin_rejected.name as rejected_by_name
      FROM vacancies v
      JOIN users u ON u.id = v.employer_id
      LEFT JOIN admins admin_approved ON admin_approved.id = v.approved_by
      LEFT JOIN admins admin_rejected ON admin_rejected.id = v.rejected_by
      WHERE v.moderation_status = $1 AND v.deleted_at IS NULL
      ORDER BY v.created_at ASC
      LIMIT 50
    `;

    const vacancyRows = await db.many<VacancyRow>(query, [status]);

    // Format vacancies for response
    const vacancies = vacancyRows.map(row => {
      const salaryText = row.salary_min && row.salary_max
        ? `${row.salary_min.toLocaleString()} - ${row.salary_max.toLocaleString()} ${row.currency}`
        : row.salary_min
        ? `от ${row.salary_min.toLocaleString()} ${row.currency}`
        : 'Договорная';

      return {
        id: row.id,
        title: row.title,
        employerName: row.employer_name || 'Неизвестная компания',
        employerId: row.employer_id,
        videoUrl: row.video_url,
        description: `Профессия: ${row.profession}`,
        salary: salaryText,
        location: row.city,
        category: row.profession,
        status: row.moderation_status as 'pending' | 'approved' | 'rejected',
        createdAt: row.created_at,
        approvedAt: row.approved_at,
        approvedBy: row.approved_by_name,
        rejectedAt: row.rejected_at,
        rejectedBy: row.rejected_by_name,
        rejectionReason: row.rejection_reason,
        rejectionComment: row.rejection_comment,
        // AI check would come from separate AI service
        aiCheck: {
          videoQuality: 'unknown',
          audioQuality: 'unknown',
          contentMatch: 'unknown',
          flags: [],
          confidence: 0
        }
      };
    });

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, details)
       VALUES ($1, 'view_moderation', $2)`,
      [adminId, JSON.stringify({ status, count: vacancies.length })]
    );

    return NextResponse.json({ vacancies });

  } catch (error) {
    console.error('Error fetching vacancies for moderation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
