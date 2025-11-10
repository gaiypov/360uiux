/**
 * 360° РАБОТА - User Controller
 * Контроллер для управления профилями пользователей
 */
import { Request, Response } from 'express';
export declare class UserController {
    /**
     * Получить профиль текущего пользователя
     * GET /api/v1/users/me
     */
    static getMyProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить профиль пользователя по ID
     * GET /api/v1/users/:id
     */
    static getUserProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обновить профиль
     * PUT /api/v1/users/profile
     */
    static updateProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Загрузить аватар
     * POST /api/v1/users/avatar
     */
    static uploadAvatar(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить статистику пользователя
     * GET /api/v1/users/me/stats
     */
    static getMyStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удалить аккаунт
     * DELETE /api/v1/users/me
     * Body: { sms_code } - обязательная проверка SMS
     */
    static deleteAccount(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=UserController.d.ts.map