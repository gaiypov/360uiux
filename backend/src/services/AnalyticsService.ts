/**
 * 360° РАБОТА - Analytics Service
 *
 * Сервис для сбора и анализа статистики
 * Architecture v3: Video views, applications, user activity, conversions
 */

import { db } from '../config/database';
import { cacheService, TTL } from './CacheService';

interface VideoAnalytics {
  videoId: string;
  totalViews: number;
  uniqueViewers: number;
  averageWatchTime: number;
  completionRate: number;
  videoDeleted: boolean;
}

interface ApplicationAnalytics {
  totalApplications: number;
  byStatus: Record<string, number>;
  averageResponseTime: number; // hours
  conversionRate: number; // pending -> hired %
}

interface VacancyAnalytics {
  vacancyId: string;
  views: number;
  applications: number;
  conversionRate: number; // views -> applications %
  averageApplicationTime: number; // hours from view to apply
}

interface UserActivityAnalytics {
  userId: string;
  totalLogins: number;
  lastLoginAt: string;
  totalVacanciesViewed: number;
  totalApplicationsSent: number;
  totalMessagesS sent: number;
  averageSessionDuration: number; // minutes
}

interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number; // last 7 days
  totalVacancies: number;
  activeVacancies: number;
  totalApplications: number;
  totalMessages: number;
  conversionFunnel: {
    registered: number;
    viewedVacancies: number;
    sentApplications: number;
    gotInterview: number;
    hired: number;
  };
}

class AnalyticsService {
  // ===================================
  // VIDEO ANALYTICS
  // ===================================

