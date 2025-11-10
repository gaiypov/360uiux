/**
 * 360° РАБОТА - Yandex Cloud Video Provider
 * https://cloud.yandex.ru/services/cloud-video
 */
import { IVideoProvider } from './VideoService';
export declare class YandexVideoProvider implements IVideoProvider {
    private s3;
    private bucket;
    private yandexApiUrl;
    constructor();
    /**
     * Загрузить видео в Yandex Cloud
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
        duration: number | undefined;
    }>;
    /**
     * Запустить транскодинг через Yandex Video API
     */
    private startTranscoding;
    /**
     * Дождаться завершения транскодинга
     */
    private waitForTranscoding;
    /**
     * Получить статус транскодинга
     */
    private getJobStatus;
    /**
     * Удалить видео из Yandex Cloud
     */
    deleteVideo(videoId: string): Promise<void>;
    /**
     * Получить статистику (Yandex Cloud Video не предоставляет встроенную аналитику)
     */
    getVideoStats(_videoId: string): Promise<{
        views: number;
        duration: number;
        completion: number;
    }>;
    /**
     * Получить информацию о видео
     */
    getVideoInfo(videoId: string): Promise<{
        videoId: string;
        title: string;
        status: string;
        playerUrl: string;
        thumbnailUrl: string;
    }>;
}
//# sourceMappingURL=YandexVideoProvider.d.ts.map