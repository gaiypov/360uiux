/**
 * 360° РАБОТА - User Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { UserController } from '../controllers/UserController';

const router = Router();

/**
 * Получить мой профиль
 * GET /api/v1/users/me
 */
router.get('/me', authMiddleware, UserController.getMyProfile);

/**
 * Обновить профиль
 * PUT /api/v1/users/profile
 */
router.put('/profile', authMiddleware, UserController.updateProfile);

/**
 * Загрузить аватар
 * POST /api/v1/users/avatar
 */
router.post('/avatar', authMiddleware, UserController.uploadAvatar);

/**
 * Получить мою статистику
 * GET /api/v1/users/me/stats
 */
router.get('/me/stats', authMiddleware, UserController.getMyStats);

/**
 * Удалить аккаунт
 * DELETE /api/v1/users/me
 */
router.delete('/me', authMiddleware, UserController.deleteAccount);

/**
 * Получить профиль пользователя по ID
 * GET /api/v1/users/:id
 */
router.get('/:id', UserController.getUserProfile);

export default router;
