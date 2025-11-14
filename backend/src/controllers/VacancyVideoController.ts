/**
 * 360° РАБОТА - Vacancy Video Controller
 * Управление видео для вакансий (только работодатели)
 */

import { Request, Response } from 'express';
import { videoService } from '../services/video/VideoService';
import { db } from '../config/database';
import { Video, VideoStatus } from '../types';

export class VacancyVideoController {
  /**
   * ПРИВАТНЫЙ: Бизнес-логика удаления видео (без HTTP response)
   */
  private static async _deleteVideoLogic(
    vacancyId: string,
    userId: string,
    role: string
  ): Promise<void> {
    if (role !== 'employer') {
      throw new Error('FORBIDDEN: Only employers can delete vacancy videos');
    }

    const vacancy = await db.oneOrNone(
      'SELECT * FROM vacancies WHERE id = $1 AND employer_id = $2',
      [vacancyId, userId]
    );

    if (!vacancy) {
      throw new Error('NOT_FOUND: Vacancy not found or access denied');
    }

    const video = await db.oneOrNone<Video>(
      'SELECT * FROM videos WHERE vacancy_id = $1 AND type = $2',
      [vacancyId, 'vacancy']
    );

    if (!video) {
      throw new Error('NOT_FOUND: Video not found');
    }

    console.log(`🗑️  Deleting vacancy video: ${video.id}`);

    await videoService.deleteVideo(video.video_id);
    await db.none('DELETE FROM videos WHERE id = $1', [video.id]);
    await db.none(
      'UPDATE vacancies SET video_url = NULL, thumbnail_url = NULL, updated_at = NOW() WHERE id = $1',
      [vacancyId]
    );

    console.log(`✅ Vacancy video deleted: ${video.id}`);
  }

  /**
   * ПРИВАТНЫЙ: Бизнес-логика загрузки видео (без HTTP response)
   */
  private static async _uploadVideoLogic(
    vacancyId: string,
    userId: string,
    role: string,
    file: Express.Multer.File,
    title?: string,
    description?: string
  ): Promise<Video> {
    if (role !== 'employer') {
      throw new Error('FORBIDDEN: Only employers can upload vacancy videos');
    }

    const vacancy = await db.oneOrNone(
      'SELECT * FROM vacancies WHERE id = $1 AND employer_id = $2',
      [vacancyId, userId]
    );

    if (!vacancy) {
      throw new Error('NOT_FOUND: Vacancy not found or access denied');
    }

    console.log(`📹 Uploading vacancy video for vacancy ${vacancyId}...`);

    const uploadResult = await videoService.uploadVideo({
      file: file.buffer,
      fileName: file.originalname,
      metadata: {
        type: 'vacancy',
        userId,
        title: title || vacancy.title,
        description: description || `Видео вакансии: ${vacancy.title}`,
      },
    });

    const videoStatus = uploadResult.status || 'ready';

    const video = await db.one<Video>(
      `INSERT INTO videos (
        video_id, type, user_id, vacancy_id, title, description,
        player_url, hls_url, thumbnail_url, duration,
        status, views, provider, created_at, updated_at
      )
      VALUES ($1, 'vacancy', $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, $11, NOW(), NOW())
      RETURNING *`,
      [
        uploadResult.videoId,
        userId,
        vacancyId,
        title || vacancy.title,
        description,
        uploadResult.playerUrl,
        uploadResult.hlsUrl,
        uploadResult.thumbnailUrl,
        uploadResult.duration,
        videoStatus,
        videoService.getProviderType(),
      ]
    );

    if (videoStatus === 'ready') {
      await db.none(
        'UPDATE vacancies SET video_url = $1, thumbnail_url = $2, updated_at = NOW() WHERE id = $3',
        [uploadResult.playerUrl, uploadResult.thumbnailUrl, vacancyId]
      );
    } else {
      console.log(
        `⏳ Video ${video.id} is processing, vacancy will be updated via webhook`
      );
    }

    console.log(`✅ Vacancy video uploaded successfully: ${video.id}`);
    return video;
  }

