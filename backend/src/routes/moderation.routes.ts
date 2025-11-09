/**
 * 360° РАБОТА - Moderation Routes
 *
 * Маршруты для модерации видео и жалоб
 */

import { Router } from 'express';
import { ModerationController } from '../controllers/ModerationController';
import { authMiddleware } from '../middleware/auth';
import { requireModerator } from '../middleware/requireModerator';

const router = Router();

// ===================================
// MODERATION ROUTES (Moderators only)
// ===================================

/**
 * GET /api/v1/moderation/pending
 * Получить список видео, ожидающих модерации
 * Query params: page, limit, priority_only
 */
router.get(
  '/pending',
  authMiddleware,
  requireModerator,
  ModerationController.getPendingVideos
);

/**
 * POST /api/v1/moderation/moderate
 * Промодерировать видео (одобрить/отклонить/пометить/заблокировать)
 * Body: { video_id, action, reason?, comment? }
 */
router.post(
  '/moderate',
  authMiddleware,
  requireModerator,
  ModerationController.moderateVideo
);

/**
 * GET /api/v1/moderation/logs/:videoId
 * Получить логи модерации для конкретного видео
 */
router.get(
  '/logs/:videoId',
  authMiddleware,
  requireModerator,
  ModerationController.getModerationLogs
);

// ===================================
// COMPLAINTS ROUTES
// ===================================

/**
 * POST /api/v1/moderation/complaints
 * Создать жалобу на видео
 * Body: { video_id, reason, description? }
 */
router.post(
  '/complaints',
  authMiddleware,
  ModerationController.submitComplaint
);

/**
 * GET /api/v1/moderation/complaints
 * Получить список жалоб (модераторы)
 * Query params: status, page, limit
 */
router.get(
  '/complaints',
  authMiddleware,
  requireModerator,
  ModerationController.getComplaints
);

/**
 * PATCH /api/v1/moderation/complaints/:complaintId
 * Рассмотреть жалобу (модераторы)
 * Body: { status, comment? }
 */
router.patch(
  '/complaints/:complaintId',
  authMiddleware,
  requireModerator,
  ModerationController.reviewComplaint
);

// ===================================
// AI MODERATION ROUTES (Internal)
// ===================================

/**
 * POST /api/v1/moderation/ai-check/:videoId
 * Выполнить AI проверку видео
 * Internal use - вызывается после загрузки видео
 */
router.post(
  '/ai-check/:videoId',
  authMiddleware,
  // TODO: Add internal API key check or remove auth for internal calls
  ModerationController.performAICheck
);

export default router;
