"use strict";
/**
 * 360° РАБОТА - User Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
/**
 * Получить мой профиль
 * GET /api/v1/users/me
 */
router.get('/me', auth_1.authMiddleware, UserController_1.UserController.getMyProfile);
/**
 * Обновить профиль
 * PUT /api/v1/users/profile
 */
router.put('/profile', auth_1.authMiddleware, UserController_1.UserController.updateProfile);
/**
 * Загрузить аватар
 * POST /api/v1/users/avatar
 */
router.post('/avatar', auth_1.authMiddleware, UserController_1.UserController.uploadAvatar);
/**
 * Получить мою статистику
 * GET /api/v1/users/me/stats
 */
router.get('/me/stats', auth_1.authMiddleware, UserController_1.UserController.getMyStats);
/**
 * Удалить аккаунт
 * DELETE /api/v1/users/me
 */
router.delete('/me', auth_1.authMiddleware, UserController_1.UserController.deleteAccount);
/**
 * Получить профиль пользователя по ID
 * GET /api/v1/users/:id
 */
router.get('/:id', UserController_1.UserController.getUserProfile);
exports.default = router;
//# sourceMappingURL=user.routes.js.map