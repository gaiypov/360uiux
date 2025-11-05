/**
 * 360° РАБОТА - Vacancy Routes
 */

import { Router } from 'express';
import { authMiddleware, requireEmployer } from '../middleware/auth';

const router = Router();

/**
 * Создать вакансию
 * POST /api/v1/vacancies
 */
router.post('/', authMiddleware, requireEmployer, async (req, res) => {
  res.json({ message: 'Create vacancy endpoint - Coming soon' });
});

/**
 * Получить список вакансий
 * GET /api/v1/vacancies
 */
router.get('/', async (req, res) => {
  res.json({ message: 'List vacancies endpoint - Coming soon' });
});

/**
 * Получить вакансию по ID
 * GET /api/v1/vacancies/:id
 */
router.get('/:id', async (req, res) => {
  res.json({ message: 'Get vacancy endpoint - Coming soon' });
});

/**
 * Обновить вакансию
 * PUT /api/v1/vacancies/:id
 */
router.put('/:id', authMiddleware, requireEmployer, async (req, res) => {
  res.json({ message: 'Update vacancy endpoint - Coming soon' });
});

/**
 * Удалить вакансию
 * DELETE /api/v1/vacancies/:id
 */
router.delete('/:id', authMiddleware, requireEmployer, async (req, res) => {
  res.json({ message: 'Delete vacancy endpoint - Coming soon' });
});

export default router;
