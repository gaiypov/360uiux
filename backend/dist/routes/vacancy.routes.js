"use strict";
/**
 * 360° РАБОТА - Vacancy Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const VacancyController_1 = require("../controllers/VacancyController");
const VacancyInteractionsController_1 = require("../controllers/VacancyInteractionsController");
const EmployerAnalyticsController_1 = require("../controllers/EmployerAnalyticsController");
const router = (0, express_1.Router)();
/**
 * Создать вакансию
 * POST /api/v1/vacancies
 */
router.post('/', auth_1.authMiddleware, auth_1.requireEmployer, VacancyController_1.VacancyController.createVacancy);
/**
 * Получить мои вакансии (работодатель)
 * GET /api/v1/vacancies/my/list
 */
router.get('/my/list', auth_1.authMiddleware, auth_1.requireEmployer, VacancyController_1.VacancyController.getMyVacancies);
/**
 * Получить аналитику работодателя
 * GET /api/v1/vacancies/my/analytics
 */
router.get('/my/analytics', auth_1.authMiddleware, auth_1.requireEmployer, EmployerAnalyticsController_1.EmployerAnalyticsController.getDashboard);
/**
 * Опубликовать вакансию
 * POST /api/v1/vacancies/:id/publish
 */
router.post('/:id/publish', auth_1.authMiddleware, auth_1.requireEmployer, VacancyController_1.VacancyController.publishVacancy);
/**
 * Продлить вакансию на 7 дней (500₽)
 * POST /api/v1/vacancies/:id/extend
 */
router.post('/:id/extend', auth_1.authMiddleware, auth_1.requireEmployer, VacancyController_1.VacancyController.extendVacancy);
/**
 * Поиск вакансий с фильтрами
 * GET /api/v1/vacancies/search
 */
router.get('/search', VacancyController_1.VacancyController.searchVacancies);
/**
 * Получить список вакансий (каталог для всех)
 * GET /api/v1/vacancies
 */
router.get('/', VacancyController_1.VacancyController.listVacancies);
/**
 * Получить вакансию по ID
 * GET /api/v1/vacancies/:id
 */
router.get('/:id', VacancyController_1.VacancyController.getVacancy);
/**
 * Обновить вакансию
 * PUT /api/v1/vacancies/:id
 */
router.put('/:id', auth_1.authMiddleware, auth_1.requireEmployer, VacancyController_1.VacancyController.updateVacancy);
/**
 * Удалить вакансию (архивировать)
 * DELETE /api/v1/vacancies/:id
 */
router.delete('/:id', auth_1.authMiddleware, auth_1.requireEmployer, VacancyController_1.VacancyController.deleteVacancy);
// ===================================
// VACANCY INTERACTIONS (Architecture v3)
// ===================================
/**
 * Get my likes
 * GET /api/v1/vacancies/likes/my
 */
router.get('/likes/my', auth_1.authMiddleware, VacancyInteractionsController_1.VacancyInteractionsController.getMyLikes);
/**
 * Get my favorites
 * GET /api/v1/vacancies/favorites/my
 */
router.get('/favorites/my', auth_1.authMiddleware, VacancyInteractionsController_1.VacancyInteractionsController.getMyFavorites);
/**
 * Like a vacancy
 * POST /api/v1/vacancies/:id/like
 */
router.post('/:id/like', auth_1.authMiddleware, VacancyInteractionsController_1.VacancyInteractionsController.likeVacancy);
/**
 * Unlike a vacancy
 * DELETE /api/v1/vacancies/:id/like
 */
router.delete('/:id/like', auth_1.authMiddleware, VacancyInteractionsController_1.VacancyInteractionsController.unlikeVacancy);
/**
 * Favorite a vacancy
 * POST /api/v1/vacancies/:id/favorite
 */
router.post('/:id/favorite', auth_1.authMiddleware, VacancyInteractionsController_1.VacancyInteractionsController.favoriteVacancy);
/**
 * Unfavorite a vacancy
 * DELETE /api/v1/vacancies/:id/favorite
 */
router.delete('/:id/favorite', auth_1.authMiddleware, VacancyInteractionsController_1.VacancyInteractionsController.unfavoriteVacancy);
/**
 * Add a comment to a vacancy
 * POST /api/v1/vacancies/:id/comments
 */
router.post('/:id/comments', auth_1.authMiddleware, VacancyInteractionsController_1.VacancyInteractionsController.addComment);
/**
 * Get comments for a vacancy
 * GET /api/v1/vacancies/:id/comments
 */
router.get('/:id/comments', VacancyInteractionsController_1.VacancyInteractionsController.getComments);
exports.default = router;
//# sourceMappingURL=vacancy.routes.js.map