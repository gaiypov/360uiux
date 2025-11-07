import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';
    const adminName = 'Иван Петров'; // TODO: Get from database

    // TODO: Replace with actual database update
    // Example SQL:
    // UPDATE vacancies
    // SET status = 'approved',
    //     approved_at = NOW(),
    //     approved_by = $1
    // WHERE id = $2
    const updateQuery = `
      UPDATE vacancies
      SET status = 'approved',
          approved_at = NOW(),
          approved_by = $1
      WHERE id = $2
      RETURNING *
    `;

    // Log admin action
    // TODO: Replace with actual database insert
    const logActionQuery = `
      INSERT INTO admin_actions (admin_id, action_type, target_id, target_type, details)
      VALUES ($1, 'vacancy_approve', $2, 'vacancy', $3)
    `;

    // TODO: Send notification to employer
    // notificationService.notifyVacancyApproved({
    //   recipientId: vacancy.employerId,
    //   vacancyId,
    //   vacancyTitle: vacancy.title
    // });

    // Mock success response
    return NextResponse.json({
      success: true,
      message: 'Vacancy approved successfully',
      vacancyId,
      approvedBy: adminName,
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
