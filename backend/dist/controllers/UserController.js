"use strict";
/**
 * 360° РАБОТА - User Controller
 * Контроллер для управления профилями пользователей
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const DatabaseService_1 = require("../services/database/DatabaseService");
const CacheService_1 = require("../services/CacheService");
class UserController {
    /**
     * Получить профиль текущего пользователя
     * GET /api/v1/users/me
     */
    static async getMyProfile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
            }
            // Попытка получить из кэша
            const cached = await CacheService_1.cacheService.getUserProfile(user.userId);
            if (cached) {
                console.log(`🚀 User profile ${user.userId} served from cache`);
                const { refresh_token, ...safeProfile } = cached;
                return res.status(200).json({
                    success: true,
                    user: safeProfile,
                });
            }
            const profile = await DatabaseService_1.db.oneOrNone('SELECT * FROM users WHERE id = $1', [user.userId]);
            if (!profile) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found',
                });
            }
            // Сохранить в кэш на 30 минут
            await CacheService_1.cacheService.cacheUserProfile(user.userId, profile);
            // Удаляем чувствительные данные
            const { refresh_token, ...safeProfile } = profile;
            return res.status(200).json({
                success: true,
                user: safeProfile,
            });
        }
        catch (error) {
            console.error('❌ Error getting my profile:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch profile',
            });
        }
    }
    /**
     * Получить профиль пользователя по ID
     * GET /api/v1/users/:id
     */
    static async getUserProfile(req, res) {
        try {
            const { id } = req.params;
            // Попытка получить из кэша
            const cached = await CacheService_1.cacheService.getUserProfile(id);
            if (cached) {
                console.log(`🚀 User profile ${id} served from cache`);
                const { refresh_token, phone, email, ...publicProfile } = cached;
                // Если это работодатель, показываем email (публичный для связи)
                if (cached.role === 'employer') {
                    publicProfile.email = email;
                }
                return res.status(200).json({
                    success: true,
                    user: publicProfile,
                });
            }
            const user = await DatabaseService_1.db.oneOrNone('SELECT * FROM users WHERE id = $1', [id]);
            if (!user) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found',
                });
            }
            // Сохранить в кэш на 30 минут
            await CacheService_1.cacheService.cacheUserProfile(id, user);
            // Удаляем чувствительные данные
            const { refresh_token, phone, email, ...publicProfile } = user;
            // Если это работодатель, показываем email (публичный для связи)
            if (user.role === 'employer') {
                publicProfile.email = email;
            }
            return res.status(200).json({
                success: true,
                user: publicProfile,
            });
        }
        catch (error) {
            console.error('❌ Error getting user profile:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch profile',
            });
        }
    }
    /**
     * Обновить профиль
     * PUT /api/v1/users/profile
     */
    static async updateProfile(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
            }
            const { name, avatar_url, profession, city, salary_expected, company_name, inn, kpp, legal_address, actual_address, } = req.body;
            // Обновление в зависимости от роли
            let updated;
            if (user.role === 'jobseeker') {
                updated = await DatabaseService_1.db.one(`UPDATE users SET
            name = COALESCE($2, name),
            avatar_url = COALESCE($3, avatar_url),
            profession = COALESCE($4, profession),
            city = COALESCE($5, city),
            salary_expected = COALESCE($6, salary_expected),
            updated_at = NOW()
          WHERE id = $1
          RETURNING *`, [user.userId, name, avatar_url, profession, city, salary_expected]);
            }
            else if (user.role === 'employer') {
                updated = await DatabaseService_1.db.one(`UPDATE users SET
            company_name = COALESCE($2, company_name),
            inn = COALESCE($3, inn),
            kpp = COALESCE($4, kpp),
            legal_address = COALESCE($5, legal_address),
            actual_address = COALESCE($6, actual_address),
            avatar_url = COALESCE($7, avatar_url),
            updated_at = NOW()
          WHERE id = $1
          RETURNING *`, [user.userId, company_name, inn, kpp, legal_address, actual_address, avatar_url]);
            }
            else {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Invalid user role',
                });
            }
            // Удаляем чувствительные данные
            const { refresh_token, ...safeProfile } = updated;
            console.log(`✅ Profile updated: ${user.userId}`);
            // Инвалидация кэша профиля
            await CacheService_1.cacheService.invalidateUserProfile(user.userId);
            return res.status(200).json({
                success: true,
                user: safeProfile,
            });
        }
        catch (error) {
            console.error('❌ Error updating profile:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to update profile',
            });
        }
    }
    /**
     * Загрузить аватар
     * POST /api/v1/users/avatar
     */
    static async uploadAvatar(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
            }
            const { avatar_url } = req.body;
            if (!avatar_url) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'avatar_url is required',
                });
            }
            const updated = await DatabaseService_1.db.one(`UPDATE users SET
          avatar_url = $2,
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`, [user.userId, avatar_url]);
            // Удаляем чувствительные данные
            const { refresh_token, ...safeProfile } = updated;
            console.log(`✅ Avatar uploaded: ${user.userId}`);
            // Инвалидация кэша профиля
            await CacheService_1.cacheService.invalidateUserProfile(user.userId);
            return res.status(200).json({
                success: true,
                user: safeProfile,
            });
        }
        catch (error) {
            console.error('❌ Error uploading avatar:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to upload avatar',
            });
        }
    }
    /**
     * Получить статистику пользователя
     * GET /api/v1/users/me/stats
     */
    static async getMyStats(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
            }
            // Попытка получить из кэша
            const cacheKey = `user:stats:${user.userId}`;
            const cached = await CacheService_1.cacheService.getStats(cacheKey);
            if (cached) {
                console.log(`🚀 User stats ${user.userId} served from cache`);
                return res.status(200).json({
                    success: true,
                    stats: cached,
                });
            }
            let stats = {};
            if (user.role === 'jobseeker') {
                // Статистика для соискателя
                const [applicationsCount, favoritesCount] = await Promise.all([
                    DatabaseService_1.db.oneOrNone('SELECT COUNT(*) as count FROM applications WHERE jobseeker_id = $1', [user.userId]),
                    DatabaseService_1.db.oneOrNone('SELECT COUNT(*) as count FROM favorites WHERE user_id = $1', [user.userId]),
                ]);
                stats = {
                    applications_total: parseInt(applicationsCount?.count || '0', 10),
                    favorites_total: parseInt(favoritesCount?.count || '0', 10),
                };
                // Статистика по статусам откликов
                const applicationsByStatus = await DatabaseService_1.db.manyOrNone(`SELECT status, COUNT(*) as count
           FROM applications
           WHERE jobseeker_id = $1
           GROUP BY status`, [user.userId]);
                stats.applications_by_status = applicationsByStatus.reduce((acc, row) => {
                    acc[row.status] = parseInt(row.count, 10);
                    return acc;
                }, {});
            }
            else if (user.role === 'employer') {
                // Статистика для работодателя
                const [vacanciesCount, applicationsCount, activeVacancies] = await Promise.all([
                    DatabaseService_1.db.oneOrNone('SELECT COUNT(*) as count FROM vacancies WHERE employer_id = $1', [user.userId]),
                    DatabaseService_1.db.oneOrNone(`SELECT COUNT(*) as count FROM applications a
             JOIN vacancies v ON v.id = a.vacancy_id
             WHERE v.employer_id = $1`, [user.userId]),
                    DatabaseService_1.db.oneOrNone('SELECT COUNT(*) as count FROM vacancies WHERE employer_id = $1 AND status = $2', [user.userId, 'active']),
                ]);
                stats = {
                    vacancies_total: parseInt(vacanciesCount?.count || '0', 10),
                    vacancies_active: parseInt(activeVacancies?.count || '0', 10),
                    applications_received: parseInt(applicationsCount?.count || '0', 10),
                };
                // Статистика по вакансиям
                const vacanciesByStatus = await DatabaseService_1.db.manyOrNone(`SELECT status, COUNT(*) as count
           FROM vacancies
           WHERE employer_id = $1
           GROUP BY status`, [user.userId]);
                stats.vacancies_by_status = vacanciesByStatus.reduce((acc, row) => {
                    acc[row.status] = parseInt(row.count, 10);
                    return acc;
                }, {});
            }
            // Сохранить в кэш на 15 минут
            await CacheService_1.cacheService.cacheStats(cacheKey, stats);
            return res.status(200).json({
                success: true,
                stats,
            });
        }
        catch (error) {
            console.error('❌ Error getting stats:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to fetch statistics',
            });
        }
    }
    /**
     * Удалить аккаунт
     * DELETE /api/v1/users/me
     * Body: { sms_code } - обязательная проверка SMS
     */
    static async deleteAccount(req, res) {
        try {
            const user = req.user;
            const { sms_code } = req.body;
            if (!user) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
            }
            // КРИТИЧНО: Проверка SMS кода для подтверждения удаления
            if (!sms_code) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'SMS code is required for account deletion',
                });
            }
            // Получить пользователя с phone
            const fullUser = await DatabaseService_1.db.oneOrNone('SELECT phone FROM users WHERE id = $1', [user.userId]);
            if (!fullUser) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found',
                });
            }
            // Проверить SMS код
            const smsRecord = await DatabaseService_1.db.oneOrNone(`SELECT * FROM sms_codes
         WHERE phone = $1
         AND code = $2
         AND verified = false
         AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`, [fullUser.phone, sms_code]);
            if (!smsRecord) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid or expired SMS code',
                });
            }
            // Отметить SMS код как использованный
            await DatabaseService_1.db.none('UPDATE sms_codes SET verified = true WHERE id = $1', [smsRecord.id]);
            // Мягкое удаление - архивация аккаунта
            await DatabaseService_1.db.none(`UPDATE users SET
          phone = CONCAT('deleted_', id),
          email = NULL,
          refresh_token = NULL,
          updated_at = NOW()
        WHERE id = $1`, [user.userId]);
            console.log(`🗑️ Account deleted: ${user.userId} (verified with SMS)`);
            return res.status(200).json({
                success: true,
                message: 'Account deleted successfully',
            });
        }
        catch (error) {
            console.error('❌ Error deleting account:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to delete account',
            });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map