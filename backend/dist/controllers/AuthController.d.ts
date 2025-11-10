/**
 * 360° РАБОТА - Authentication Controller
 */
import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * Отправить SMS код
     * POST /api/v1/auth/send-code
     */
    static sendCode(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Проверить SMS код и войти
     * POST /api/v1/auth/verify-code
     */
    static verifyCode(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Регистрация соискателя
     * POST /api/v1/auth/register/jobseeker
     */
    static registerJobSeeker(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Регистрация работодателя
     * POST /api/v1/auth/register/employer
     */
    static registerEmployer(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обновление access token через refresh token
     * POST /api/v1/auth/refresh
     */
    static refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Выход (logout)
     * POST /api/v1/auth/logout
     */
    static logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить текущего пользователя
     * GET /api/v1/auth/me
     */
    static getCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=AuthController.d.ts.map