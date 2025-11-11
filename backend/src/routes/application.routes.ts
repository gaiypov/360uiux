/**
 * 360° РАБОТА - Application Routes
 * Architecture v3: Оптимизированные роуты для откликов
 */

import { Router } from 'express';
import { authMiddleware, requireJobSeeker, requireEmployer } from '../middleware/auth';
import { ApplicationController } from '../controllers/ApplicationController';

const router = Router();

/**
 * Создать отклик
 * POST /api/v1/applications
 */
router.post('/', authMiddleware, requireJobSeeker, ApplicationController.createApplication);

/**
 * Получить мои отклики (для соискателя)
 * GET /api/v1/applications/my
 */
router.get('/my', authMiddleware, requireJobSeeker, ApplicationController.getMyApplications);

/**
 * Получить статистику откликов (для соискателя)
 * GET /api/v1/applications/stats
 */
router.get('/stats', authMiddleware, requireJobSeeker, ApplicationController.getApplicationStats);

/**
 * Архивировать неактивные чаты (системный эндпоинт)
 * POST /api/v1/applications/archive-inactive
 */
router.post('/archive-inactive', ApplicationController.archiveInactiveChats);

/**
 * Получить отклики на вакансию (для работодателя)
 * GET /api/v1/applications/vacancy/:vacancyId
 */
router.get('/vacancy/:vacancyId', authMiddleware, requireEmployer, ApplicationController.getVacancyApplications);

/**
 * Получить отклик по ID
 * GET /api/v1/applications/:id
 */
router.get('/:id', authMiddleware, ApplicationController.getApplication);

/**
 * Обновить статус отклика (для работодателя)
 * PUT /api/v1/applications/:id/status
 */
router.put('/:id/status', authMiddleware, requireEmployer, ApplicationController.updateStatus);

/**
 * Удалить отклик (для соискателя)
 * DELETE /api/v1/applications/:id
 */
router.delete('/:id', authMiddleware, requireJobSeeker, ApplicationController.deleteApplication);

export default router;
