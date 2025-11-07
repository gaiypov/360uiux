import { NextRequest, NextResponse } from 'next/server';

/**
 * Reject Vacancy API
 *
 * Rejects a vacancy with reason and comment
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

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';
    const adminName = 'Иван Петров'; // TODO: Get from database

    // TODO: Replace with actual database update
    // Example SQL:
    // UPDATE vacancies
    // SET status = 'rejected',
    //     rejected_at = NOW(),
    //     rejected_by = $1,
    //     rejection_reason = $2,
    //     rejection_comment = $3
    // WHERE id = $4
    const updateQuery = `
      UPDATE vacancies
      SET status = 'rejected',
          rejected_at = NOW(),
          rejected_by = $1,
          rejection_reason = $2,
          rejection_comment = $3
      WHERE id = $4
      RETURNING *
    `;

    // Log admin action
    // TODO: Replace with actual database insert
    const logActionQuery = `
      INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
      VALUES ($1, 'vacancy_reject', $2, 'vacancy', $3)
    `;

    // TODO: Send notification to employer
    // notificationService.notifyVacancyRejected({
    //   recipientId: vacancy.employerId,
    //   vacancyId,
    //   vacancyTitle: vacancy.title,
    //   reason,
    //   comment
    // });

    // Mock success response
    return NextResponse.json({
      success: true,
      message: 'Vacancy rejected successfully',
      vacancyId,
      rejectedBy: adminName,
      rejectedAt: new Date().toISOString(),
      reason,
      comment
    });

  } catch (error) {
    console.error('Error rejecting vacancy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
