import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Dashboard Stats API
 *
 * Returns overview statistics for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123'; // Mock value

    // TODO: Replace with actual database queries
    // This is mock data for now
    const stats = {
      vacanciesCount: 1247,
      usersCount: 8543,
      pendingModerationCount: 23,
      complaintsCount: 12,

      // Additional stats
      activeUsersToday: 342,
      newUsersThisWeek: 127,
      approvedVacanciesToday: 15,
      rejectedVacanciesToday: 3,

      // Recent activity
      recentActivity: [
        {
          id: '1',
          type: 'moderation_approve',
          message: 'Вакансия "Менеджер по продажам" одобрена',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          admin: 'Иван Петров'
        },
        {
          id: '2',
          type: 'user_block',
          message: 'Пользователь заблокирован за нарушение правил',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          admin: 'Мария Сидорова'
        },
        {
          id: '3',
          type: 'complaint_resolve',
          message: 'Жалоба #4521 решена',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          admin: 'Иван Петров'
        },
        {
          id: '4',
          type: 'moderation_reject',
          message: 'Вакансия "Курьер" отклонена - низкое качество видео',
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          admin: 'Алексей Козлов'
        },
        {
          id: '5',
          type: 'moderation_approve',
          message: 'Вакансия "Разработчик React" одобрена',
          timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          admin: 'Иван Петров'
        }
      ],

      // Growth trends
      trends: {
        users: '+12%',
        vacancies: '+8%',
        applications: '+15%'
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
