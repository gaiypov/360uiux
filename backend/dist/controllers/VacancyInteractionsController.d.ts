/**
 * 360° РАБОТА - Vacancy Interactions Controller
 * Лайки, избранное, комментарии (Architecture v3)
 */
import { Request, Response } from 'express';
export declare class VacancyInteractionsController {
    /**
     * Лайкнуть вакансию
     * POST /api/v1/vacancies/:id/like
     */
    static likeVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Убрать лайк с вакансии
     * DELETE /api/v1/vacancies/:id/like
     */
    static unlikeVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Добавить в избранное
     * POST /api/v1/vacancies/:id/favorite
     */
    static favoriteVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Убрать из избранного
     * DELETE /api/v1/vacancies/:id/favorite
     */
    static unfavoriteVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить мои лайки
     * GET /api/v1/vacancies/likes/my
     */
    static getMyLikes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить мои избранные
     * GET /api/v1/vacancies/favorites/my
     */
    static getMyFavorites(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Добавить комментарий
     * POST /api/v1/vacancies/:id/comments
     */
    static addComment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить комментарии вакансии
     * GET /api/v1/vacancies/:id/comments
     */
    static getComments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=VacancyInteractionsController.d.ts.map