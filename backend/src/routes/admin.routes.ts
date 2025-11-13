/**
 * Admin Routes - Маршруты админ панели
 * Стиль: Revolut ultra
 */

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authMiddleware, requireModerator } from '../middleware/auth'; // ✅ FIXED: Правильный импорт

const router = Router();

// ✅ FIXED: Все роуты защищены авторизацией + проверка роли moderator
// requireModerator middleware добавлен ко всем роутам для безопасности

/**
 * Дашборд
 */
router.get('/dashboard', authMiddleware, requireModerator, AdminController.getDashboardStats);

/**
 * Управление пользователями
 */
router.get('/users', authMiddleware, requireModerator, AdminController.getUsers);
router.put('/users/:id', authMiddleware, requireModerator, AdminController.updateUser);
router.delete('/users/:id', authMiddleware, requireModerator, AdminController.deleteUser);

/**
 * Управление вакансиями
 */
router.get('/vacancies', authMiddleware, requireModerator, AdminController.getVacancies);
router.put('/vacancies/:id', authMiddleware, requireModerator, AdminController.updateVacancy);
router.delete('/vacancies/:id', authMiddleware, requireModerator, AdminController.deleteVacancy);

/**
 * Управление жалобами
 */
router.get('/complaints', authMiddleware, requireModerator, AdminController.getComplaints);
router.put('/complaints/:id/process', authMiddleware, requireModerator, AdminController.processComplaint);

/**
 * Системные настройки
 */
router.get('/settings', authMiddleware, requireModerator, AdminController.getSettings);
router.put('/settings', authMiddleware, requireModerator, AdminController.updateSettings);

/**
 * Финансы и транзакции
 */
router.get('/financial-stats', authMiddleware, requireModerator, AdminController.getFinancialStats);
router.get('/transactions', authMiddleware, requireModerator, AdminController.getTransactions);
router.get('/transactions/:id', authMiddleware, requireModerator, AdminController.getTransactionDetails);

/**
 * Управление тарифами
 */
router.get('/pricing', authMiddleware, requireModerator, AdminController.getPricingPlans);
router.post('/pricing', authMiddleware, requireModerator, AdminController.createPricingPlan);
router.put('/pricing/:id', authMiddleware, requireModerator, AdminController.updatePricingPlan);
router.delete('/pricing/:id', authMiddleware, requireModerator, AdminController.deletePricingPlan);

/**
 * Управление счетами
 */
router.get('/invoices', authMiddleware, requireModerator, AdminController.getInvoices);
router.put('/invoices/:id', authMiddleware, requireModerator, AdminController.updateInvoice);

export default router;
