import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin Analytics API
 *
 * Returns comprehensive analytics data for charts and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // TODO: Get admin ID from JWT token
    const adminId = 'admin-123';

    // Generate date labels based on range
    const getDates = (days: number) => {
      const dates = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    };

    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = daysMap[range] || 30;
    const dates = getDates(days);

    // TODO: Replace with actual database queries
    // Generate mock data based on date range
    const userGrowth = dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      jobseekers: Math.floor(1000 + index * 50 + Math.random() * 100),
      employers: Math.floor(200 + index * 10 + Math.random() * 20)
    }));

    const vacancyStats = dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      posted: Math.floor(10 + Math.random() * 20),
      approved: Math.floor(7 + Math.random() * 15),
      rejected: Math.floor(0 + Math.random() * 5)
    }));

    const videoViews = dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      views: Math.floor(50 + Math.random() * 100),
      uniqueUsers: Math.floor(30 + Math.random() * 60)
    }));

    const applicationStats = dates.map((date, index) => ({
      date: new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      applications: Math.floor(20 + Math.random() * 40),
      responses: Math.floor(10 + Math.random() * 20)
    }));

    const userActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      active: Math.floor(50 + Math.sin(hour / 24 * Math.PI * 2) * 40 + Math.random() * 20)
    }));

    const roleDistribution = [
      { name: 'Соискатели', value: 6500 },
      { name: 'Работодатели', value: 2043 }
    ];

    const vacancyCategories = [
      { category: 'IT', count: 245 },
      { category: 'Продажи', count: 189 },
      { category: 'Логистика', count: 167 },
      { category: 'HoReCa', count: 143 },
      { category: 'Производство', count: 128 },
      { category: 'Строительство', count: 112 },
      { category: 'Другое', count: 263 }
    ];

    const platformStats = {
      totalUsers: userGrowth[userGrowth.length - 1].jobseekers + userGrowth[userGrowth.length - 1].employers,
      totalVacancies: vacancyStats.reduce((sum, stat) => sum + stat.approved, 0),
      totalApplications: applicationStats.reduce((sum, stat) => sum + stat.applications, 0),
      totalVideoViews: videoViews.reduce((sum, stat) => sum + stat.views, 0),
      growthRate: 12.5 // Mock growth rate
    };

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
