/**
 * 360° РАБОТА - Video Service Abstraction
 * Единый интерфейс для всех видео-провайдеров
 */
export interface IVideoProvider {
    /**
     * Загрузить видео
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
export declare class VideoService implements IVideoProvider {
    private provider;
    private static instance;
    private constructor();
    /**
     * Singleton pattern - один экземпляр на всё приложение
     */
    static getInstance(): VideoService;
    /**
     * Загрузить видео (прокси к провайдеру)
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
    }>;
    /**
     * Удалить видео (прокси к провайдеру)
     */
    deleteVideo(videoId: string): Promise<void>;
    /**
     * Получить статистику (прокси к провайдеру)
     */
    getVideoStats(videoId: string): Promise<{
        views: number;
        duration: number;
        completion: number;
    }>;
    /**
     * Получить информацию о видео (прокси к провайдеру)
     */
    getVideoInfo(videoId: string): Promise<{
        videoId: string;
        title: string;
        status: string;
        playerUrl: string;
        thumbnailUrl: string;
    }>;
    /**
     * Получить текущего провайдера (для отладки)
     */
    getProviderType(): string;
}
export declare const videoService: VideoService;
//# sourceMappingURL=VideoService.d.ts.map