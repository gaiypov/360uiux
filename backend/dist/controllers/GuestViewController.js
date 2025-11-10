"use strict";
/**
 * 360° РАБОТА - Guest View Tracking Controller
 * Tracks guest user views server-side for 20-video limit
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestViewController = void 0;
const redis_1 = require("../config/redis");
const uuid_1 = require("uuid");
const GUEST_VIEW_LIMIT = 20;
const GUEST_SESSION_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
class GuestViewController {
    /**
     * Track a guest view
     * POST /api/v1/guests/views
     */
    static async trackView(req, res) {
        try {
            const { vacancyId, guestId: clientGuestId } = req.body;
            if (!vacancyId) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Vacancy ID is required',
                });
                return;
            }
            // Generate or use existing guest ID
            const guestId = clientGuestId || (0, uuid_1.v4)();
            const redisKey = `guest_views:${guestId}`;
            // Get existing view data
            const existingData = await redis_1.redisHelpers.getJSON(redisKey);
            let viewData;
            if (existingData) {
                // Check if already viewed this vacancy
                if (existingData.vacancyIds.includes(vacancyId)) {
                    // Already viewed, return current count
                    res.json({
                        success: true,
                        guestId,
                        count: existingData.count,
                        limit: GUEST_VIEW_LIMIT,
                        remaining: Math.max(0, GUEST_VIEW_LIMIT - existingData.count),
                        limitReached: existingData.count >= GUEST_VIEW_LIMIT,
                    });
                    return;
                }
                // Add new vacancy to viewed list
                viewData = {
                    guestId,
                    vacancyIds: [...existingData.vacancyIds, vacancyId],
                    count: existingData.count + 1,
                    lastViewedAt: new Date().toISOString(),
                };
            }
            else {
                // First view
                viewData = {
                    guestId,
                    vacancyIds: [vacancyId],
                    count: 1,
                    lastViewedAt: new Date().toISOString(),
                };
            }
            // Save to Redis with TTL
            await redis_1.redisHelpers.setJSON(redisKey, viewData, GUEST_SESSION_TTL);
            res.json({
                success: true,
                guestId,
                count: viewData.count,
                limit: GUEST_VIEW_LIMIT,
                remaining: Math.max(0, GUEST_VIEW_LIMIT - viewData.count),
                limitReached: viewData.count >= GUEST_VIEW_LIMIT,
            });
        }
        catch (error) {
            console.error('Error tracking guest view:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message || 'Failed to track view',
            });
        }
    }
    /**
     * Get guest view status
     * GET /api/v1/guests/views/:guestId
     */
    static async getViewStatus(req, res) {
        try {
            const { guestId } = req.params;
            if (!guestId) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Guest ID is required',
                });
                return;
            }
            const redisKey = `guest_views:${guestId}`;
            const viewData = await redis_1.redisHelpers.getJSON(redisKey);
            if (!viewData) {
                res.json({
                    success: true,
                    count: 0,
                    limit: GUEST_VIEW_LIMIT,
                    remaining: GUEST_VIEW_LIMIT,
                    limitReached: false,
                    vacancyIds: [],
                });
                return;
            }
            res.json({
                success: true,
                count: viewData.count,
                limit: GUEST_VIEW_LIMIT,
                remaining: Math.max(0, GUEST_VIEW_LIMIT - viewData.count),
                limitReached: viewData.count >= GUEST_VIEW_LIMIT,
                vacancyIds: viewData.vacancyIds,
                lastViewedAt: viewData.lastViewedAt,
            });
        }
        catch (error) {
            console.error('Error getting guest view status:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message || 'Failed to get view status',
            });
        }
    }
    /**
     * Sync guest views (batch)
     * POST /api/v1/guests/views/sync
     */
    static async syncViews(req, res) {
        try {
            const { guestId, vacancyIds } = req.body;
            if (!guestId || !vacancyIds || !Array.isArray(vacancyIds)) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Guest ID and vacancy IDs array are required',
                });
                return;
            }
            const redisKey = `guest_views:${guestId}`;
            const existingData = await redis_1.redisHelpers.getJSON(redisKey);
            // Merge with existing views
            const allVacancyIds = existingData
                ? [...new Set([...existingData.vacancyIds, ...vacancyIds])]
                : vacancyIds;
            const viewData = {
                guestId,
                vacancyIds: allVacancyIds,
                count: allVacancyIds.length,
                lastViewedAt: new Date().toISOString(),
            };
            // Save to Redis
            await redis_1.redisHelpers.setJSON(redisKey, viewData, GUEST_SESSION_TTL);
            res.json({
                success: true,
                guestId,
                count: viewData.count,
                limit: GUEST_VIEW_LIMIT,
                remaining: Math.max(0, GUEST_VIEW_LIMIT - viewData.count),
                limitReached: viewData.count >= GUEST_VIEW_LIMIT,
            });
        }
        catch (error) {
            console.error('Error syncing guest views:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message || 'Failed to sync views',
            });
        }
    }
    /**
     * Clear guest views (for testing)
     * DELETE /api/v1/guests/views/:guestId
     */
    static async clearViews(req, res) {
        try {
            const { guestId } = req.params;
            if (!guestId) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'Guest ID is required',
                });
                return;
            }
            const redisKey = `guest_views:${guestId}`;
            await redis_1.redisHelpers.deleteByPattern(redisKey);
            res.json({
                success: true,
                message: 'Guest views cleared',
            });
        }
        catch (error) {
            console.error('Error clearing guest views:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message || 'Failed to clear views',
            });
        }
    }
}
exports.GuestViewController = GuestViewController;
//# sourceMappingURL=GuestViewController.js.map