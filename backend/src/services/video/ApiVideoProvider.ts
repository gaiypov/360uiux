/**
 * 360° РАБОТА - api.video Provider
 * https://api.video/
 */

import ApiVideoClient from '@api.video/nodejs-client';
import { videoConfig } from '../../config/video.config';
import { IVideoProvider } from './VideoService';

export class ApiVideoProvider implements IVideoProvider {
  private client: ApiVideoClient;

  constructor() {
    if (!videoConfig.apiVideo.apiKey) {
      throw new Error('API_VIDEO_KEY is required for api.video provider');
    }

    this.client = new ApiVideoClient({
      apiKey: videoConfig.apiVideo.apiKey,
    });

    console.log('✅ api.video client initialized');
  }

  /**
   * Загрузить видео в api.video
   */
  async uploadVideo(params: {
    file: Buffer;
    fileName: string;
    metadata: {
      type: 'vacancy' | 'resume';
      userId: string;
      title: string;
      description?: string;
    };
  }) {
    try {
      // Создать видео объект
      const videoCreation = await this.client.videos.create({
        title: params.metadata.title,
        description: params.metadata.description || `${params.metadata.type} - User ${params.metadata.userId}`,
        _public: false, // Приватное видео
        tags: [
          params.metadata.type,
          params.metadata.userId,
          '360rabota',
        ],
        metadata: [
          { key: 'type', value: params.metadata.type },
          { key: 'userId', value: params.metadata.userId },
          { key: 'uploadedAt', value: new Date().toISOString() },
        ],
      });

      console.log(`📹 api.video: Video created with ID ${videoCreation.videoId}`);

      // Загрузить файл
      // Note: api.video SDK принимает Buffer, но TypeScript ожидает string
      // Используем временный файл или преобразуем Buffer в путь
      const fs = require('fs');
      const path = require('path');
      const os = require('os');

      const tempFilePath = path.join(os.tmpdir(), params.fileName);
      fs.writeFileSync(tempFilePath, params.file);

      const uploadResult = await this.client.videos.upload(
        videoCreation.videoId,
        tempFilePath
      );

      // Удаляем временный файл
      fs.unlinkSync(tempFilePath);

      console.log(`✅ api.video: Upload completed for ${videoCreation.videoId}`);

      return {
        videoId: videoCreation.videoId,
        playerUrl: videoCreation.assets?.player || '',
        hlsUrl: videoCreation.assets?.hls || '',
        thumbnailUrl: videoCreation.assets?.thumbnail || '',
        duration: uploadResult.assets?.mp4 ? 0 : 0, // Duration доступен после обработки
      };
    } catch (error: any) {
      console.error('❌ api.video upload error:', error);
      throw new Error(`api.video upload failed: ${error.message}`);
    }
  }

  /**
   * Удалить видео из api.video
   */
  async deleteVideo(videoId: string) {
    try {
      await this.client.videos.delete(videoId);
      console.log(`✅ api.video: Video ${videoId} deleted`);
    } catch (error: any) {
      console.error('❌ api.video delete error:', error);
      throw new Error(`api.video delete failed: ${error.message}`);
    }
  }

  /**
   * Получить статистику видео
   */
  async getVideoStats(videoId: string) {
    try {
      // api.video предоставляет аналитику через отдельный API
      // Video info retrieved but analytics not yet implemented
      await this.client.videos.get(videoId);

      // Базовая информация (детальная аналитика требует Analytics API)
      return {
        views: 0, // api.video требует отдельный Analytics API для просмотров
        duration: 0, // Duration извлекается из assets после обработки
        completion: 0,
      };
    } catch (error: any) {
      console.error('❌ api.video stats error:', error);
      return { views: 0, duration: 0, completion: 0 };
    }
  }

  /**
   * Получить информацию о видео
   */
  async getVideoInfo(videoId: string) {
    try {
      const video = await this.client.videos.get(videoId);

      return {
        videoId: video.videoId,
        title: video.title || '',
        status: (video as any).encoding?.playable ? 'ready' : 'processing',
        playerUrl: video.assets?.player || '',
        thumbnailUrl: video.assets?.thumbnail || '',
      };
    } catch (error: any) {
      console.error('❌ api.video getInfo error:', error);
      throw new Error(`api.video getInfo failed: ${error.message}`);
    }
  }
}
