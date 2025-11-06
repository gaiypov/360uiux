/**
 * 360° РАБОТА - Upload Routes
 * Роуты для загрузки файлов (голосовые сообщения, изображения)
 */

import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { UploadController } from '../controllers/UploadController';

const router = Router();

// Настройка multer для загрузки файлов в память
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// ===================================
// UPLOAD ROUTES
// ===================================

/**
 * @route   POST /api/v1/uploads/voice
 * @desc    Загрузить голосовое сообщение
 * @access  Private
 */
router.post(
  '/voice',
  authMiddleware,
  upload.single('audio'),
  UploadController.uploadVoice
);

/**
 * @route   POST /api/v1/uploads/image
 * @desc    Загрузить изображение
 * @access  Private
 */
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  UploadController.uploadImage
);

/**
 * @route   DELETE /api/v1/uploads
 * @desc    Удалить файл
 * @access  Private
 */
router.delete('/', authMiddleware, UploadController.deleteFile);

// Обработка ошибок multer
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size must not exceed 10MB',
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
