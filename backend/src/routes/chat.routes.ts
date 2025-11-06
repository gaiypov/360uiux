/**
 * 360° РАБОТА - Chat Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Получить список чатов
 * GET /api/v1/chats
 */
router.get('/', authMiddleware, async (req, res) => {
  res.json({ message: 'List chats endpoint - Coming soon' });
});

/**
 * Получить чат по ID
 * GET /api/v1/chats/:id
 */
router.get('/:id', authMiddleware, async (req, res) => {
  res.json({ message: 'Get chat endpoint - Coming soon' });
});

/**
 * Отправить сообщение
 * POST /api/v1/chats/:id/messages
 */
router.post('/:id/messages', authMiddleware, async (req, res) => {
  res.json({ message: 'Send message endpoint - Coming soon' });
});

export default router;