  /**
   * Загрузить видео для вакансии
   * POST /api/v1/vacancies/:vacancyId/video
   */
  static async uploadVideo(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;
      const { title, description } = req.body;
      const userId = req.user!.userId;
      const role = req.user!.role;

      if (!req.file) {
        return res.status(400).json({
          error: 'Video file is required',
        });
      }

      const video = await VacancyVideoController._uploadVideoLogic(
        vacancyId,
        userId,
        role,
        req.file,
        title,
        description
      );

      return res.status(201).json({
        success: true,
        video,
      });
    } catch (error: any) {
      console.error('Upload vacancy video error:', error);

      const statusCode = error.message.startsWith('NOT_FOUND:') ? 404 :
                         error.message.startsWith('FORBIDDEN:') ? 403 : 500;

      return res.status(statusCode).json({
        error: 'Failed to upload video',
        message: error.message.replace(/^(NOT_FOUND|FORBIDDEN|INTERNAL):\s*/, ''),
      });
    }
  }

  /**
   * Получить видео вакансии
   * GET /api/v1/vacancies/:vacancyId/video
   */
  static async getVideo(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;

      const video = await db.oneOrNone<Video>(
        'SELECT * FROM videos WHERE vacancy_id = $1 AND type = $2',
        [vacancyId, 'vacancy']
      );

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Инкрементировать счетчик просмотров
      await db.none('UPDATE videos SET views = views + 1 WHERE id = $1', [video.id]);

      return res.json({ video });
    } catch (error: any) {
      console.error('Get vacancy video error:', error);
      return res.status(500).json({ error: 'Failed to get video' });
    }
  }

  /**
   * Удалить видео вакансии
   * DELETE /api/v1/vacancies/:vacancyId/video
   */
  static async deleteVideo(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;
      const userId = req.user!.userId;
      const role = req.user!.role;

      await VacancyVideoController._deleteVideoLogic(vacancyId, userId, role);

      return res.json({
        success: true,
        message: 'Video deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete vacancy video error:', error);

      const statusCode = error.message.startsWith('NOT_FOUND:') ? 404 :
                         error.message.startsWith('FORBIDDEN:') ? 403 : 500;

      return res.status(statusCode).json({
        error: 'Failed to delete video',
        message: error.message.replace(/^(NOT_FOUND|FORBIDDEN|INTERNAL):\s*/, ''),
      });
    }
  }

  /**
   * Получить статистику видео
   * GET /api/v1/vacancies/:vacancyId/video/stats
   */
  static async getVideoStats(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;
      const userId = req.user!.userId;

      // Проверка владения вакансией
      const vacancy = await db.oneOrNone(
        'SELECT * FROM vacancies WHERE id = $1 AND employer_id = $2',
        [vacancyId, userId]
      );

      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy not found or access denied' });
      }

      // Найти видео
      const video = await db.oneOrNone<Video>(
        'SELECT * FROM videos WHERE vacancy_id = $1 AND type = $2',
        [vacancyId, 'vacancy']
      );

      if (!video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Получить статистику от провайдера
      const providerStats = await videoService.getVideoStats(video.video_id);

      return res.json({
        videoId: video.id,
        views: video.views, // Наши просмотры из БД
        providerViews: providerStats.views, // Просмотры от провайдера
        duration: video.duration || providerStats.duration,
        completion: providerStats.completion,
        createdAt: video.created_at,
      });
    } catch (error: any) {
      console.error('Get video stats error:', error);
      return res.status(500).json({ error: 'Failed to get video stats' });
    }
  }

  /**
   * Заменить видео вакансии
   * PUT /api/v1/vacancies/:vacancyId/video
   */
  static async replaceVideo(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;
      const { title, description } = req.body;
      const userId = req.user!.userId;
      const role = req.user!.role;

      if (!req.file) {
        return res.status(400).json({
          error: 'Video file is required',
        });
      }

      // 1. Пытаемся удалить старое видео (если есть)
      try {
        await VacancyVideoController._deleteVideoLogic(vacancyId, userId, role);
      } catch (error: any) {
        if (!error.message.startsWith('NOT_FOUND: Video')) {
          throw error;
        }
        console.log('⚠️  No existing video to delete, proceeding with upload');
      }

      // 2. Загружаем новое
      const newVideo = await VacancyVideoController._uploadVideoLogic(
        vacancyId,
        userId,
        role,
        req.file,
        title,
        description
      );

      // 3. Один финальный ответ
      return res.status(201).json({
        success: true,
        message: 'Video replaced successfully',
        video: newVideo,
      });
    } catch (error: any) {
      console.error('Replace vacancy video error:', error);

      const statusCode = error.message.startsWith('NOT_FOUND:') ? 404 :
                         error.message.startsWith('FORBIDDEN:') ? 403 : 500;

      return res.status(statusCode).json({
        error: 'Failed to replace video',
        message: error.message.replace(/^(NOT_FOUND|FORBIDDEN|INTERNAL):\s*/, ''),
      });
    }
  }
}
