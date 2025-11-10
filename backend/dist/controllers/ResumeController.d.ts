/**
 * 360° РАБОТА - Resume Controller
 * Управление резюме соискателей
 */
import { Request, Response } from 'express';
export declare class ResumeController {
    /**
     * Получить все резюме текущего пользователя
     * GET /api/v1/resumes/my
     */
    static getMyResumes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить видео-резюме текущего пользователя
     * GET /api/v1/resumes/video/my
     */
    static getMyResumeVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Создать новое резюме
     * POST /api/v1/resumes
     */
    static createResume(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить резюме по ID
     * GET /api/v1/resumes/:id
     */
    static getResume(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обновить резюме
     * PUT /api/v1/resumes/:id
     */
    static updateResume(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удалить резюме
     * DELETE /api/v1/resumes/:id
     */
    static deleteResume(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=ResumeController.d.ts.map