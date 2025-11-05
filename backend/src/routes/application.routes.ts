/**
 * 360° РАБОТА - Application Routes
 */

import { Router } from 'express';
import { authMiddleware, requireJobSeeker } from '../middleware/auth';

const router = Router();

/**
 * Создать отклик
 * POST /api/v1/applications
 */
router.post('/', authMiddleware, requireJobSeeker, async (req, res) => {
  res.json({ message: 'Create application endpoint - Coming soon' });
});

/**
 * Получить мои отклики
 * GET /api/v1/applications/my
 */
router.get('/my', authMiddleware, async (req, res) => {
  res.json({ message: 'Get my applications endpoint - Coming soon' });
});

/**
 * Получить отклик по ID
 * GET /api/v1/applications/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  res.json({ message: 'Get application endpoint - Coming soon' });
});

export default router;
