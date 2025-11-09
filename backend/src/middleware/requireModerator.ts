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
export const requireModerator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore - req.user добавляется через JWT middleware
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  const userRole = user.role;

  // Разрешаем доступ модераторам и админам
  if (userRole !== 'moderator' && userRole !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Moderator or admin access required',
    });
  }

  next();
};

/**
 * Middleware для проверки прав администратора
 * Более строгая проверка - только админы
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
  }

  next();
};
