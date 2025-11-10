"use strict";
/**
 * 360° РАБОТА - Moderator Access Middleware
 * Проверка прав модератора
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireModerator = void 0;
/**
 * Middleware для проверки прав модератора
 * Требует, чтобы пользователь был аутентифицирован (через authMiddleware)
 * и имел роль 'moderator' или 'admin'
 */
const requireModerator = (req, res, next) => {
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
exports.requireModerator = requireModerator;
/**
 * Middleware для проверки прав администратора
 * Более строгая проверка - только админы
 */
const requireAdmin = (req, res, next) => {
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
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=requireModerator.js.map