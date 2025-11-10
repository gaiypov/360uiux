/**
 * 360° РАБОТА - Analytics Routes
 * Guest analytics and statistics
 * TEMPORARILY DISABLED - Uses Prisma
 */

import { Router } from 'express';
// import { authMiddleware } from '../middleware/auth';
// import { GuestAnalyticsController } from '../controllers/GuestAnalyticsController';

const router = Router();

// /**
//  * Sync guest views from mobile app
//  * POST /api/v1/analytics/guest-views
//  * No auth required - can be called by guests and registered users
//  */
// router.post('/guest-views', GuestAnalyticsController.syncGuestViews);

// /**
//  * Get guest analytics statistics (admin/moderator only)
//  * GET /api/v1/analytics/guest-stats
//  */
// router.get('/guest-stats', authMiddleware, GuestAnalyticsController.getGuestStats);

// /**
//  * Get detailed guest analytics (admin/moderator only)
//  * GET /api/v1/analytics/guests
//  */
// router.get('/guests', authMiddleware, GuestAnalyticsController.getGuestAnalytics);

// /**
//  * Get most viewed vacancies by guests (admin/moderator only)
//  * GET /api/v1/analytics/top-vacancies-by-guests
//  */
// router.get('/top-vacancies-by-guests', authMiddleware, GuestAnalyticsController.getTopVacanciesByGuests);

export default router;
