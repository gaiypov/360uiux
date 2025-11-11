/**
 * 360° РАБОТА - Vacancy Controller
 * Контроллер для управления вакансиями
 */
import { Request, Response } from 'express';
export declare class VacancyController {
    /**
     * Создать вакансию
     * POST /api/v1/vacancies
     */
    static createVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить список вакансий (каталог)
     * GET /api/v1/vacancies
     */
    static listVacancies(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить вакансию по ID
     * GET /api/v1/vacancies/:id
     */
    static getVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обновить вакансию
     * PUT /api/v1/vacancies/:id
     */
    static updateVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удалить вакансию
     * DELETE /api/v1/vacancies/:id
     */
    static deleteVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить вакансии работодателя
     * GET /api/v1/vacancies/my/list
     */
    static getMyVacancies(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Опубликовать вакансию
     * POST /api/v1/vacancies/:id/publish
     */
    static publishVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Продлить вакансию на 7 дней
     * POST /api/v1/vacancies/:id/extend
     * Стоимость: 500₽
     */
    static extendVacancy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Полнотекстовый поиск вакансий
     * GET /api/v1/vacancies/search
     */
    static searchVacancies(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=VacancyController.d.ts.map