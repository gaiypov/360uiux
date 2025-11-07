/**
 * 360° РАБОТА - Vacancy Routes
 */

import { Router } from 'express';
import { authMiddleware, requireEmployer } from '../middleware/auth';
import { VacancyController } from '../controllers/VacancyController';
import { VacancyInteractionsController } from '../controllers/VacancyInteractionsController';

const router = Router();

/**
 * Get available filter options
 * GET /api/v1/vacancies/filters
 * Must be before /:id route
 */
router.get('/filters', VacancyController.getFilterOptions);

/**
 * Get user's favorite vacancies
 * GET /api/v1/vacancies/user/favorites
 * Must be before /:id route
 */
router.get('/user/favorites', authMiddleware, VacancyInteractionsController.getFavorites);

/**
 * Create a vacancy
 * POST /api/v1/vacancies
 */
router.post('/', authMiddleware, requireEmployer, VacancyController.createVacancy);

/**
 * Get list of vacancies with search and filters
 * GET /api/v1/vacancies
 */
router.get('/', VacancyController.getVacancies);

/**
 * Get vacancy by ID
 * GET /api/v1/vacancies/:id
 */
router.get('/:id', VacancyController.getVacancy);

/**
 * Update a vacancy
 * PUT /api/v1/vacancies/:id
 */
router.put('/:id', authMiddleware, requireEmployer, VacancyController.updateVacancy);

/**
 * Delete a vacancy (soft delete)
 * DELETE /api/v1/vacancies/:id
 */
router.delete('/:id', authMiddleware, requireEmployer, VacancyController.deleteVacancy);

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
