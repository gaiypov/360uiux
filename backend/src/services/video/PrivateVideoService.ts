/**
 * Rework - Private Video Service
 * Architecture v3: Приватные видео-резюме с лимитом просмотров
 */

import { db } from '../../config/database';
import { videoService } from './VideoService';
import crypto from 'crypto';

interface UploadPrivateResumeVideoParams {
  file: Buffer;
  fileName: string;
  userId: string;
  resumeId: string;
  title?: string;
  description?: string;
}

interface SecureVideoUrlParams {
  videoId: string;
  applicationId: string;
  employerId: string;
}

interface ViewLimitStatus {
  can_view: boolean;
  views_left: number;
  total_views: number;
}

export class PrivateVideoService {
  /**
   * Загрузить ПРИВАТНОЕ видео-резюме
   * Architecture v3: is_public = false, download_protected = true
   */
  async uploadPrivateResumeVideo(params: UploadPrivateResumeVideoParams) {
    console.log(`📹 Uploading private resume video for user ${params.userId}...`);

    try {
      // 1. Загрузить видео через VideoService
      const uploadResult = await videoService.uploadVideo({
        file: params.file,
        fileName: params.fileName,
        metadata: {
          type: 'resume',
          userId: params.userId,
          title: params.title || `Resume Video ${params.resumeId}`,
          description: params.description,
        },
      });

      // 2. Сохранить в БД как ПРИВАТНОЕ
      const video = await db.one(
        `INSERT INTO videos (
          video_id, type, user_id, title, description,
          player_url, hls_url, thumbnail_url, duration,
          status, views, provider,
          is_public, download_protected,
          moderation_status, ai_check_passed,
          created_at, updated_at
        )
        VALUES (
          $1, 'resume', $2, $3, $4, $5, $6, $7, $8,
          'approved', 0, $9,
          false, true,
          'approved', true,
          NOW(), NOW()
        )
        RETURNING *`,
        [
          uploadResult.videoId,
          params.userId,
          params.title || `Resume Video ${params.resumeId}`,
          params.description,
          uploadResult.playerUrl,
          uploadResult.hlsUrl,
          uploadResult.thumbnailUrl,
          uploadResult.duration,
          videoService.getProviderType(),
        ]
      );

      // 3. Обновить Resume с video_id
      await db.none(
        `UPDATE resumes
         SET video_id = $1, video_status = 'ready', updated_at = NOW()
         WHERE id = $2`,
        [video.id, params.resumeId]
      );

      console.log(`✅ Private resume video uploaded: ${video.id}`);

      return {
        video,
        message: 'Private resume video uploaded successfully',
      };
    } catch (error: any) {
      console.error('❌ Error uploading private resume video:', error);
      throw error;
    }
  }

  /**
   * Проверить лимит просмотров для работодателя
   * SQL функция: check_video_view_limit(video_id, application_id, employer_id)
   */
  async checkViewLimit(params: SecureVideoUrlParams): Promise<ViewLimitStatus> {
    try {
      const result = await db.oneOrNone<ViewLimitStatus>(
        'SELECT * FROM check_video_view_limit($1, $2, $3)',
        [params.videoId, params.applicationId, params.employerId]
      );

      if (!result) {
        throw new Error('Лимит просмотров не найден');
      }

      return result;
    } catch (error: any) {
      console.error('Error checking view limit:', error);
      throw new Error('Failed to check view limit');
    }
  }

