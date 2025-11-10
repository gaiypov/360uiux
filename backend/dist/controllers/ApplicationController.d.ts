/**
 * 360° РАБОТА - Application Controller
 * Architecture v3: Отклики с приватными видео-резюме
 */
import { Request, Response } from 'express';
export declare class ApplicationController {
    /**
     * Создать отклик на вакансию
     * POST /api/applications
     * Body: { vacancyId, resumeId?, message?, attachResumeVideo: boolean }
     */
    static createApplication(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить мои отклики (для соискателя)
     * GET /api/applications/my
     */
    static getMyApplications(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить отклики на вакансию (для работодателя)
     * GET /api/applications/vacancy/:vacancyId
     */
    static getVacancyApplications(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обновить статус отклика (для работодателя)
     * PUT /api/applications/:id/status
     * Body: { employerStatus: 'viewed' | 'interview' | 'rejected' | 'accepted', notes? }
     */
    static updateStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить детали отклика
     * GET /api/applications/:id
     */
    static getApplication(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удалить отклик (только соискатель может удалить свой отклик)
     * DELETE /api/applications/:id
     */
    static deleteApplication(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=ApplicationController.d.ts.map