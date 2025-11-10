"use strict";
/**
 * 360° РАБОТА - Vacancy Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const VacancyController_1 = require("../controllers/VacancyController");
// import { VacancyInteractionsController } from '../controllers/VacancyInteractionsController'; // Temporarily disabled - uses Prisma
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
// TEMPORARILY DISABLED - VacancyInteractionsController uses Prisma
// ===================================
// /**
//  * Like a vacancy
//  * POST /api/v1/vacancies/:id/like
//  */
// router.post('/:id/like', authMiddleware, VacancyInteractionsController.likeVacancy);
// /**
//  * Unlike a vacancy
//  * DELETE /api/v1/vacancies/:id/like
//  */
// router.delete('/:id/like', authMiddleware, VacancyInteractionsController.unlikeVacancy);
// /**
//  * Favorite a vacancy
//  * POST /api/v1/vacancies/:id/favorite
//  */
// router.post('/:id/favorite', authMiddleware, VacancyInteractionsController.favoriteVacancy);
// /**
//  * Unfavorite a vacancy
//  * DELETE /api/v1/vacancies/:id/favorite
//  */
// router.delete('/:id/favorite', authMiddleware, VacancyInteractionsController.unfavoriteVacancy);
// /**
//  * Add a comment to a vacancy
//  * POST /api/v1/vacancies/:id/comments
//  */
// router.post('/:id/comments', authMiddleware, VacancyInteractionsController.addComment);
// /**
//  * Get comments for a vacancy
//  * GET /api/v1/vacancies/:id/comments
//  */
// router.get('/:id/comments', VacancyInteractionsController.getComments);
// /**
//  * Get user's favorite vacancies
//  * GET /api/v1/favorites
//  */
// router.get('/user/favorites', authMiddleware, VacancyInteractionsController.getFavorites);
exports.default = router;
//# sourceMappingURL=vacancy.routes.js.map