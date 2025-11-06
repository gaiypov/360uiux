/**
 * 360° РАБОТА - Analytics Routes
 * Guest analytics and platform statistics
 * Architecture v3: Video, applications, vacancy analytics
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { GuestAnalyticsController } from '../controllers/GuestAnalyticsController';
import { AnalyticsController } from '../controllers/AnalyticsController';

const router = Router();

/**
 * Sync guest views from mobile app
 * POST /api/v1/analytics/guest-views
 * No auth required - can be called by guests and registered users
 */
router.post('/guest-views', GuestAnalyticsController.syncGuestViews);

/**
 * Get guest analytics statistics (admin/moderator only)
 * GET /api/v1/analytics/guest-stats
 */
router.get('/guest-stats', authMiddleware, GuestAnalyticsController.getGuestStats);

/**
 * Get detailed guest analytics (admin/moderator only)
 * GET /api/v1/analytics/guests
 */
router.get('/guests', authMiddleware, GuestAnalyticsController.getGuestAnalytics);

/**
 * Get most viewed vacancies by guests (admin/moderator only)
 * GET /api/v1/analytics/top-vacancies-by-guests
 */
router.get('/top-vacancies-by-guests', authMiddleware, GuestAnalyticsController.getTopVacanciesByGuests);

// ===================================
// PLATFORM ANALYTICS (Architecture v3)
// ===================================

/**
 * Get video analytics
 * GET /api/v1/analytics/video/:videoId
 */
router.get('/video/:videoId', authMiddleware, AnalyticsController.getVideoAnalytics);

/**
 * Get application analytics (employer only)
 * GET /api/v1/analytics/applications
 * Query: vacancyId (optional)
 */
router.get('/applications', authMiddleware, AnalyticsController.getApplicationAnalytics);

/**
 * Get vacancy analytics (employer only)
 * GET /api/v1/analytics/vacancy/:vacancyId
 */
router.get('/vacancy/:vacancyId', authMiddleware, AnalyticsController.getVacancyAnalytics);

/**
 * Get user activity analytics
 * GET /api/v1/analytics/user/activity
 */
router.get('/user/activity', authMiddleware, AnalyticsController.getUserActivityAnalytics);

/**
 * Get platform analytics (admin only)
 * GET /api/v1/analytics/platform
 */
router.get('/platform', authMiddleware, AnalyticsController.getPlatformAnalytics);

/**
 * Get stats for period
 * GET /api/v1/analytics/period
 * Query: days (default: 7)
 */
router.get('/period', authMiddleware, AnalyticsController.getStatsForPeriod);

/**
 * Get top vacancies by views
 * GET /api/v1/analytics/top/vacancies
 * Query: limit (default: 10)
 */
router.get('/top/vacancies', authMiddleware, AnalyticsController.getTopVacancies);

/**
 * Get top employers by applications
 * GET /api/v1/analytics/top/employers
 * Query: limit (default: 10)
 */
router.get('/top/employers', authMiddleware, AnalyticsController.getTopEmployers);

export default router;