  /**
   * Получить аналитику по видео
   */
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    try {
      // Получить общую информацию о видео
      const video = await db.oneOrNone(
        `SELECT
          id,
          views,
          created_at
        FROM videos
        WHERE id = $1`,
        [videoId]
      );

      if (!video) {
        throw new Error('Video not found');
      }

      // Получить статистику просмотров из сообщений
      const viewStats = await db.oneOrNone(
        `SELECT
          COUNT(DISTINCT sender_id) as unique_viewers,
          COUNT(*) as total_messages,
          AVG(CASE WHEN video_views_remaining < 2 THEN 1 ELSE 0 END) as completion_rate,
          COUNT(*) FILTER (WHERE video_deleted_at IS NOT NULL) as deleted_count
        FROM chat_messages
        WHERE video_id = $1 AND message_type = 'video'`,
        [videoId]
      );

      return {
        videoId,
        totalViews: video.views || 0,
        uniqueViewers: parseInt(viewStats?.unique_viewers || '0'),
        averageWatchTime: 0, // Можно добавить трекинг watch time
        completionRate: parseFloat(viewStats?.completion_rate || '0') * 100,
        videoDeleted: parseInt(viewStats?.deleted_count || '0') > 0,
      };
    } catch (error: any) {
      console.error('❌ Error getting video analytics:', error);
      throw error;
    }
  }

  // ===================================
  // APPLICATION ANALYTICS
  // ===================================

  /**
   * Получить аналитику по откликам (для работодателя)
   */
  async getApplicationAnalytics(
    employerId: string,
    vacancyId?: string
  ): Promise<ApplicationAnalytics> {
    try {
      let whereClause = 'v.employer_id = $1';
      const params: any[] = [employerId];

      if (vacancyId) {
        whereClause += ' AND a.vacancy_id = $2';
        params.push(vacancyId);
      }

      // Общее количество откликов по статусам
      const statusStats = await db.manyOrNone(
        `SELECT
          a.status,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (a.viewed_at - a.created_at)) / 3600) as avg_response_time_hours
        FROM applications a
        JOIN vacancies v ON v.id = a.vacancy_id
        WHERE ${whereClause}
        GROUP BY a.status`,
        params
      );

      const byStatus: Record<string, number> = {};
      let totalApplications = 0;
      let totalResponseTime = 0;
      let responseCount = 0;

      for (const stat of statusStats) {
        byStatus[stat.status] = parseInt(stat.count);
        totalApplications += parseInt(stat.count);

        if (stat.avg_response_time_hours) {
          totalResponseTime += parseFloat(stat.avg_response_time_hours);
          responseCount++;
        }
      }

      // Конверсия (pending -> hired)
      const pending = byStatus['pending'] || 0;
      const hired = byStatus['hired'] || 0;
      const conversionRate = pending > 0 ? (hired / pending) * 100 : 0;

      return {
        totalApplications,
        byStatus,
        averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
        conversionRate,
      };
    } catch (error: any) {
      console.error('❌ Error getting application analytics:', error);
      throw error;
    }
  }

  // ===================================
  // VACANCY ANALYTICS
  // ===================================

  /**
   * Получить аналитику по вакансии
   */
  async getVacancyAnalytics(vacancyId: string): Promise<VacancyAnalytics> {
    try {
      // Получить вакансию
      const vacancy = await db.oneOrNone(
        `SELECT
          id,
          title,
          views,
          created_at
        FROM vacancies
        WHERE id = $1`,
        [vacancyId]
      );

      if (!vacancy) {
        throw new Error('Vacancy not found');
      }

      // Получить количество откликов
      const applicationStats = await db.oneOrNone(
        `SELECT
          COUNT(*) as total_applications,
          AVG(EXTRACT(EPOCH FROM (a.created_at - v.created_at)) / 3600) as avg_time_to_apply_hours
        FROM applications a
        JOIN vacancies v ON v.id = a.vacancy_id
        WHERE a.vacancy_id = $1`,
        [vacancyId]
      );

      const views = vacancy.views || 0;
      const applications = parseInt(applicationStats?.total_applications || '0');
      const conversionRate = views > 0 ? (applications / views) * 100 : 0;

      return {
        vacancyId,
        views,
        applications,
        conversionRate,
        averageApplicationTime: parseFloat(applicationStats?.avg_time_to_apply_hours || '0'),
      };
    } catch (error: any) {
      console.error('❌ Error getting vacancy analytics:', error);
      throw error;
    }
  }

  // ===================================
  // USER ACTIVITY ANALYTICS
  // ===================================

  /**
   * Получить аналитику активности пользователя
   */
  async getUserActivityAnalytics(userId: string): Promise<UserActivityAnalytics> {
    try {
      // Получить пользователя
      const user = await db.oneOrNone(
        `SELECT
          id,
          last_login_at,
          created_at
        FROM users
        WHERE id = $1`,
        [userId]
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Подсчитать активность (примерный подход, нужен трекинг логинов)
      const activity = await db.oneOrNone(
        `SELECT
          (SELECT COUNT(*) FROM applications WHERE jobseeker_id = $1) as applications_sent,
          (SELECT COUNT(*) FROM chat_messages WHERE sender_id = $1) as messages_sent
        `,
        [userId]
      );

      return {
        userId,
        totalLogins: 0, // Нужна таблица login_history
        lastLoginAt: user.last_login_at || user.created_at,
        totalVacanciesViewed: 0, // Нужна таблица view_history
        totalApplicationsSent: parseInt(activity?.applications_sent || '0'),
        totalMessagesSent: parseInt(activity?.messages_sent || '0'),
        averageSessionDuration: 0, // Нужна таблица session_history
      };
    } catch (error: any) {
      console.error('❌ Error getting user activity analytics:', error);
      throw error;
    }
  }

  // ===================================
  // PLATFORM ANALYTICS
  // ===================================

  /**
   * Получить общую аналитику платформы
   */
  async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    try {
      // Общие метрики
      const general = await db.one(
        `SELECT
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '7 days') as active_users,
          (SELECT COUNT(*) FROM vacancies) as total_vacancies,
          (SELECT COUNT(*) FROM vacancies WHERE status = 'active') as active_vacancies,
          (SELECT COUNT(*) FROM applications) as total_applications,
          (SELECT COUNT(*) FROM chat_messages) as total_messages
        `
      );

      // Conversion funnel
      const funnel = await db.one(
        `SELECT
          (SELECT COUNT(*) FROM users WHERE role = 'jobseeker') as registered,
          (SELECT COUNT(DISTINCT jobseeker_id) FROM applications) as sent_applications,
          (SELECT COUNT(*) FROM applications WHERE status = 'interview') as got_interview,
          (SELECT COUNT(*) FROM applications WHERE status = 'hired') as hired
        `
      );

      return {
        totalUsers: parseInt(general.total_users),
        activeUsers: parseInt(general.active_users),
        totalVacancies: parseInt(general.total_vacancies),
        activeVacancies: parseInt(general.active_vacancies),
        totalApplications: parseInt(general.total_applications),
        totalMessages: parseInt(general.total_messages),
        conversionFunnel: {
          registered: parseInt(funnel.registered),
          viewedVacancies: 0, // Нужна таблица view_history
          sentApplications: parseInt(funnel.sent_applications),
          gotInterview: parseInt(funnel.got_interview),
          hired: parseInt(funnel.hired),
        },
      };
    } catch (error: any) {
      console.error('❌ Error getting platform analytics:', error);
      throw error;
    }
  }

  // ===================================
  // REAL-TIME STATS
  // ===================================

  /**
   * Получить статистику за период
   */
  async getStatsForPeriod(days: number = 7) {
    try {
      const stats = await db.one(
        `SELECT
          (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '${days} days') as new_users,
          (SELECT COUNT(*) FROM vacancies WHERE created_at > NOW() - INTERVAL '${days} days') as new_vacancies,
          (SELECT COUNT(*) FROM applications WHERE created_at > NOW() - INTERVAL '${days} days') as new_applications,
          (SELECT COUNT(*) FROM chat_messages WHERE created_at > NOW() - INTERVAL '${days} days') as new_messages
        `
      );

      return {
        period: `${days} days`,
        newUsers: parseInt(stats.new_users),
        newVacancies: parseInt(stats.new_vacancies),
        newApplications: parseInt(stats.new_applications),
        newMessages: parseInt(stats.new_messages),
      };
    } catch (error: any) {
      console.error('❌ Error getting period stats:', error);
      throw error;
    }
  }

  /**
   * Получить топ вакансий по просмотрам (с кешированием)
   */
  async getTopVacancies(limit: number = 10) {
    try {
      const cacheKey = `analytics:top-vacancies:${limit}`;

      // Попытаться получить из кеша
      return await cacheService.getOrSet(
        cacheKey,
        async () => {
          const topVacancies = await db.manyOrNone(
            `SELECT
              v.id,
              v.title,
              v.views,
              e.company_name,
              (SELECT COUNT(*) FROM applications WHERE vacancy_id = v.id) as applications_count
            FROM vacancies v
            JOIN employers e ON e.id = v.employer_id
            WHERE v.status = 'active'
            ORDER BY v.views DESC
            LIMIT $1`,
            [limit]
          );
          return topVacancies;
        },
        TTL.MEDIUM // Кешировать на 5 минут
      );
    } catch (error: any) {
      console.error('❌ Error getting top vacancies:', error);
      throw error;
    }
  }

  /**
   * Получить топ работодателей по откликам
   */
  async getTopEmployers(limit: number = 10) {
    try {
      const topEmployers = await db.manyOrNone(
        `SELECT
          e.id,
          e.company_name,
          COUNT(a.id) as total_applications,
          COUNT(DISTINCT v.id) as total_vacancies,
          AVG(v.views) as avg_vacancy_views
        FROM employers e
        JOIN vacancies v ON v.employer_id = e.id
        LEFT JOIN applications a ON a.vacancy_id = v.id
        GROUP BY e.id, e.company_name
        ORDER BY COUNT(a.id) DESC
        LIMIT $1`,
        [limit]
      );

      return topEmployers;
    } catch (error: any) {
      console.error('❌ Error getting top employers:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
