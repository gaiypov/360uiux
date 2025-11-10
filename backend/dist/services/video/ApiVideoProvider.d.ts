/**
 * 360° РАБОТА - api.video Provider
 * https://api.video/
 */
import { IVideoProvider } from './VideoService';
export declare class ApiVideoProvider implements IVideoProvider {
    private client;
    constructor();
    /**
     * Загрузить видео в api.video
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
        duration: number;
    }>;
    /**
     * Удалить видео из api.video
     */
    deleteVideo(videoId: string): Promise<void>;
    /**
     * Получить статистику видео
     */
    getVideoStats(videoId: string): Promise<{
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
//# sourceMappingURL=ApiVideoProvider.d.ts.map