  /**
   * Генерировать защищённую временную ссылку на видео
   * Architecture v3: 5-минутный токен, увеличение счётчика просмотров
   */
  async generateSecureUrl(params: SecureVideoUrlParams) {
    console.log(`🔐 Generating secure URL for video ${params.videoId}...`);

    try {
      // 1. Проверить лимит просмотров
      const viewStatus = await this.checkViewLimit(params);

      if (!viewStatus.can_view) {
        throw new Error('View limit exceeded (max 2 views)');
      }

      // 2. Получить видео
      const video = await db.oneOrNone(
        'SELECT * FROM videos WHERE id = $1 AND type = $2',
        [params.videoId, 'resume']
      );

      if (!video) {
        throw new Error('Resume video not found');
      }

      // Проверить что видео приватное
      if (video.is_public) {
        throw new Error('This is not a private resume video');
      }

      // 3. Увеличить счётчик просмотров (SQL функция)
      const incremented = await db.one<{ increment_video_view: boolean }>(
        'SELECT increment_video_view($1, $2, $3) as increment_video_view',
        [params.videoId, params.applicationId, params.employerId]
      );

      if (!incremented.increment_video_view) {
        console.warn(`⚠️ Failed to increment view count for video ${params.videoId}`);
      }

      // 4. Генерировать временный токен (5 минут)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      const token = crypto.randomBytes(32).toString('hex');

      // TODO: Сохранить токен в Redis с TTL 5 минут
      // await redis.setex(`video_token:${token}`, 300, JSON.stringify({
      //   videoId: params.videoId,
      //   employerId: params.employerId,
      //   applicationId: params.applicationId,
      //   expiresAt
      // }));

      // 5. Создать защищённую ссылку
      // Для api.video можно использовать их private token API
      // Для простоты возвращаем HLS URL с нашим токеном
      const secureUrl = `${video.hls_url}?token=${token}&expires=${expiresAt.getTime()}`;

      console.log(`✅ Secure URL generated, ${viewStatus.views_left - 1} views left`);

      return {
        url: secureUrl,
        expires_at: expiresAt,
        views_remaining: viewStatus.views_left - 1,
        max_views: 2,
        video_id: video.id,
      };
    } catch (error: any) {
      console.error('❌ Error generating secure URL:', error);
      throw error;
    }
  }

  /**
   * Получить статистику просмотров для соискателя
   * Показывает сколько работодателей посмотрели видео
   */
  async getResumeVideoStats(videoId: string, userId: string) {
    try {
      // Проверить что видео принадлежит пользователю
      const video = await db.oneOrNone(
        'SELECT * FROM videos WHERE id = $1 AND user_id = $2 AND type = $3',
        [videoId, userId, 'resume']
      );

      if (!video) {
        throw new Error('Resume video not found or access denied');
      }

      // Получить статистику из view
      const stats = await db.oneOrNone(
        `SELECT
          unique_employers_viewed,
          total_views,
          applications_with_views,
          employers_exhausted_limit,
          last_viewed_at
        FROM resume_video_stats
        WHERE video_id = $1`,
        [videoId]
      );

      return {
        video_id: videoId,
        stats: stats || {
          unique_employers_viewed: 0,
          total_views: 0,
          applications_with_views: 0,
          employers_exhausted_limit: 0,
          last_viewed_at: null,
        },
      };
    } catch (error: any) {
      console.error('Error getting resume video stats:', error);
      throw error;
    }
  }

  /**
   * Удалить приватное видео-резюме
   */
  async deletePrivateResumeVideo(videoId: string, userId: string) {
    try {
      // 1. Получить видео
      const video = await db.oneOrNone(
        'SELECT * FROM videos WHERE id = $1 AND user_id = $2 AND type = $3',
        [videoId, userId, 'resume']
      );

      if (!video) {
        throw new Error('Resume video not found or access denied');
      }

      // 2. Удалить из провайдера (api.video)
      await videoService.deleteVideo(video.video_id);

      // 3. Удалить из БД (cascade удалит view records)
      await db.none('DELETE FROM videos WHERE id = $1', [videoId]);

      // 4. Очистить ссылку в резюме
      await db.none(
        `UPDATE resumes
         SET video_id = NULL, video_status = 'none', updated_at = NOW()
         WHERE video_id = $1`,
        [videoId]
      );

      console.log(`🗑️ Private resume video deleted: ${videoId}`);

      return { success: true, message: 'Resume video deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting private resume video:', error);
      throw error;
    }
  }

  /**
   * Проверить валиден ли токен для просмотра видео
   * TODO: Реализовать с Redis когда он будет доступен
   */
  async validateVideoToken(token: string): Promise<boolean> {
    // TODO: Проверить токен в Redis
    // const data = await redis.get(`video_token:${token}`);
    // if (!data) return false;
    //
    // const { expiresAt } = JSON.parse(data);
    // if (new Date(expiresAt) < new Date()) {
    //   await redis.del(`video_token:${token}`);
    //   return false;
    // }
    //
    // return true;

    // Временная заглушка
    return true;
  }
}

// Singleton export
export const privateVideoService = new PrivateVideoService();
