"use strict";
/**
 * 360° РАБОТА - Employer Analytics Controller
 * Provides analytics data for employers
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerAnalyticsController = void 0;
const database_1 = require("../config/database");
class EmployerAnalyticsController {
    /**
     * Get employer dashboard analytics
     * GET /api/v1/analytics/employer/dashboard
     */
    static async getDashboard(req, res) {
        try {
            const employerId = req.user.userId;
            const period = req.query.period || 'week';
            // Calculate date range based on period
            let startDate;
            const endDate = new Date();
            switch (period) {
                case 'week':
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date();
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case 'year':
                    startDate = new Date();
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default:
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);
            }
            // Get total stats
            const totalStats = await database_1.db.oneOrNone(`
        SELECT
          COALESCE(SUM(v.views_count), 0)::int AS total_views,
          COUNT(DISTINCT a.id)::int AS total_applications,
          COUNT(DISTINCT CASE WHEN a.employer_status = 'accepted' THEN a.id END)::int AS total_hires,
          CASE
            WHEN COUNT(DISTINCT a.id) > 0 THEN
              ROUND((COUNT(DISTINCT CASE WHEN a.employer_status = 'accepted' THEN a.id END)::decimal / COUNT(DISTINCT a.id)) * 100, 1)
            ELSE 0
          END AS conversion_rate
        FROM vacancies v
        LEFT JOIN applications a ON v.id = a.vacancy_id
        WHERE v.employer_id = $1
          AND v.status IN ('published', 'closed')
      `, [employerId]);
            // Get daily views for the period
            const viewsData = await database_1.db.manyOrNone(`
        SELECT
          DATE(vs.viewed_at) AS date,
          COUNT(*)::int AS count
        FROM vacancy_views vs
        JOIN vacancies v ON vs.vacancy_id = v.id
        WHERE v.employer_id = $1
          AND vs.viewed_at >= $2
          AND vs.viewed_at <= $3
        GROUP BY DATE(vs.viewed_at)
        ORDER BY DATE(vs.viewed_at) ASC
      `, [employerId, startDate, endDate]);
            // Get daily applications for the period
            const applicationsData = await database_1.db.manyOrNone(`
        SELECT
          DATE(a.created_at) AS date,
          COUNT(*)::int AS count
        FROM applications a
        JOIN vacancies v ON a.vacancy_id = v.id
        WHERE v.employer_id = $1
          AND a.created_at >= $2
          AND a.created_at <= $3
        GROUP BY DATE(a.created_at)
        ORDER BY DATE(a.created_at) ASC
      `, [employerId, startDate, endDate]);
            // Get top vacancies by views and applications
            const topVacancies = await database_1.db.manyOrNone(`
        SELECT
          v.id,
          v.title,
          v.views_count AS views,
          COUNT(DISTINCT a.id)::int AS applications
        FROM vacancies v
        LEFT JOIN applications a ON v.id = a.vacancy_id
        WHERE v.employer_id = $1
          AND v.status IN ('published', 'closed')
        GROUP BY v.id, v.title, v.views_count
        ORDER BY v.views_count DESC
        LIMIT 5
      `, [employerId]);
            // Calculate percentage changes (comparing to previous period)
            const previousPeriodStart = new Date(startDate);
            const previousPeriodEnd = new Date(startDate);
            previousPeriodEnd.setDate(previousPeriodEnd.getDate() + 1);
            const periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);
            const previousStats = await database_1.db.oneOrNone(`
        SELECT
          COALESCE(COUNT(DISTINCT vs.id), 0)::int AS views,
          COALESCE(COUNT(DISTINCT a.id), 0)::int AS applications
        FROM vacancies v
        LEFT JOIN vacancy_views vs ON v.id = vs.vacancy_id
          AND vs.viewed_at >= $2
          AND vs.viewed_at < $3
        LEFT JOIN applications a ON v.id = a.vacancy_id
          AND a.created_at >= $2
          AND a.created_at < $3
        WHERE v.employer_id = $1
      `, [employerId, previousPeriodStart, startDate]);
            const viewsChange = previousStats?.views > 0
                ? ((totalStats.total_views - previousStats.views) / previousStats.views * 100).toFixed(1)
                : 0;
            const applicationsChange = previousStats?.applications > 0
                ? ((totalStats.total_applications - previousStats.applications) / previousStats.applications * 100).toFixed(1)
                : 0;
            res.json({
                success: true,
                analytics: {
                    stats: {
                        views: totalStats.total_views || 0,
                        applications: totalStats.total_applications || 0,
                        hires: totalStats.total_hires || 0,
                        conversionRate: parseFloat(totalStats.conversion_rate) || 0,
                    },
                    changes: {
                        views: parseFloat(viewsChange),
                        applications: parseFloat(applicationsChange),
                    },
                    viewsData: viewsData.map(d => ({
                        date: d.date,
                        count: d.count,
                    })),
                    applicationsData: applicationsData.map(d => ({
                        date: d.date,
                        count: d.count,
                    })),
                    topVacancies: topVacancies.map(v => ({
                        id: v.id,
                        title: v.title,
                        views: v.views,
                        applications: v.applications,
                    })),
                },
            });
        }
        catch (error) {
            console.error('Error getting employer analytics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get analytics',
                message: error.message,
            });
        }
    }
}
exports.EmployerAnalyticsController = EmployerAnalyticsController;
//# sourceMappingURL=EmployerAnalyticsController.js.map