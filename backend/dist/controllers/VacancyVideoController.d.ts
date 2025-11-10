/**
 * 360° РАБОТА - Vacancy Video Controller
 * Управление видео для вакансий (только работодатели)
 */
import { Request, Response } from 'express';
export declare class VacancyVideoController {
    /**
     * Загрузить видео для вакансии
     * POST /api/v1/vacancies/:vacancyId/video
     */
    static uploadVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить видео вакансии
     * GET /api/v1/vacancies/:vacancyId/video
     */
    static getVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удалить видео вакансии
     * DELETE /api/v1/vacancies/:vacancyId/video
     */
    static deleteVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить статистику видео
     * GET /api/v1/vacancies/:vacancyId/video/stats
     */
    static getVideoStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Заменить видео вакансии
     * PUT /api/v1/vacancies/:vacancyId/video
     */
    static replaceVideo(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=VacancyVideoController.d.ts.map