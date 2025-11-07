import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Reject Vacancy API
 *
 * Rejects a vacancy with reason and comment
 *
 * Possible rejection reasons:
 * - Несоответствие описанию
 * - Низкое качество видео
 * - Низкое качество звука
 * - Недопустимый контент
 * - Спам/мошенничество
 * - Другое
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vacancyId, reason, comment } = body;

    if (!vacancyId || !reason) {
      return NextResponse.json(
        { error: 'vacancyId and reason are required' },
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

    // Reject the vacancy
    await db.none(
      `UPDATE vacancies
       SET moderation_status = 'rejected',
           rejected_at = CURRENT_TIMESTAMP,
           rejected_by = $1,
           rejection_reason = $2,
           rejection_comment = $3
       WHERE id = $4`,
      [adminId, reason, comment || null, vacancyId]
    );

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
       VALUES ($1, 'vacancy_reject', $2, 'vacancy', $3)`,
      [
        adminId,
        vacancyId,
        JSON.stringify({
          title: vacancy.title,
          employer_id: vacancy.employer_id,
          reason,
          comment: comment || null
        })
      ]
    );

    // TODO: Send notification to employer
    // await notificationService.send({
    //   userId: vacancy.employer_id,
    //   title: 'Вакансия отклонена',
    //   body: `Ваша вакансия "${vacancy.title}" отклонена модератором.\nПричина: ${reason}${comment ? `\nКомментарий: ${comment}` : ''}`,
    //   type: 'vacancy_rejected'
    // });

    return NextResponse.json({
      success: true,
      message: 'Vacancy rejected successfully',
      vacancyId,
      rejectedBy: adminEmail,
      rejectedAt: new Date().toISOString(),
      reason,
      comment: comment || null
    });

  } catch (error) {
    console.error('Error rejecting vacancy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
