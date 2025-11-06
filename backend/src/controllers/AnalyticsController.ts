/**
 * 360° РАБОТА - Analytics Controller
 * Architecture v3: Analytics endpoints для статистики и отчетов
 */

import { Request, Response } from 'express';
import { analyticsService } from '../services/AnalyticsService';

export class AnalyticsController {
  /**
   * Получить аналитику по видео
   * GET /api/analytics/video/:videoId
   */
  static async getVideoAnalytics(req: Request, res: Response) {
    try {
      const { videoId } = req.params;

      const analytics = await analyticsService.getVideoAnalytics(videoId);

      return res.json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error('Get video analytics error:', error);
      return res.status(500).json({
        error: 'Failed to get video analytics',
        message: error.message,
      });
    }
  }

  /**
   * Получить аналитику по откликам (для работодателя)
   * GET /api/analytics/applications
   * Query: vacancyId (optional)
   */
  static async getApplicationAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { vacancyId } = req.query;

      if (userRole !== 'employer') {
        return res.status(403).json({ error: 'Only employers can access application analytics' });
      }

      const analytics = await analyticsService.getApplicationAnalytics(
        userId,
        vacancyId as string | undefined
      );

      return res.json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error('Get application analytics error:', error);
      return res.status(500).json({
        error: 'Failed to get application analytics',
        message: error.message,
      });
    }
  }

  /**
   * Получить аналитику по вакансии
   * GET /api/analytics/vacancy/:vacancyId
   */
  static async getVacancyAnalytics(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;
      const userRole = req.user!.role;

      if (userRole !== 'employer') {
        return res.status(403).json({ error: 'Only employers can access vacancy analytics' });
      }

      const analytics = await analyticsService.getVacancyAnalytics(vacancyId);

      return res.json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error('Get vacancy analytics error:', error);
      return res.status(500).json({
        error: 'Failed to get vacancy analytics',
        message: error.message,
      });
    }
  }

  /**
   * Получить аналитику активности пользователя
   * GET /api/analytics/user/activity
   */
  static async getUserActivityAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const analytics = await analyticsService.getUserActivityAnalytics(userId);

      return res.json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error('Get user activity analytics error:', error);
      return res.status(500).json({
        error: 'Failed to get user activity analytics',
        message: error.message,
      });
    }
  }

  /**
   * Получить общую аналитику платформы (только для админов)
   * GET /api/analytics/platform
   */
  static async getPlatformAnalytics(req: Request, res: Response) {
    try {
      const userRole = req.user!.role;

      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can access platform analytics' });
      }

      const analytics = await analyticsService.getPlatformAnalytics();

      return res.json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error('Get platform analytics error:', error);
      return res.status(500).json({
        error: 'Failed to get platform analytics',
        message: error.message,
      });
    }
  }

  /**
   * Получить статистику за период
   * GET /api/analytics/period
   * Query: days (default: 7)
   */
  static async getStatsForPeriod(req: Request, res: Response) {
    try {
      const { days = '7' } = req.query;

      const stats = await analyticsService.getStatsForPeriod(parseInt(days as string));

      return res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error('Get period stats error:', error);
      return res.status(500).json({
        error: 'Failed to get period stats',
        message: error.message,
      });
    }
  }

  /**
   * Получить топ вакансий
   * GET /api/analytics/top/vacancies
   * Query: limit (default: 10)
   */
  static async getTopVacancies(req: Request, res: Response) {
    try {
      const { limit = '10' } = req.query;

      const vacancies = await analyticsService.getTopVacancies(parseInt(limit as string));

      return res.json({
        success: true,
        vacancies,
        count: vacancies.length,
      });
    } catch (error: any) {
      console.error('Get top vacancies error:', error);
      return res.status(500).json({
        error: 'Failed to get top vacancies',
        message: error.message,
      });
    }
  }

  /**
   * Получить топ работодателей
   * GET /api/analytics/top/employers
   * Query: limit (default: 10)
   */
  static async getTopEmployers(req: Request, res: Response) {
    try {
      const { limit = '10' } = req.query;

      const employers = await analyticsService.getTopEmployers(parseInt(limit as string));

      return res.json({
        success: true,
        employers,
        count: employers.length,
      });
    } catch (error: any) {
      console.error('Get top employers error:', error);
      return res.status(500).json({
        error: 'Failed to get top employers',
        message: error.message,
      });
    }
  }
}
