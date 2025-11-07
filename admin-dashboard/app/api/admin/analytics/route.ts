import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface DateSeriesRow {
  date: string;
}

interface UserGrowthRow {
  date: string;
  jobseekers: string;
  employers: string;
}

interface VacancyStatsRow {
  date: string;
  posted: string;
  approved: string;
  rejected: string;
}

interface VideoViewsRow {
  date: string;
  views: string;
  unique_users: string;
}

interface ApplicationStatsRow {
  date: string;
  applications: string;
}

interface UserActivityRow {
  hour: number;
  active: string;
}

interface RoleDistributionRow {
  role: string;
  count: string;
}

interface VacancyCategoryRow {
  profession: string;
  count: string;
}

interface PlatformStatsRow {
  total_users: string;
  total_vacancies: string;
  total_applications: string;
  total_video_views: string;
  prev_total_users: string;
}

/**
 * Admin Analytics API
 *
 * Returns comprehensive analytics data for charts and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Get admin ID from middleware headers
    const adminId = request.headers.get('x-admin-id');

    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Map range to days
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = daysMap[range] || 30;

    // User Growth - cumulative count by date
    const userGrowthQuery = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days - 1} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      )
      SELECT
        ds.date::text,
        COALESCE(SUM(CASE WHEN u.role = 'jobseeker' AND u.created_at::date <= ds.date THEN 1 ELSE 0 END), 0) as jobseekers,
        COALESCE(SUM(CASE WHEN u.role = 'employer' AND u.created_at::date <= ds.date THEN 1 ELSE 0 END), 0) as employers
      FROM date_series ds
      LEFT JOIN users u ON u.created_at::date <= ds.date AND u.deleted_at IS NULL
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `;

    const userGrowthRows = await db.many<UserGrowthRow>(userGrowthQuery);

    const userGrowth = userGrowthRows.map(row => ({
      date: new Date(row.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      jobseekers: parseInt(row.jobseekers),
      employers: parseInt(row.employers)
    }));

    // Vacancy Stats - posted/approved/rejected by date
    const vacancyStatsQuery = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days - 1} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      )
      SELECT
        ds.date::text,
        COALESCE(COUNT(CASE WHEN v.created_at::date = ds.date THEN 1 END), 0) as posted,
        COALESCE(COUNT(CASE WHEN v.approved_at::date = ds.date THEN 1 END), 0) as approved,
        COALESCE(COUNT(CASE WHEN v.rejected_at::date = ds.date THEN 1 END), 0) as rejected
      FROM date_series ds
      LEFT JOIN vacancies v ON (
        v.created_at::date = ds.date OR
        v.approved_at::date = ds.date OR
        v.rejected_at::date = ds.date
      ) AND v.deleted_at IS NULL
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `;

    const vacancyStatsRows = await db.many<VacancyStatsRow>(vacancyStatsQuery);

    const vacancyStats = vacancyStatsRows.map(row => ({
      date: new Date(row.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      posted: parseInt(row.posted),
      approved: parseInt(row.approved),
      rejected: parseInt(row.rejected)
    }));

    // Video Views - total and unique by date
    const videoViewsQuery = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days - 1} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      )
      SELECT
        ds.date::text,
        COALESCE(COUNT(vv.id), 0) as views,
        COALESCE(COUNT(DISTINCT vv.user_id), 0) as unique_users
      FROM date_series ds
      LEFT JOIN video_views vv ON vv.viewed_at::date = ds.date
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `;

    const videoViewsRows = await db.many<VideoViewsRow>(videoViewsQuery);

    const videoViews = videoViewsRows.map(row => ({
      date: new Date(row.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      views: parseInt(row.views),
      uniqueUsers: parseInt(row.unique_users)
    }));

    // Application Stats - applications by date
    const applicationStatsQuery = `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '${days - 1} days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      )
      SELECT
        ds.date::text,
        COALESCE(COUNT(a.id), 0) as applications
      FROM date_series ds
      LEFT JOIN applications a ON a.created_at::date = ds.date
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `;

    const applicationStatsRows = await db.many<ApplicationStatsRow>(applicationStatsQuery);

    const applicationStats = applicationStatsRows.map(row => ({
      date: new Date(row.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      applications: parseInt(row.applications)
    }));

    // User Activity by Hour - based on last_active_at
    const userActivityQuery = `
      WITH hours AS (
        SELECT generate_series(0, 23) as hour
      )
      SELECT
        h.hour,
        COALESCE(COUNT(u.id), 0) as active
      FROM hours h
      LEFT JOIN users u ON EXTRACT(HOUR FROM u.last_active_at) = h.hour
        AND u.last_active_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY h.hour
      ORDER BY h.hour ASC
    `;

    const userActivityRows = await db.many<UserActivityRow>(userActivityQuery);

    const userActivity = userActivityRows.map(row => ({
      hour: `${row.hour.toString().padStart(2, '0')}:00`,
      active: parseInt(row.active)
    }));

    // Role Distribution - pie chart data
    const roleDistributionQuery = `
      SELECT
        role,
        COUNT(*) as count
      FROM users
      WHERE deleted_at IS NULL AND blocked_at IS NULL
      GROUP BY role
    `;

    const roleDistributionRows = await db.many<RoleDistributionRow>(roleDistributionQuery);

    const roleDistribution = roleDistributionRows.map(row => ({
      name: row.role === 'jobseeker' ? 'Соискатели' : 'Работодатели',
      value: parseInt(row.count)
    }));

    // Vacancy Categories - bar chart data
    const vacancyCategoriesQuery = `
      SELECT
        profession as profession,
        COUNT(*) as count
      FROM vacancies
      WHERE deleted_at IS NULL AND moderation_status = 'approved'
      GROUP BY profession
      ORDER BY count DESC
      LIMIT 10
    `;

    const vacancyCategoriesRows = await db.many<VacancyCategoryRow>(vacancyCategoriesQuery);

    const vacancyCategories = vacancyCategoriesRows.map(row => ({
      category: row.profession,
      count: parseInt(row.count)
    }));

    // Platform Stats - overall metrics
    const platformStatsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND blocked_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM vacancies WHERE deleted_at IS NULL AND moderation_status = 'approved') as total_vacancies,
        (SELECT COUNT(*) FROM applications) as total_applications,
        (SELECT COUNT(*) FROM video_views) as total_video_views,
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND blocked_at IS NULL
         AND created_at < CURRENT_DATE - INTERVAL '${days} days') as prev_total_users
    `;

    const platformStatsRow = await db.one<PlatformStatsRow>(platformStatsQuery);

    const totalUsers = parseInt(platformStatsRow.total_users);
    const prevTotalUsers = parseInt(platformStatsRow.prev_total_users);
    const growthRate = prevTotalUsers > 0
      ? ((totalUsers - prevTotalUsers) / prevTotalUsers * 100).toFixed(1)
      : '0.0';

    const platformStats = {
      totalUsers,
      totalVacancies: parseInt(platformStatsRow.total_vacancies),
      totalApplications: parseInt(platformStatsRow.total_applications),
      totalVideoViews: parseInt(platformStatsRow.total_video_views),
      growthRate: parseFloat(growthRate)
    };

    // Log admin action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, details)
       VALUES ($1, 'view_analytics', $2)`,
      [adminId, JSON.stringify({ range, timestamp: new Date().toISOString() })]
    );

    const analyticsData = {
      userGrowth,
      vacancyStats,
      videoViews,
      applicationStats,
      userActivity,
      roleDistribution,
      vacancyCategories,
      platformStats
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
