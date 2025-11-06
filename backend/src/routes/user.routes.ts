/**
 * 360° РАБОТА - User Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

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

export default router;
