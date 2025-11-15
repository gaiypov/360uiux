/**
 * 360° РАБОТА - User Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { db } from '../config/database';

const router = Router();

/**
 * Обновить профиль
 * PUT /api/v1/users/profile
 */
router.put('/profile', authMiddleware, async (req, res) => {
  res.json({ message: 'Update profile endpoint - Coming soon' });
});

/**
 * Получить профиль пользователя
 * GET /api/v1/users/:id
 */
router.get('/:id', async (req, res) => {
  res.json({ message: 'Get user profile endpoint - Coming soon' });
});

/**
 * Зарегистрировать FCM токен для push-уведомлений
 * POST /api/v1/users/fcm-token
 * Body: { token: string }
 */
router.post('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user!.userId;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'Invalid FCM token',
        message: 'Token must be a non-empty string',
      });
    }

    // Обновить FCM токен пользователя
    await db.none(
      'UPDATE users SET fcm_token = $1, updated_at = NOW() WHERE id = $2',
      [token, userId]
    );

    console.log(`✅ FCM token registered for user ${userId}`);

    return res.json({
      success: true,
      message: 'FCM token registered successfully',
    });
  } catch (error: any) {
    console.error('Register FCM token error:', error);
    return res.status(500).json({
      error: 'Failed to register FCM token',
      message: error.message,
    });
  }
});

/**
 * Удалить FCM токен (logout, отписка от уведомлений)
 * DELETE /api/v1/users/fcm-token
 */
router.delete('/fcm-token', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Удалить FCM токен
    await db.none(
      'UPDATE users SET fcm_token = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    console.log(`✅ FCM token removed for user ${userId}`);

    return res.json({
      success: true,
      message: 'FCM token removed successfully',
    });
  } catch (error: any) {
    console.error('Remove FCM token error:', error);
    return res.status(500).json({
      error: 'Failed to remove FCM token',
      message: error.message,
    });
  }
});

export default router;
