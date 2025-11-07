import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ActivityRow {
  id: string;
  action_type: string;
  admin_name: string;
  details: any;
  created_at: string;
  target_id: string | null;
}

/**
 * Admin Dashboard Stats API
 *
 * Returns overview statistics for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get admin ID from headers (set by middleware)
    const adminId = request.headers.get('x-admin-id');

    // Get total vacancies count
    const vacanciesResult = await db.oneOrNone<{ count: string }>(
      'SELECT COUNT(*) as count FROM vacancies WHERE deleted_at IS NULL'
    );
    const vacanciesCount = parseInt(vacanciesResult?.count || '0');

    // Get total users count
    const usersResult = await db.oneOrNone<{ count: string }>(
      'SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL'
    );
    const usersCount = parseInt(usersResult?.count || '0');

    // Get pending moderation count
    const pendingModerationResult = await db.oneOrNone<{ count: string }>(
      `SELECT COUNT(*) as count FROM vacancies
       WHERE status = 'pending' AND deleted_at IS NULL`
    );
    const pendingModerationCount = parseInt(pendingModerationResult?.count || '0');

    // Get complaints count (pending only)
    const complaintsResult = await db.oneOrNone<{ count: string }>(
      `SELECT COUNT(*) as count FROM complaints
       WHERE status = 'pending'`
    );
    const complaintsCount = parseInt(complaintsResult?.count || '0');

    // Get active users today
    const activeUsersTodayResult = await db.oneOrNone<{ count: string }>(
      `SELECT COUNT(DISTINCT id) as count FROM users
       WHERE last_active_at >= CURRENT_DATE
       AND deleted_at IS NULL`
    );
    const activeUsersToday = parseInt(activeUsersTodayResult?.count || '0');

    // Get new users this week
    const newUsersThisWeekResult = await db.oneOrNone<{ count: string }>(
      `SELECT COUNT(*) as count FROM users
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       AND deleted_at IS NULL`
    );
    const newUsersThisWeek = parseInt(newUsersThisWeekResult?.count || '0');

    // Get approved vacancies today
    const approvedTodayResult = await db.oneOrNone<{ count: string }>(
      `SELECT COUNT(*) as count FROM vacancies
       WHERE status = 'approved'
       AND approved_at >= CURRENT_DATE
       AND deleted_at IS NULL`
    );
    const approvedVacanciesToday = parseInt(approvedTodayResult?.count || '0');

    // Get rejected vacancies today
    const rejectedTodayResult = await db.oneOrNone<{ count: string }>(
      `SELECT COUNT(*) as count FROM vacancies
       WHERE status = 'rejected'
       AND rejected_at >= CURRENT_DATE`
    );
    const rejectedVacanciesToday = parseInt(rejectedTodayResult?.count || '0');

    // Get recent admin activity
    const recentActivityRows = await db.many<ActivityRow>(
      `SELECT
        aa.id,
        aa.action_type,
        aa.created_at,
        aa.details,
        aa.target_id,
        a.name as admin_name
      FROM admin_actions aa
      JOIN admins a ON a.id = aa.admin_id
      ORDER BY aa.created_at DESC
      LIMIT 10`
    );

    // Format activity messages
    const recentActivity = recentActivityRows.map(row => {
      let message = '';

      switch (row.action_type) {
        case 'vacancy_approve':
          message = 'Вакансия одобрена';
          break;
        case 'vacancy_reject':
          message = 'Вакансия отклонена';
          break;
        case 'user_block':
          message = 'Пользователь заблокирован';
          break;
        case 'user_unblock':
          message = 'Пользователь разблокирован';
          break;
        case 'complaint_resolve':
          message = 'Жалоба решена';
          break;
        case 'complaint_reject':
          message = 'Жалоба отклонена';
          break;
        case 'login':
          message = 'Вход в систему';
          break;
        case 'logout':
          message = 'Выход из системы';
          break;
        default:
          message = row.action_type;
      }

      return {
        id: row.id,
        type: row.action_type,
        message,
        timestamp: row.created_at,
        admin: row.admin_name
      };
    });

    // Calculate growth trends (compare with last week)
    const lastWeekUsersResult = await db.oneOrNone<{ count: string }>(
      `SELECT COUNT(*) as count FROM users
       WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
       AND created_at < CURRENT_DATE - INTERVAL '7 days'
       AND deleted_at IS NULL`
    );
    const lastWeekUsers = parseInt(lastWeekUsersResult?.count || '1');
    const userGrowth = newUsersThisWeek > 0
      ? `+${Math.round(((newUsersThisWeek - lastWeekUsers) / lastWeekUsers) * 100)}%`
      : '0%';

    const stats = {
      vacanciesCount,
      usersCount,
      pendingModerationCount,
      complaintsCount,
      activeUsersToday,
      newUsersThisWeek,
      approvedVacanciesToday,
      rejectedVacanciesToday,
      recentActivity,
      trends: {
        users: userGrowth,
        vacancies: '+0%', // TODO: Calculate from historical data
        applications: '+0%' // TODO: Calculate from historical data
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
