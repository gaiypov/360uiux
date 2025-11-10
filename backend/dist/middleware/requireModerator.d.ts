/**
 * 360° РАБОТА - Moderator Access Middleware
 * Проверка прав модератора
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Middleware для проверки прав модератора
 * Требует, чтобы пользователь был аутентифицирован (через authMiddleware)
 * и имел роль 'moderator' или 'admin'
 */
export declare const requireModerator: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware для проверки прав администратора
 * Более строгая проверка - только админы
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=requireModerator.d.ts.map