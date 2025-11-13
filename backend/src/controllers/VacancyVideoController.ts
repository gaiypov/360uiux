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
   * Загрузить видео для вакансии
   * POST /api/v1/vacancies/:vacancyId/video
   */
  static async uploadVideo(req: Request, res: Response) {
    try {
      const { vacancyId } = req.params;
      const { title, description } = req.body;
      const userId = req.user!.userId;
      const role = req.user!.role;

      // Проверка роли
      if (role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can upload vacancy videos' });
      }

      // Проверка файла
      if (!req.file) {
        return res.status(400).json({ error: 'Video file is required' });
      }

      // Проверка существования вакансии и владения
      const vacancy = await db.oneOrNone(
        'SELECT * FROM vacancies WHERE id = $1 AND employer_id = $2',
        [vacancyId, userId]
      );

      if (!vacancy) {
        return res.status(404).json({ error: 'Vacancy not found or access denied' });
      }

      console.log(`📹 Uploading vacancy video for vacancy ${vacancyId}...`);

      // Загрузить видео через videoService
      const uploadResult = await videoService.uploadVideo({
        file: req.file.buffer,
        fileName: req.file.originalname,
        metadata: {
          type: 'vacancy',
          userId,
          title: title || vacancy.title,
          description: description || `Видео вакансии: ${vacancy.title}`,
        },
      });

      // Determine video status from upload result
      // Optimized providers (Yandex) return status='processing' immediately
      // Legacy providers (api.video) return status='ready' after blocking wait
      const videoStatus = uploadResult.status || 'ready';

      // Сохранить информацию о видео в БД
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
          videoStatus, // Use dynamic status instead of hardcoded 'ready'
          videoService.getProviderType(),
        ]
      );

      // Обновить вакансию с URL видео (only if ready, not if processing)
      if (videoStatus === 'ready') {
        await db.none(
          'UPDATE vacancies SET video_url = $1, thumbnail_url = $2, updated_at = NOW() WHERE id = $3',
          [uploadResult.playerUrl, uploadResult.thumbnailUrl, vacancyId]
        );
      } else {
        console.log(`⏳ Video ${video.id} is processing, vacancy will be updated via webhook`);
      }

      console.log(`✅ Vacancy video uploaded successfully: ${video.id}`);

      return res.status(201).json({
        success: true,
        video,
      });
    } catch (error: any) {
      console.error('Upload vacancy video error:', error);
      return res.status(500).json({
        error: 'Failed to upload video',
        message: error.message,
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

      // Проверка роли
      if (role !== 'employer') {
        return res.status(403).json({ error: 'Only employers can delete vacancy videos' });
      }

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

      console.log(`🗑️  Deleting vacancy video: ${video.id}`);

      // Удалить из провайдера
      await videoService.deleteVideo(video.video_id);

      // Удалить из БД
      await db.none('DELETE FROM videos WHERE id = $1', [video.id]);

      // Очистить поля в вакансии
      await db.none(
        'UPDATE vacancies SET video_url = NULL, thumbnail_url = NULL, updated_at = NOW() WHERE id = $1',
        [vacancyId]
      );

      console.log(`✅ Vacancy video deleted: ${video.id}`);

      return res.json({ success: true, message: 'Video deleted successfully' });
    } catch (error: any) {
      console.error('Delete vacancy video error:', error);
      return res.status(500).json({
        error: 'Failed to delete video',
        message: error.message,
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

      // Сначала удаляем старое видео
      await VacancyVideoController.deleteVideo(req, res);

      // Если удаление прошло успешно, загружаем новое
      if (res.statusCode === 200) {
        await VacancyVideoController.uploadVideo(req, res);
      }
    } catch (error: any) {
      console.error('Replace vacancy video error:', error);
      return res.status(500).json({
        error: 'Failed to replace video',
        message: error.message,
      });
    }
  }
}
