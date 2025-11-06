/**
 * 360° РАБОТА - Video Routes
 * Роуты для работы с видео (вакансии и резюме)
 */

import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, requireEmployer } from '../middleware/auth';
import { VacancyVideoController } from '../controllers/VacancyVideoController';
import { ResumeVideoController } from '../controllers/ResumeVideoController';

const router = Router();

// Настройка multer для загрузки видео в память
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Проверка типа файла
    const allowedMimeTypes = [
      'video/mp4',
      'video/quicktime', // MOV
      'video/x-msvideo', // AVI
      'video/webm',
      'video/x-matroska', // MKV
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video files are allowed.'));
    }
  },
});

// ===================================
// VACANCY VIDEO ROUTES (Работодатели)
// ===================================

/**
 * @route   POST /api/v1/vacancies/:vacancyId/video
 * @desc    Загрузить видео для вакансии
 * @access  Private (Employer only)
 */
router.post(
  '/vacancies/:vacancyId/video',
  authMiddleware,
  requireEmployer,
  upload.single('video'),
  VacancyVideoController.uploadVideo
);

/**
 * @route   GET /api/v1/vacancies/:vacancyId/video
 * @desc    Получить видео вакансии
 * @access  Public
 */
router.get('/vacancies/:vacancyId/video', VacancyVideoController.getVideo);

/**
 * @route   DELETE /api/v1/vacancies/:vacancyId/video
 * @desc    Удалить видео вакансии
 * @access  Private (Employer only, owner)
 */
router.delete(
  '/vacancies/:vacancyId/video',
  authMiddleware,
  requireEmployer,
  VacancyVideoController.deleteVideo
);

/**
 * @route   PUT /api/v1/vacancies/:vacancyId/video
 * @desc    Заменить видео вакансии
 * @access  Private (Employer only, owner)
 */
router.put(
  '/vacancies/:vacancyId/video',
  authMiddleware,
  requireEmployer,
  upload.single('video'),
  VacancyVideoController.replaceVideo
);

/**
 * @route   GET /api/v1/vacancies/:vacancyId/video/stats
 * @desc    Получить статистику видео вакансии
 * @access  Private (Employer only, owner)
 */
router.get(
  '/vacancies/:vacancyId/video/stats',
  authMiddleware,
  requireEmployer,
  VacancyVideoController.getVideoStats
);

// ===================================
// RESUME VIDEO ROUTES (Соискатели)
// ===================================

/**
 * @route   POST /api/v1/resumes/video
 * @desc    Загрузить видеорезюме
 * @access  Private (Job Seeker only)
 */
router.post(
  '/resumes/video',
  authMiddleware,
  upload.single('video'),
  ResumeVideoController.uploadVideo
);

/**
 * @route   GET /api/v1/resumes/video/me
 * @desc    Получить своё видеорезюме
 * @access  Private (Job Seeker only)
 */
router.get('/resumes/video/me', authMiddleware, ResumeVideoController.getMyVideo);

/**
 * @route   GET /api/v1/resumes/video/stats
 * @desc    Получить статистику своего видеорезюме
 * @access  Private (Job Seeker only)
 */
router.get('/resumes/video/stats', authMiddleware, ResumeVideoController.getVideoStats);

/**
 * @route   GET /api/v1/resumes/video/:userId
 * @desc    Получить видеорезюме соискателя
 * @access  Private (Employer only or owner)
 */
router.get('/resumes/video/:userId', authMiddleware, ResumeVideoController.getUserVideo);

/**
 * @route   DELETE /api/v1/resumes/video
 * @desc    Удалить своё видеорезюме
 * @access  Private (Job Seeker only)
 */
router.delete('/resumes/video', authMiddleware, ResumeVideoController.deleteVideo);

/**
 * @route   PATCH /api/v1/resumes/video
 * @desc    Обновить метаданные видеорезюме
 * @access  Private (Job Seeker only)
 */
router.patch('/resumes/video', authMiddleware, ResumeVideoController.updateVideoMetadata);

// Обработка ошибок multer
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Video file size must not exceed 500MB',
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      error: 'Bad request',
      message: error.message,
    });
  }

  next();
});

export default router;
