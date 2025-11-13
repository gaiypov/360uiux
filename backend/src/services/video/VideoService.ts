/**
 * 360° РАБОТА - Video Service Abstraction
 * Единый интерфейс для всех видео-провайдеров
 */

import { videoConfig, validateVideoConfig } from '../../config/video.config';
import { ApiVideoProvider } from './ApiVideoProvider';
import { YandexVideoProvider } from './YandexVideoProvider';

// Интерфейс провайдера
export interface IVideoProvider {
  /**
   * Загрузить видео
   *
   * Returns:
   * - status: 'ready' (blocking, transcoding complete) or 'processing' (non-blocking, webhook callback)
   * - videoId: Unique video identifier
   * - playerUrl: URL for video player (may be placeholder if processing)
   * - hlsUrl: HLS playlist URL (may be placeholder if processing)
   * - thumbnailUrl: Thumbnail URL (may be placeholder if processing)
   * - duration: Video duration in seconds (only if ready)
   */
  uploadVideo(params: {
    file: Buffer;
    fileName: string;
    metadata: {
      type: 'vacancy' | 'resume';
      userId: string;
      title: string;
      description?: string;
    };
  }): Promise<{
    videoId: string;
    playerUrl: string;
    hlsUrl: string;
    thumbnailUrl: string;
    duration?: number;
    status?: 'ready' | 'processing' | 'failed'; // NEW: Video transcoding status
  }>;

  /**
   * Удалить видео
   */
  deleteVideo(videoId: string): Promise<void>;

  /**
   * Получить статистику (опционально)
   */
  getVideoStats?(videoId: string): Promise<{
    views: number;
    duration: number;
    completion: number;
  }>;

  /**
   * Получить информацию о видео
   */
  getVideoInfo?(videoId: string): Promise<{
    videoId: string;
    title: string;
    status: string;
    playerUrl: string;
    thumbnailUrl: string;
  }>;
}

/**
 * Фабрика видео-провайдеров
 * Выбирает провайдера из конфигурации и предоставляет единый интерфейс
 */
export class VideoService implements IVideoProvider {
  private provider: IVideoProvider;
  private static instance: VideoService;

  private constructor() {
    // Валидировать конфигурацию
    validateVideoConfig();

    // Выбрать провайдера
    const providerType = videoConfig.provider;

    switch (providerType) {
      case 'api.video':
        this.provider = new ApiVideoProvider();
        break;
      case 'yandex':
        this.provider = new YandexVideoProvider();
        break;
      default:
        throw new Error(`Unknown video provider: ${providerType}`);
    }

    console.log(`✅ Video service initialized with provider: ${providerType}`);
  }

  /**
   * Singleton pattern - один экземпляр на всё приложение
   */
  public static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  /**
   * Загрузить видео (прокси к провайдеру)
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
    console.log(`📹 Uploading video: ${params.fileName} (${params.metadata.type})`);
    const result = await this.provider.uploadVideo(params);
    console.log(`✅ Video uploaded: ${result.videoId}`);
    return result;
  }

  /**
   * Удалить видео (прокси к провайдеру)
   */
  async deleteVideo(videoId: string) {
    console.log(`🗑️  Deleting video: ${videoId}`);
    await this.provider.deleteVideo(videoId);
    console.log(`✅ Video deleted: ${videoId}`);
  }

  /**
   * Получить статистику (прокси к провайдеру)
   */
  async getVideoStats(videoId: string) {
    if (this.provider.getVideoStats) {
      return await this.provider.getVideoStats(videoId);
    }
    // Дефолтные значения если провайдер не поддерживает статистику
    return { views: 0, duration: 0, completion: 0 };
  }

  /**
   * Получить информацию о видео (прокси к провайдеру)
   */
  async getVideoInfo(videoId: string) {
    if (this.provider.getVideoInfo) {
      return await this.provider.getVideoInfo(videoId);
    }
    throw new Error('getVideoInfo is not supported by current provider');
  }

  /**
   * Получить текущего провайдера (для отладки)
   */
  getProviderType(): string {
    return videoConfig.provider;
  }
}

// Экспорт singleton instance
export const videoService = VideoService.getInstance();
