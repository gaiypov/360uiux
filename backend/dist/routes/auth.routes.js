"use strict";
/**
 * 360° РАБОТА - Authentication Routes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
// ===================================
// PUBLIC ROUTES (No auth required)
// ===================================
/**
 * Отправить SMS код
 * POST /api/v1/auth/send-code
 * Body: { phone: "+79991234567" }
 * 🔴 КРИТИЧНО: Защищено строгим лимитом (1 SMS/минута)
 */
router.post('/send-code', rateLimiter_1.smsLimiter, AuthController_1.AuthController.sendCode);
/**
 * Проверить SMS код
 * POST /api/v1/auth/verify-code
 * Body: { phone: "+79991234567", code: "1234" }
 * 🛡️ Защита от брутфорса кодов
 */
router.post('/verify-code', rateLimiter_1.authLimiter, AuthController_1.AuthController.verifyCode);
/**
 * Регистрация соискателя
 * POST /api/v1/auth/register/jobseeker
 * Body: { phone, name, profession, city }
 */
router.post('/register/jobseeker', AuthController_1.AuthController.registerJobSeeker);
/**
 * Регистрация работодателя
 * POST /api/v1/auth/register/employer
 * Body: { phone, email, company_name, inn, legal_address }
 */
router.post('/register/employer', AuthController_1.AuthController.registerEmployer);
/**
 * Обновить access token
 * POST /api/v1/auth/refresh
 * Body: { refreshToken: "..." }
 */
router.post('/refresh', AuthController_1.AuthController.refreshToken);
// ===================================
// PROTECTED ROUTES (Auth required)
// ===================================
/**
 * Получить текущего пользователя
 * GET /api/v1/auth/me
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', auth_1.authMiddleware, AuthController_1.AuthController.getCurrentUser);
/**
 * Выход
 * POST /api/v1/auth/logout
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', auth_1.authMiddleware, AuthController_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map