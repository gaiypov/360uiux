"use strict";
/**
 * 360° РАБОТА - Resume Controller
 * Управление резюме соискателей
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeController = void 0;
const DatabaseService_1 = require("../services/database/DatabaseService");
class ResumeController {
    /**
     * Получить все резюме текущего пользователя
     * GET /api/v1/resumes/my
     */
    static async getMyResumes(req, res) {
        try {
            const userId = req.user.userId;
            const resumes = await DatabaseService_1.db.manyOrNone(`SELECT
          r.*,
          v.player_url,
          v.hls_url,
          v.thumbnail_url,
          v.duration,
          v.status as video_status
        FROM resumes r
        LEFT JOIN videos v ON v.id = r.video_id
        WHERE r.jobseeker_id = $1
        ORDER BY r.created_at DESC`, [userId]);
            return res.json({
                success: true,
                resumes: resumes || [],
            });
        }
        catch (error) {
            console.error('❌ Error getting resumes:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to get resumes',
            });
        }
    }
    /**
     * Получить видео-резюме текущего пользователя
     * GET /api/v1/resumes/video/my
     */
    static async getMyResumeVideo(req, res) {
        try {
            const userId = req.user.userId;
            const video = await DatabaseService_1.db.oneOrNone(`SELECT * FROM videos
         WHERE user_id = $1 AND type = $2
         ORDER BY created_at DESC
         LIMIT 1`, [userId, 'resume']);
            return res.json({
                success: true,
                video: video || null,
            });
        }
        catch (error) {
            console.error('❌ Error getting resume video:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to get resume video',
            });
        }
    }
    /**
     * Создать новое резюме
     * POST /api/v1/resumes
     */
    static async createResume(req, res) {
        try {
            const userId = req.user.userId;
            const { name, profession, city, salaryExpected, about, videoId,
            // videoUrl, hlsUrl, thumbnailUrl - not stored yet, reserved for future
             } = req.body;
            // Валидация обязательных полей
            if (!name || !profession || !city) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: 'Name, profession, and city are required',
                });
            }
            // Если есть videoId, проверяем что видео принадлежит пользователю
            if (videoId) {
                const video = await DatabaseService_1.db.oneOrNone('SELECT * FROM videos WHERE id = $1 AND user_id = $2', [videoId, userId]);
                if (!video) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Video does not belong to you',
                    });
                }
            }
            // Создаем резюме
            const resume = await DatabaseService_1.db.one(`INSERT INTO resumes (
          jobseeker_id,
          name,
          profession,
          city,
          salary_expected,
          about,
          video_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *`, [
                userId,
                name,
                profession,
                city,
                salaryExpected || null,
                about || null,
                videoId || null
            ]);
            console.log(`✅ Resume created: ${resume.id} for user ${userId}`);
            return res.status(201).json({
                success: true,
                resume,
            });
        }
        catch (error) {
            console.error('❌ Error creating resume:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to create resume',
            });
        }
    }
    /**
     * Получить резюме по ID
     * GET /api/v1/resumes/:id
     */
    static async getResume(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const resume = await DatabaseService_1.db.oneOrNone(`SELECT
          r.*,
          v.player_url,
          v.hls_url,
          v.thumbnail_url,
          v.duration,
          v.status as video_status
        FROM resumes r
        LEFT JOIN videos v ON v.id = r.video_id
        WHERE r.id = $1 AND r.jobseeker_id = $2`, [id, userId]);
            if (!resume) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Resume not found',
                });
            }
            return res.json({
                success: true,
                resume,
            });
        }
        catch (error) {
            console.error('❌ Error getting resume:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to get resume',
            });
        }
    }
    /**
     * Обновить резюме
     * PUT /api/v1/resumes/:id
     */
    static async updateResume(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const { name, profession, city, salaryExpected, about, videoId } = req.body;
            // Проверяем что резюме существует и принадлежит пользователю
            const existingResume = await DatabaseService_1.db.oneOrNone('SELECT * FROM resumes WHERE id = $1 AND jobseeker_id = $2', [id, userId]);
            if (!existingResume) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Resume not found',
                });
            }
            // Если меняется videoId, проверяем что видео принадлежит пользователю
            if (videoId && videoId !== existingResume.video_id) {
                const video = await DatabaseService_1.db.oneOrNone('SELECT * FROM videos WHERE id = $1 AND user_id = $2', [videoId, userId]);
                if (!video) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'Video does not belong to you',
                    });
                }
            }
            // Обновляем только переданные поля
            const resume = await DatabaseService_1.db.one(`UPDATE resumes SET
          name = COALESCE($2, name),
          profession = COALESCE($3, profession),
          city = COALESCE($4, city),
          salary_expected = COALESCE($5, salary_expected),
          about = COALESCE($6, about),
          video_id = COALESCE($7, video_id),
          updated_at = NOW()
        WHERE id = $1 AND jobseeker_id = $8
        RETURNING *`, [id, name, profession, city, salaryExpected, about, videoId, userId]);
            console.log(`✅ Resume updated: ${id}`);
            return res.json({
                success: true,
                resume,
            });
        }
        catch (error) {
            console.error('❌ Error updating resume:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to update resume',
            });
        }
    }
    /**
     * Удалить резюме
     * DELETE /api/v1/resumes/:id
     */
    static async deleteResume(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            // Проверяем что резюме существует и принадлежит пользователю
            const resume = await DatabaseService_1.db.oneOrNone('SELECT * FROM resumes WHERE id = $1 AND jobseeker_id = $2', [id, userId]);
            if (!resume) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'Resume not found',
                });
            }
            // Удаляем резюме
            await DatabaseService_1.db.none('DELETE FROM resumes WHERE id = $1', [id]);
            console.log(`✅ Resume deleted: ${id}`);
            return res.json({
                success: true,
                message: 'Resume deleted',
            });
        }
        catch (error) {
            console.error('❌ Error deleting resume:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Failed to delete resume',
            });
        }
    }
}
exports.ResumeController = ResumeController;
//# sourceMappingURL=ResumeController.js.map