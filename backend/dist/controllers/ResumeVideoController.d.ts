/**
 * 360° РАБОТА - Resume Video Controller
 * Управление видеорезюме (только соискатели)
 */
import { Request, Response } from 'express';
export declare class ResumeVideoController {
    /**
     * Загрузить видеорезюме
     * POST /api/v1/resumes/video
     */
    static uploadVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить своё видеорезюме
     * GET /api/v1/resumes/video/me
     */
    static getMyVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить видеорезюме соискателя (для работодателей)
     * GET /api/v1/resumes/video/:userId
     */
    static getUserVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удалить своё видеорезюме
     * DELETE /api/v1/resumes/video
     */
    static deleteVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить статистику видеорезюме
     * GET /api/v1/resumes/video/stats
     */
    static getVideoStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обновить метаданные видеорезюме
     * PATCH /api/v1/resumes/video
     */
    static updateVideoMetadata(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Проверить лимит просмотров для работодателя
     * GET /api/v1/resumes/video/:videoId/check-view-limit
     * Query: applicationId
     */
    static checkViewLimit(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить защищенный URL для просмотра видео-резюме
     * POST /api/v1/resumes/video/:videoId/secure-url
     * Body: { applicationId }
     */
    static getSecureVideoUrl(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить статистику просмотров видео-резюме для соискателя
     * GET /api/v1/resumes/video/view-stats
     */
    static getResumeViewStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=ResumeVideoController.d.ts.map