/**
 * Admin Routes - Маршруты админ панели
 * Стиль: Revolut ultra
 */

import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все роуты защищены авторизацией
// AdminController проверяет роль MODERATOR внутри

/**
 * Дашборд
 */
router.get('/dashboard', authenticateToken, AdminController.getDashboardStats);

/**
 * Управление пользователями
 */
router.get('/users', authenticateToken, AdminController.getUsers);
router.put('/users/:id', authenticateToken, AdminController.updateUser);
router.delete('/users/:id', authenticateToken, AdminController.deleteUser);

/**
 * Управление вакансиями
 */
router.get('/vacancies', authenticateToken, AdminController.getVacancies);
router.put('/vacancies/:id', authenticateToken, AdminController.updateVacancy);
router.delete('/vacancies/:id', authenticateToken, AdminController.deleteVacancy);

/**
 * Управление жалобами
 */
router.get('/complaints', authenticateToken, AdminController.getComplaints);
router.put('/complaints/:id/process', authenticateToken, AdminController.processComplaint);

/**
 * Системные настройки
 */
router.get('/settings', authenticateToken, AdminController.getSettings);
router.put('/settings', authenticateToken, AdminController.updateSettings);

/**
 * Финансы и транзакции
 */
router.get('/financial-stats', authenticateToken, AdminController.getFinancialStats);
router.get('/transactions', authenticateToken, AdminController.getTransactions);
router.get('/transactions/:id', authenticateToken, AdminController.getTransactionDetails);

/**
 * Управление тарифами
 */
router.get('/pricing', authenticateToken, AdminController.getPricingPlans);
router.post('/pricing', authenticateToken, AdminController.createPricingPlan);
router.put('/pricing/:id', authenticateToken, AdminController.updatePricingPlan);
router.delete('/pricing/:id', authenticateToken, AdminController.deletePricingPlan);

/**
 * Управление счетами
 */
router.get('/invoices', authenticateToken, AdminController.getInvoices);
router.put('/invoices/:id', authenticateToken, AdminController.updateInvoice);

export default router;
