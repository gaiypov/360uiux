/**
 * 360° РАБОТА - Authentication Routes
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ===================================
// PUBLIC ROUTES (No auth required)
// ===================================

/**
 * Отправить SMS код
 * POST /api/v1/auth/send-code
 * Body: { phone: "+79991234567" }
 */
router.post('/send-code', AuthController.sendCode);

/**
 * Проверить SMS код
 * POST /api/v1/auth/verify-code
 * Body: { phone: "+79991234567", code: "1234" }
 */
router.post('/verify-code', AuthController.verifyCode);

/**
 * Регистрация соискателя
 * POST /api/v1/auth/register/jobseeker
 * Body: { phone, name, profession, city }
 */
router.post('/register/jobseeker', AuthController.registerJobSeeker);

/**
 * Регистрация работодателя
 * POST /api/v1/auth/register/employer
 * Body: { phone, email, company_name, inn, legal_address }
 */
router.post('/register/employer', AuthController.registerEmployer);

/**
 * Обновить access token
 * POST /api/v1/auth/refresh
 * Body: { refreshToken: "..." }
 */
router.post('/refresh', AuthController.refreshToken);

// ===================================
// PROTECTED ROUTES (Auth required)
// ===================================

/**
 * Получить текущего пользователя
 * GET /api/v1/auth/me
 * Headers: Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, AuthController.getCurrentUser);

/**
 * Выход
 * POST /api/v1/auth/logout
 * Headers: Authorization: Bearer <token>
 */
router.post('/logout', authMiddleware, AuthController.logout);

export default router;
