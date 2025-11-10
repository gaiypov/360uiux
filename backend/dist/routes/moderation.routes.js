"use strict";
/**
 * 360° РАБОТА - Moderation Routes
 *
 * Маршруты для модерации видео и жалоб
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ModerationController_1 = require("../controllers/ModerationController");
const auth_1 = require("../middleware/auth");
const requireModerator_1 = require("../middleware/requireModerator");
const router = (0, express_1.Router)();
// ===================================
// MODERATION ROUTES (Moderators only)
// ===================================
/**
 * GET /api/v1/moderation/pending
 * Получить список видео, ожидающих модерации
 * Query params: page, limit, priority_only
 */
router.get('/pending', auth_1.authMiddleware, requireModerator_1.requireModerator, ModerationController_1.ModerationController.getPendingVideos);
/**
 * POST /api/v1/moderation/moderate
 * Промодерировать видео (одобрить/отклонить/пометить/заблокировать)
 * Body: { video_id, action, reason?, comment? }
 */
router.post('/moderate', auth_1.authMiddleware, requireModerator_1.requireModerator, ModerationController_1.ModerationController.moderateVideo);
/**
 * GET /api/v1/moderation/logs/:videoId
 * Получить логи модерации для конкретного видео
 */
router.get('/logs/:videoId', auth_1.authMiddleware, requireModerator_1.requireModerator, ModerationController_1.ModerationController.getModerationLogs);
// ===================================
// COMPLAINTS ROUTES
// ===================================
/**
 * POST /api/v1/moderation/complaints
 * Создать жалобу на видео
 * Body: { video_id, reason, description? }
 */
router.post('/complaints', auth_1.authMiddleware, ModerationController_1.ModerationController.submitComplaint);
/**
 * GET /api/v1/moderation/complaints
 * Получить список жалоб (модераторы)
 * Query params: status, page, limit
 */
router.get('/complaints', auth_1.authMiddleware, requireModerator_1.requireModerator, ModerationController_1.ModerationController.getComplaints);
/**
 * PATCH /api/v1/moderation/complaints/:complaintId
 * Рассмотреть жалобу (модераторы)
 * Body: { status, comment? }
 */
router.patch('/complaints/:complaintId', auth_1.authMiddleware, requireModerator_1.requireModerator, ModerationController_1.ModerationController.reviewComplaint);
// ===================================
// AI MODERATION ROUTES (Internal)
// ===================================
/**
 * POST /api/v1/moderation/ai-check/:videoId
 * Выполнить AI проверку видео
 * Internal use - вызывается после загрузки видео
 */
router.post('/ai-check/:videoId', auth_1.authMiddleware, 
// TODO: Add internal API key check or remove auth for internal calls
ModerationController_1.ModerationController.performAICheck);
exports.default = router;
//# sourceMappingURL=moderation.routes.js.map