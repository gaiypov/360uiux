/**
 * 360° РАБОТА - Vacancy Routes
 */

import { Router } from 'express';
import { authMiddleware, requireEmployer } from '../middleware/auth';
import { VacancyController } from '../controllers/VacancyController';
import { VacancyInteractionsController } from '../controllers/VacancyInteractionsController';

const router = Router();

/**
 * Создать вакансию
 * POST /api/v1/vacancies
 */
router.post('/', authMiddleware, requireEmployer, VacancyController.createVacancy);

/**
 * Получить мои вакансии (работодатель)
 * GET /api/v1/vacancies/my/list
 */
router.get('/my/list', authMiddleware, requireEmployer, VacancyController.getMyVacancies);

/**
 * Опубликовать вакансию
 * POST /api/v1/vacancies/:id/publish
 */
router.post('/:id/publish', authMiddleware, requireEmployer, VacancyController.publishVacancy);

/**
 * Продлить вакансию на 7 дней (500₽)
 * POST /api/v1/vacancies/:id/extend
 */
router.post('/:id/extend', authMiddleware, requireEmployer, VacancyController.extendVacancy);

/**
 * Получить список вакансий (каталог для всех)
 * GET /api/v1/vacancies
 */
router.get('/', VacancyController.listVacancies);

/**
 * Получить вакансию по ID
 * GET /api/v1/vacancies/:id
 */
router.get('/:id', VacancyController.getVacancy);

/**
 * Обновить вакансию
 * PUT /api/v1/vacancies/:id
 */
router.put('/:id', authMiddleware, requireEmployer, VacancyController.updateVacancy);

/**
 * Удалить вакансию (архивировать)
 * DELETE /api/v1/vacancies/:id
 */
router.delete('/:id', authMiddleware, requireEmployer, VacancyController.deleteVacancy);

// ===================================
// VACANCY INTERACTIONS (Architecture v3)
// ===================================

/**
 * Get my likes
 * GET /api/v1/vacancies/likes/my
 */
router.get('/likes/my', authMiddleware, VacancyInteractionsController.getMyLikes);

/**
 * Get my favorites
 * GET /api/v1/vacancies/favorites/my
 */
router.get('/favorites/my', authMiddleware, VacancyInteractionsController.getMyFavorites);

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

export default router;
