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

export default router;
