/**
 * 360° РАБОТА - Application Routes
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
 * Получить мои отклики
 * GET /api/v1/applications/my
 */
router.get('/my', authMiddleware, ApplicationController.getMyApplications);

/**
 * Получить отклики на вакансию (для работодателя)
 * GET /api/v1/applications/vacancy/:vacancyId
 */
router.get('/vacancy/:vacancyId', authMiddleware, requireEmployer, ApplicationController.getVacancyApplications);

/**
 * Обновить статус отклика (для работодателя)
 * PUT /api/v1/applications/:id/status
 */
router.put('/:id/status', authMiddleware, requireEmployer, ApplicationController.updateStatus);

/**
 * Получить отклик по ID
 * GET /api/v1/applications/:id
 */
router.get('/:id', authMiddleware, ApplicationController.getApplication);

/**
 * Получить защищенный URL для просмотра видео-резюме (для работодателя)
 * POST /api/v1/applications/:id/video-url
 */
router.post('/:id/video-url', authMiddleware, requireEmployer, ApplicationController.getVideoUrl);

/**
 * Удалить отклик
 * DELETE /api/v1/applications/:id
 */
router.delete('/:id', authMiddleware, requireJobSeeker, ApplicationController.deleteApplication);

export default router;
