import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Approve Vacancy API
 *
 * Approves a vacancy after moderation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vacancyId } = body;

    if (!vacancyId) {
      return NextResponse.json(
        { error: 'vacancyId is required' },
        { status: 400 }
      );
    }

    // Get admin ID from middleware headers
    const adminId = request.headers.get('x-admin-id');
    const adminEmail = request.headers.get('x-admin-email') || 'Admin';

    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if vacancy exists and get employer info
    const vacancy = await db.oneOrNone<{ id: string; employer_id: string; title: string }>(
      'SELECT id, employer_id, title FROM vacancies WHERE id = $1',
      [vacancyId]
    );

    if (!vacancy) {
      return NextResponse.json(
        { error: 'Vacancy not found' },
        { status: 404 }
      );
    }

    // Approve the vacancy
    await db.none(
      `UPDATE vacancies
       SET moderation_status = 'approved',
           approved_at = CURRENT_TIMESTAMP,
           approved_by = $1
       WHERE id = $2`,
      [adminId, vacancyId]
    );

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
       VALUES ($1, 'vacancy_approve', $2, 'vacancy', $3)`,
      [
        adminId,
        vacancyId,
        JSON.stringify({
          title: vacancy.title,
          employer_id: vacancy.employer_id
        })
      ]
    );

    // TODO: Send notification to employer
    // await notificationService.send({
    //   userId: vacancy.employer_id,
    //   title: 'Вакансия одобрена',
    //   body: `Ваша вакансия "${vacancy.title}" успешно прошла модерацию`,
    //   type: 'vacancy_approved'
    // });

    return NextResponse.json({
      success: true,
      message: 'Vacancy approved successfully',
      vacancyId,
      approvedBy: adminEmail,
      approvedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error approving vacancy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
