/**
 * 360° РАБОТА - Vacancy Routes
 */

import { Router } from 'express';
import { authMiddleware, requireEmployer } from '../middleware/auth';
import { VacancyInteractionsController } from '../controllers/VacancyInteractionsController';

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

/**
 * Like a vacancy
 * POST /api/v1/vacancies/:id/like
 */
router.post('/:id/like', authMiddleware, VacancyInteractionsController.likeVacancy);

/**
 * Unlike a vacancy
 * DELETE /api/v1/vacancies/:id/like
 */
router.delete('/:id/like', authMiddleware, VacancyInteractionsController.unlikeVacancy);

/**
 * Favorite a vacancy
 * POST /api/v1/vacancies/:id/favorite
 */
router.post('/:id/favorite', authMiddleware, VacancyInteractionsController.favoriteVacancy);

/**
 * Unfavorite a vacancy
 * DELETE /api/v1/vacancies/:id/favorite
 */
router.delete('/:id/favorite', authMiddleware, VacancyInteractionsController.unfavoriteVacancy);

/**
 * Add a comment to a vacancy
 * POST /api/v1/vacancies/:id/comments
 */
router.post('/:id/comments', authMiddleware, VacancyInteractionsController.addComment);

/**
 * Get comments for a vacancy
 * GET /api/v1/vacancies/:id/comments
 */
router.get('/:id/comments', VacancyInteractionsController.getComments);

/**
 * Get user's favorite vacancies
 * GET /api/v1/favorites
 */
router.get('/user/favorites', authMiddleware, VacancyInteractionsController.getFavorites);

export default router;
