/**
 * 360° РАБОТА - Guest Analytics Controller
 * Tracks guest browsing behavior before registration
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SyncGuestViewsRequest {
  count: number;
  viewedVacancies: string[];
  firstViewAt: string;
  lastViewAt: string;
  sessionId?: string;
  deviceInfo?: {
    platform?: string;
    os?: string;
    browser?: string;
  };
}

export class GuestAnalyticsController {
  /**
   * Sync guest views from mobile app
   * POST /api/v1/analytics/guest-views
   */
  static async syncGuestViews(req: Request, res: Response) {
    try {
      const {
        count,
        viewedVacancies,
        firstViewAt,
        lastViewAt,
        sessionId,
        deviceInfo,
      }: SyncGuestViewsRequest = req.body;

      // Validation
      if (!count || !viewedVacancies || !firstViewAt || !lastViewAt) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: count, viewedVacancies, firstViewAt, lastViewAt',
        });
      }

      if (!Array.isArray(viewedVacancies)) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'viewedVacancies must be an array',
        });
      }

      // Check if authenticated (post-registration sync)
      const userId = req.user?.userId;
      const convertedToUser = !!userId;

      // Get or create guest analytics record
      let guestAnalytics;

      if (sessionId) {
        // Update existing session or create new
        guestAnalytics = await prisma.guestAnalytics.upsert({
          where: { sessionId },
          update: {
            viewsCount: count,
            viewedVacancies,
            lastViewAt: new Date(lastViewAt),
            convertedToUser,
            userId: userId || undefined,
            deviceInfo: deviceInfo || undefined,
            updatedAt: new Date(),
          },
          create: {
            sessionId,
            viewsCount: count,
            viewedVacancies,
            firstViewAt: new Date(firstViewAt),
            lastViewAt: new Date(lastViewAt),
            convertedToUser,
            userId: userId || undefined,
            deviceInfo: deviceInfo || undefined,
          },
        });
      } else {
        // No sessionId - create new record
        guestAnalytics = await prisma.guestAnalytics.create({
          data: {
            viewsCount: count,
            viewedVacancies,
            firstViewAt: new Date(firstViewAt),
            lastViewAt: new Date(lastViewAt),
            convertedToUser,
            userId: userId || undefined,
            deviceInfo: deviceInfo || undefined,
          },
        });
      }

      return res.json({
        success: true,
        synced: true,
        analyticsId: guestAnalytics.id,
        convertedToUser,
      });
    } catch (error) {
      console.error('Error in syncGuestViews:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to sync guest views',
      });
    }
  }

  /**
   * Get guest analytics statistics (admin/internal use)
   * GET /api/v1/analytics/guest-stats
   */
  static async getGuestStats(req: Request, res: Response) {
    try {
      // Check if user is admin/moderator
      const userRole = req.user?.role;
      if (userRole !== 'MODERATOR') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only moderators can access analytics',
        });
      }

      // Total guests
      const totalGuests = await prisma.guestAnalytics.count();

      // Converted guests
      const convertedGuests = await prisma.guestAnalytics.count({
        where: { convertedToUser: true },
      });

      // Average views before conversion
      const conversionData = await prisma.guestAnalytics.findMany({
        where: { convertedToUser: true },
        select: { viewsCount: true },
      });

      const avgViewsBeforeConversion =
        conversionData.length > 0
          ? conversionData.reduce((sum, item) => sum + item.viewsCount, 0) /
            conversionData.length
          : 0;

      // Recent guest activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentGuests = await prisma.guestAnalytics.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      });

      // Conversion rate
      const conversionRate =
        totalGuests > 0 ? (convertedGuests / totalGuests) * 100 : 0;

      return res.json({
        success: true,
        stats: {
          totalGuests,
          convertedGuests,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          avgViewsBeforeConversion: parseFloat(avgViewsBeforeConversion.toFixed(2)),
          recentGuests,
        },
      });
    } catch (error) {
      console.error('Error in getGuestStats:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get guest stats',
      });
    }
  }

  /**
   * Get detailed guest analytics (admin/internal use)
   * GET /api/v1/analytics/guests
   */
  static async getGuestAnalytics(req: Request, res: Response) {
    try {
      // Check if user is admin/moderator
      const userRole = req.user?.role;
      if (userRole !== 'MODERATOR') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only moderators can access analytics',
        });
      }

      const { limit = '50', offset = '0', converted } = req.query;

      // Build query filters
      const where: any = {};
      if (converted === 'true') {
        where.convertedToUser = true;
      } else if (converted === 'false') {
        where.convertedToUser = false;
      }

      // Get guest analytics records
      const guests = await prisma.guestAnalytics.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(parseInt(limit as string), 100),
        skip: parseInt(offset as string),
      });

      // Get total count
      const totalCount = await prisma.guestAnalytics.count({ where });

      return res.json({
        success: true,
        guests: guests.map((guest) => ({
          id: guest.id,
          sessionId: guest.sessionId,
          viewsCount: guest.viewsCount,
          viewedVacancies: guest.viewedVacancies,
          firstViewAt: guest.firstViewAt,
          lastViewAt: guest.lastViewAt,
          convertedToUser: guest.convertedToUser,
          userId: guest.userId,
          deviceInfo: guest.deviceInfo,
          createdAt: guest.createdAt,
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + guests.length < totalCount,
        },
      });
    } catch (error) {
      console.error('Error in getGuestAnalytics:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get guest analytics',
      });
    }
  }

  /**
   * Get most viewed vacancies by guests
   * GET /api/v1/analytics/top-vacancies-by-guests
   */
  static async getTopVacanciesByGuests(req: Request, res: Response) {
    try {
      // Check if user is admin/moderator
      const userRole = req.user?.role;
      if (userRole !== 'MODERATOR') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only moderators can access analytics',
        });
      }

      const { limit = '20' } = req.query;

      // Get all guest analytics
      const allGuests = await prisma.guestAnalytics.findMany({
        select: { viewedVacancies: true },
      });

      // Count vacancy views
      const vacancyCounts: Record<string, number> = {};
      allGuests.forEach((guest) => {
        guest.viewedVacancies.forEach((vacancyId) => {
          vacancyCounts[vacancyId] = (vacancyCounts[vacancyId] || 0) + 1;
        });
      });

      // Sort by count
      const sortedVacancies = Object.entries(vacancyCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, parseInt(limit as string));

      // Get vacancy details
      const vacancyIds = sortedVacancies.map(([id]) => id);
      const vacancies = await prisma.vacancy.findMany({
        where: { id: { in: vacancyIds } },
        include: {
          employer: {
            select: {
              companyName: true,
              verified: true,
            },
          },
        },
      });

      // Build response
      const topVacancies = sortedVacancies.map(([vacancyId, viewCount]) => {
        const vacancy = vacancies.find((v) => v.id === vacancyId);
        return {
          vacancyId,
          viewCount,
          vacancy: vacancy || null,
        };
      });

      return res.json({
        success: true,
        topVacancies,
      });
    } catch (error) {
      console.error('Error in getTopVacanciesByGuests:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to get top vacancies',
      });
    }
  }
}
