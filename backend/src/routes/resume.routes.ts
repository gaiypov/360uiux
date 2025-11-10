/**
 * 360° РАБОТА - Resume Routes
 */

import { Router } from 'express';
import { authMiddleware, requireJobSeeker } from '../middleware/auth';
import { ResumeController } from '../controllers/ResumeController';

const router = Router();

/**
 * Получить все мои резюме
 * GET /api/v1/resumes/my
 */
router.get('/my', authMiddleware, requireJobSeeker, ResumeController.getMyResumes);

/**
 * Получить моё видео-резюме
 * GET /api/v1/resumes/video/my
 */
router.get('/video/my', authMiddleware, requireJobSeeker, ResumeController.getMyResumeVideo);

/**
 * Создать резюме
 * POST /api/v1/resumes
 */
router.post('/', authMiddleware, requireJobSeeker, ResumeController.createResume);

/**
 * Получить резюме по ID
 * GET /api/v1/resumes/:id
 */
router.get('/:id', authMiddleware, requireJobSeeker, ResumeController.getResume);

/**
 * Обновить резюме
 * PUT /api/v1/resumes/:id
 */
router.put('/:id', authMiddleware, requireJobSeeker, ResumeController.updateResume);

/**
 * Удалить резюме
 * DELETE /api/v1/resumes/:id
 */
router.delete('/:id', authMiddleware, requireJobSeeker, ResumeController.deleteResume);

export default router;
