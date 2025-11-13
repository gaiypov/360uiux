/**
 * 360° РАБОТА - Video Callback Controller
 * Обработка webhook-колбэков от видео-провайдеров
 *
 * Supports:
 * - Yandex Cloud Video API callbacks (transcoding completion)
 * - Future: api.video callbacks, VK Cloud callbacks
 */

import { Request, Response } from 'express';
import { db } from '../config/database';
import { Video } from '../types';

/**
 * Yandex Cloud Callback Payload
 * Структура данных, которую присылает Яндекс после завершения транскодинга
 */
interface YandexCallbackPayload {
  jobId: string; // ID задания транскодинга
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING';
  error?: string;
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    bitrate?: number;
  };
  outputs?: {
    hls?: string; // URL HLS плейлиста
    thumbnail?: string; // URL превью
    dash?: string; // DASH плейлист (опционально)
  };
}

export class VideoCallbackController {
  /**
   * Handle Yandex Cloud webhook callback
   * POST /api/v1/video/yandex-callback
   *
   * Called by Yandex Cloud when video transcoding completes
   */
  static async handleYandexCallback(req: Request, res: Response) {
    try {
      const payload = req.body as YandexCallbackPayload;

      console.log('🔔 Yandex Cloud callback received:', {
        jobId: payload.jobId,
        status: payload.status,
      });

      // Validate payload
      if (!payload.jobId || !payload.status) {
        console.error('❌ Invalid Yandex callback payload:', payload);
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: jobId, status',
        });
      }

      // Find video by job ID (video_id = jobId in our DB)
      const video = await db.oneOrNone<Video>(
        'SELECT * FROM videos WHERE video_id = $1',
        [payload.jobId]
      );

      if (!video) {
        console.warn(`⚠️ Video not found for job ID: ${payload.jobId}`);
        // Still return 200 to Yandex to avoid retries
        return res.status(200).json({
          success: true,
          message: 'Video not found (possibly deleted)',
        });
      }

      // Handle based on status
      switch (payload.status) {
        case 'COMPLETED':
          await VideoCallbackController.handleTranscodingSuccess(video, payload);
          break;

        case 'FAILED':
          await VideoCallbackController.handleTranscodingFailure(video, payload);
          break;

        case 'PROCESSING':
          // Still processing, update progress
          console.log(`⏳ Video ${video.id} still processing...`);
          break;

        default:
          console.warn(`⚠️ Unknown Yandex status: ${payload.status}`);
      }

      // Always return 200 to acknowledge receipt
      return res.status(200).json({
        success: true,
        videoId: video.id,
        status: payload.status,
      });
    } catch (error: any) {
      console.error('❌ Yandex callback processing error:', error);

      // Still return 200 to prevent Yandex from retrying
      return res.status(200).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Handle successful transcoding completion
   */
  private static async handleTranscodingSuccess(
    video: Video,
    payload: YandexCallbackPayload
  ): Promise<void> {
    console.log(`✅ Transcoding completed for video ${video.id}`);

    // Update video with completed data
    const updates: any = {
      status: 'ready',
      updated_at: new Date(),
    };

    // Update HLS URL if provided
    if (payload.outputs?.hls) {
      updates.hls_url = payload.outputs.hls;
      updates.player_url = payload.outputs.hls; // For compatibility
    }

    // Update thumbnail if provided
    if (payload.outputs?.thumbnail) {
      updates.thumbnail_url = payload.outputs.thumbnail;
    }

    // Update duration if provided
    if (payload.metadata?.duration) {
      updates.duration = payload.metadata.duration;
    }

    // Build UPDATE query dynamically
    const updateFields = Object.keys(updates)
      .map((key, idx) => `${key} = $${idx + 2}`)
      .join(', ');
    const updateValues = Object.values(updates);

    await db.none(
      `UPDATE videos SET ${updateFields} WHERE id = $1`,
      [video.id, ...updateValues]
    );

    console.log(`✅ Video ${video.id} updated to 'ready' status`);

    // If this is a vacancy video, update the vacancy
    if (video.type === 'vacancy' && video.vacancy_id) {
      await db.none(
        `UPDATE vacancies
         SET video_url = $1, thumbnail_url = $2, updated_at = NOW()
         WHERE id = $3`,
        [updates.player_url, updates.thumbnail_url, video.vacancy_id]
      );
      console.log(`✅ Vacancy ${video.vacancy_id} updated with video URLs`);
    }

    // TODO: Отправить уведомление пользователю о готовности видео
    // await notificationService.sendVideoReadyNotification(video.user_id, video.id);
  }

  /**
   * Handle transcoding failure
   */
  private static async handleTranscodingFailure(
    video: Video,
    payload: YandexCallbackPayload
  ): Promise<void> {
    console.error(`❌ Transcoding failed for video ${video.id}:`, payload.error);

    // Update video status to failed
    await db.none(
      `UPDATE videos
       SET status = 'failed', updated_at = NOW()
       WHERE id = $1`,
      [video.id]
    );

    // If this is a vacancy video, clear video_url to prevent broken links
    if (video.type === 'vacancy' && video.vacancy_id) {
      await db.none(
        `UPDATE vacancies
         SET video_url = NULL, thumbnail_url = NULL, updated_at = NOW()
         WHERE id = $1`,
        [video.vacancy_id]
      );
      console.log(`⚠️ Vacancy ${video.vacancy_id} video URLs cleared due to failure`);
    }

    // TODO: Отправить уведомление пользователю об ошибке
    // await notificationService.sendVideoFailedNotification(video.user_id, video.id, payload.error);
  }

  /**
   * Get video transcoding status
   * GET /api/v1/video/:videoId/status
   *
   * Allows clients to poll for video status
   */
  static async getVideoStatus(req: Request, res: Response) {
    try {
      const { videoId } = req.params;

      const video = await db.oneOrNone<Video>(
        'SELECT id, video_id, status, player_url, thumbnail_url, duration, created_at, updated_at FROM videos WHERE id = $1',
        [videoId]
      );

      if (!video) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Video not found',
        });
      }

      return res.json({
        videoId: video.id,
        status: video.status,
        playerUrl: video.player_url,
        thumbnailUrl: video.thumbnail_url,
        duration: video.duration,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
      });
    } catch (error: any) {
      console.error('Get video status error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get video status',
      });
    }
  }

  /**
   * Verify Yandex callback signature (security)
   *
   * NOTE: Implement this when Yandex provides signature verification
   * For now, we trust requests to the callback URL
   */
  private static verifyYandexSignature(req: Request): boolean {
    // TODO: Implement signature verification
    // const signature = req.headers['x-yandex-signature'];
    // const payload = JSON.stringify(req.body);
    // const expectedSignature = hmac(payload, SECRET_KEY);
    // return signature === expectedSignature;

    return true; // Skip verification for now
  }
}
