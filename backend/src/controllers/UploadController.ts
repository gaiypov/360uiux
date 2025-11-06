/**
 * 360° РАБОТА - Upload Controller
 * Загрузка файлов (голосовые сообщения, изображения)
 */

import { Request, Response } from 'express';
import { storageService } from '../services/StorageService';

export class UploadController {
  /**
   * Загрузить голосовое сообщение
   * POST /api/v1/uploads/voice
   */
  static async uploadVoice(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      // Проверка файла
      if (!req.file) {
        return res.status(400).json({ error: 'Voice file is required' });
      }

      console.log(`🎤 Uploading voice message for user ${userId}...`);

      // Валидация типа файла
      const allowedMimeTypes = [
        'audio/mpeg', // MP3
        'audio/mp4', // M4A
        'audio/ogg', // OGG
        'audio/wav', // WAV
        'audio/webm', // WEBM
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only audio files are allowed (MP3, M4A, OGG, WAV, WEBM)',
        });
      }

      // Ограничение размера (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large',
          message: 'Voice message size must not exceed 10MB',
        });
      }

      // Загрузить в хранилище
      const result = await storageService.uploadVoice({
        file: req.file.buffer,
        fileName: req.file.originalname,
        userId,
        mimeType: req.file.mimetype,
      });

      console.log(`✅ Voice message uploaded: ${result.fileId}`);

      return res.status(201).json({
        success: true,
        file: {
          id: result.fileId,
          url: result.url,
          size: result.size,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error: any) {
      console.error('Upload voice error:', error);
      return res.status(500).json({
        error: 'Failed to upload voice message',
        message: error.message,
      });
    }
  }

  /**
   * Загрузить изображение
   * POST /api/v1/uploads/image
   */
  static async uploadImage(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      // Проверка файла
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }

      console.log(`📷 Uploading image for user ${userId}...`);

      // Валидация типа файла
      const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];

      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          message: 'Only image files are allowed (JPEG, PNG, GIF, WEBP)',
        });
      }

      // Ограничение размера (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          error: 'File too large',
          message: 'Image size must not exceed 10MB',
        });
      }

      // Загрузить в хранилище
      const result = await storageService.uploadImage({
        file: req.file.buffer,
        fileName: req.file.originalname,
        userId,
        mimeType: req.file.mimetype,
      });

      console.log(`✅ Image uploaded: ${result.fileId}`);

      return res.status(201).json({
        success: true,
        file: {
          id: result.fileId,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          size: result.size,
          mimeType: req.file.mimetype,
        },
      });
    } catch (error: any) {
      console.error('Upload image error:', error);
      return res.status(500).json({
        error: 'Failed to upload image',
        message: error.message,
      });
    }
  }

  /**
   * Удалить файл
   * DELETE /api/v1/uploads/:fileUrl
   */
  static async deleteFile(req: Request, res: Response) {
    try {
      const { fileUrl } = req.body;

      if (!fileUrl) {
        return res.status(400).json({ error: 'File URL is required' });
      }

      console.log(`🗑️ Deleting file: ${fileUrl}`);

      await storageService.deleteFile(fileUrl);

      console.log(`✅ File deleted successfully`);

      return res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete file error:', error);
      return res.status(500).json({
        error: 'Failed to delete file',
        message: error.message,
      });
    }
  }
}
