/**
 * 360° РАБОТА - Application Routes
 * Architecture v3: Отклики с приватными видео-резюме и расширенным управлением
 */

import { Router } from 'express';
import { authMiddleware, requireJobSeeker } from '../middleware/auth';
import { ApplicationController } from '../controllers/ApplicationController';

const router = Router();

// ===================================
// APPLICATION ROUTES
// ===================================

/**
 * @route   POST /api/v1/applications
 * @desc    Создать отклик на вакансию
 * @access  Private (Job Seeker only)
 * @body    { vacancyId, resumeId?, message?, attachResumeVideo: boolean }
 */
router.post('/', authMiddleware, requireJobSeeker, ApplicationController.createApplication);

/**
 * @route   GET /api/v1/applications/my
 * @desc    Получить мои отклики (для соискателя)
 * @access  Private (Job Seeker only)
 */
router.get('/my', authMiddleware, ApplicationController.getMyApplications);

/**
 * @route   GET /api/v1/applications/vacancy/:vacancyId
 * @desc    Получить отклики на вакансию (для работодателя)
 * @access  Private (Employer only, owner)
 */
router.get('/vacancy/:vacancyId', authMiddleware, ApplicationController.getVacancyApplications);

/**
 * @route   GET /api/v1/applications/:id
 * @desc    Получить детали отклика
 * @access  Private (Участники отклика)
 */
router.get('/:id', authMiddleware, ApplicationController.getApplication);

/**
 * @route   PUT /api/v1/applications/:id/status
 * @desc    Обновить статус отклика (legacy)
 * @access  Private (Employer only)
 */
router.put('/:id/status', authMiddleware, ApplicationController.updateStatus);

/**
 * @route   DELETE /api/v1/applications/:id
 * @desc    Удалить отклик
 * @access  Private (Job Seeker only, owner)
 */
router.delete('/:id', authMiddleware, ApplicationController.deleteApplication);

// ===================================
// ARCHITECTURE V3: ENHANCED APPLICATION MANAGEMENT
// ===================================

/**
 * @route   GET /api/v1/applications
 * @desc    Получить отклики по статусу (для работодателя)
 * @access  Private (Employer only)
 * @query   status?: 'pending' | 'viewed' | 'interview' | 'rejected' | 'hired' | 'cancelled'
 * Architecture v3: Enhanced with timeline tracking and unread counts
 */
router.get('/', authMiddleware, ApplicationController.getApplicationsByStatus);

/**
 * @route   PATCH /api/v1/applications/:id/status
 * @desc    Обновить статус отклика (расширенный)
 * @access  Private (Employer only)
 * @body    { status: 'pending' | 'viewed' | 'interview' | 'rejected' | 'hired' | 'cancelled', rejectionReason?: string }
 * Architecture v3: With timeline tracking
 */
router.patch('/:id/status', authMiddleware, ApplicationController.updateApplicationStatus);

export default router;
