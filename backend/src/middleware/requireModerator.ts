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
): void => {
  // @ts-ignore - req.user добавляется через JWT middleware
  const user = req.user;

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  const userRole = user.role;

  // Разрешаем доступ модераторам и админам
  if (userRole !== 'moderator' && userRole !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Moderator or admin access required',
    });
    return;
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
): void => {
  // @ts-ignore
  const user = req.user;

  if (!user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
    return;
  }

  next();
};
