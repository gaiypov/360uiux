/**
 * 360° РАБОТА - Private Video Service
 * Architecture v3: Приватные видео-резюме с лимитом просмотров
 */
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
export declare class PrivateVideoService {
    /**
     * Загрузить ПРИВАТНОЕ видео-резюме
     * Architecture v3: is_public = false, download_protected = true
     */
    uploadPrivateResumeVideo(params: UploadPrivateResumeVideoParams): Promise<{
        video: any;
        message: string;
    }>;
    /**
     * Проверить лимит просмотров для работодателя
     * SQL функция: check_video_view_limit(video_id, application_id, employer_id)
     */
    checkViewLimit(params: SecureVideoUrlParams): Promise<ViewLimitStatus>;
    /**
     * Генерировать защищённую временную ссылку на видео
     * Architecture v3: 5-минутный токен, увеличение счётчика просмотров
     */
    generateSecureUrl(params: SecureVideoUrlParams): Promise<{
        url: string;
        expires_at: Date;
        views_remaining: number;
        max_views: number;
        video_id: any;
    }>;
    /**
     * Получить статистику просмотров для соискателя
     * Показывает сколько работодателей посмотрели видео
     */
    getResumeVideoStats(videoId: string, userId: string): Promise<{
        video_id: string;
        stats: any;
    }>;
    /**
     * Удалить приватное видео-резюме
     */
    deletePrivateResumeVideo(videoId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Проверить валиден ли токен для просмотра видео
     * TODO: Реализовать с Redis когда он будет доступен
     */
    validateVideoToken(_token: string): Promise<boolean>;
}
export declare const privateVideoService: PrivateVideoService;
export {};
//# sourceMappingURL=PrivateVideoService.d.ts.map