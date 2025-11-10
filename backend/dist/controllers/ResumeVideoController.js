"use strict";
/**
 * 360° РАБОТА - Resume Video Controller
 * Управление видеорезюме (только соискатели)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeVideoController = void 0;
const VideoService_1 = require("../services/video/VideoService");
const database_1 = require("../config/database");
// VideoStatus and ResumeVideoView types available but not currently used
const crypto_1 = __importDefault(require("crypto"));
class ResumeVideoController {
    /**
     * Загрузить видеорезюме
     * POST /api/v1/resumes/video
     */
    static async uploadVideo(req, res) {
        try {
            const { title, description } = req.body;
            const userId = req.user.userId;
            const role = req.user.role;
            // Проверка роли
            if (role !== 'jobseeker') {
                return res.status(403).json({ error: 'Only job seekers can upload resume videos' });
            }
            // Проверка файла
            if (!req.file) {
                return res.status(400).json({ error: 'Video file is required' });
            }
            // Получить информацию о пользователе
            const user = await database_1.db.one('SELECT id, name, profession FROM users WHERE id = $1', [userId]);
            console.log(`📹 Uploading resume video for user ${userId}...`);
            // Проверить, есть ли уже видеорезюме
            const existingVideo = await database_1.db.oneOrNone('SELECT * FROM videos WHERE user_id = $1 AND type = $2 AND vacancy_id IS NULL', [userId, 'resume']);
            if (existingVideo) {
                // Удалить старое видео из провайдера
                try {
                    await VideoService_1.videoService.deleteVideo(existingVideo.video_id);
                }
                catch (error) {
                    console.warn('Failed to delete old video from provider:', error);
                }
                // Удалить старую запись из БД
                await database_1.db.none('DELETE FROM videos WHERE id = $1', [existingVideo.id]);
            }
            // Загрузить новое видео через videoService
            const uploadResult = await VideoService_1.videoService.uploadVideo({
                file: req.file.buffer,
                fileName: req.file.originalname,
                metadata: {
                    type: 'resume',
                    userId,
                    title: title || `Видеорезюме ${user.name}`,
                    description: description || `${user.profession} - ${user.name}`,
                },
            });
            // Сохранить информацию о видео в БД (Architecture v3: private & protected)
            const video = await database_1.db.one(`INSERT INTO videos (
          video_id, type, user_id, title, description,
          player_url, hls_url, thumbnail_url, duration,
          status, views, provider, is_public, download_protected,
          created_at, updated_at
        )
        VALUES ($1, 'resume', $2, $3, $4, $5, $6, $7, $8, 'ready', 0, $9, false, true, NOW(), NOW())
        RETURNING *`, [
                uploadResult.videoId,
                userId,
                title || `Видеорезюме ${user.name}`,
                description,
                uploadResult.playerUrl,
                uploadResult.hlsUrl,
                uploadResult.thumbnailUrl,
                uploadResult.duration,
                VideoService_1.videoService.getProviderType(),
            ]);
            // Обновить пользователя с URL видеорезюме
            await database_1.db.none('UPDATE users SET resume_video_url = $1, updated_at = NOW() WHERE id = $2', [uploadResult.playerUrl, userId]);
            console.log(`✅ Resume video uploaded successfully: ${video.id}`);
            return res.status(201).json({
                success: true,
                video,
            });
        }
        catch (error) {
            console.error('Upload resume video error:', error);
            return res.status(500).json({
                error: 'Failed to upload video',
                message: error.message,
            });
        }
    }
    /**
     * Получить своё видеорезюме
     * GET /api/v1/resumes/video/me
     */
    static async getMyVideo(req, res) {
        try {
            const userId = req.user.userId;
            const role = req.user.role;
            if (role !== 'jobseeker') {
                return res.status(403).json({ error: 'Only job seekers can access resume videos' });
            }
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE user_id = $1 AND type = $2 AND vacancy_id IS NULL', [userId, 'resume']);
            if (!video) {
                return res.status(404).json({ error: 'Resume video not found' });
            }
            return res.json({ video });
        }
        catch (error) {
            console.error('Get my resume video error:', error);
            return res.status(500).json({ error: 'Failed to get video' });
        }
    }
    /**
     * Получить видеорезюме соискателя (для работодателей)
     * GET /api/v1/resumes/video/:userId
     */
    static async getUserVideo(req, res) {
        try {
            const { userId } = req.params;
            const requestingUserId = req.user.userId;
            const role = req.user.role;
            // Только работодатели или сам пользователь могут просматривать видеорезюме
            if (role !== 'employer' && requestingUserId !== userId) {
                return res.status(403).json({ error: 'Access denied' });
            }
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE user_id = $1 AND type = $2 AND vacancy_id IS NULL', [userId, 'resume']);
            if (!video) {
                return res.status(404).json({ error: 'Resume video not found' });
            }
            // Инкрементировать счетчик просмотров
            await database_1.db.none('UPDATE videos SET views = views + 1 WHERE id = $1', [video.id]);
            // Получить информацию о пользователе
            const user = await database_1.db.one('SELECT id, name, profession, city, avatar_url FROM users WHERE id = $1', [userId]);
            return res.json({
                video,
                user,
            });
        }
        catch (error) {
            console.error('Get user resume video error:', error);
            return res.status(500).json({ error: 'Failed to get video' });
        }
    }
    /**
     * Удалить своё видеорезюме
     * DELETE /api/v1/resumes/video
     */
    static async deleteVideo(req, res) {
        try {
            const userId = req.user.userId;
            const role = req.user.role;
            if (role !== 'jobseeker') {
                return res.status(403).json({ error: 'Only job seekers can delete resume videos' });
            }
            // Найти видео
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE user_id = $1 AND type = $2 AND vacancy_id IS NULL', [userId, 'resume']);
            if (!video) {
                return res.status(404).json({ error: 'Resume video not found' });
            }
            console.log(`🗑️  Deleting resume video: ${video.id}`);
            // Удалить из провайдера
            await VideoService_1.videoService.deleteVideo(video.video_id);
            // Удалить из БД
            await database_1.db.none('DELETE FROM videos WHERE id = $1', [video.id]);
            // Очистить поле в пользователе
            await database_1.db.none('UPDATE users SET resume_video_url = NULL, updated_at = NOW() WHERE id = $1', [userId]);
            console.log(`✅ Resume video deleted: ${video.id}`);
            return res.json({ success: true, message: 'Video deleted successfully' });
        }
        catch (error) {
            console.error('Delete resume video error:', error);
            return res.status(500).json({
                error: 'Failed to delete video',
                message: error.message,
            });
        }
    }
    /**
     * Получить статистику видеорезюме
     * GET /api/v1/resumes/video/stats
     */
    static async getVideoStats(req, res) {
        try {
            const userId = req.user.userId;
            const role = req.user.role;
            if (role !== 'jobseeker') {
                return res.status(403).json({ error: 'Only job seekers can access resume video stats' });
            }
            // Найти видео
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE user_id = $1 AND type = $2 AND vacancy_id IS NULL', [userId, 'resume']);
            if (!video) {
                return res.status(404).json({ error: 'Resume video not found' });
            }
            // Получить статистику от провайдера
            const providerStats = await VideoService_1.videoService.getVideoStats(video.video_id);
            return res.json({
                videoId: video.id,
                views: video.views, // Наши просмотры из БД
                providerViews: providerStats.views, // Просмотры от провайдера
                duration: video.duration || providerStats.duration,
                completion: providerStats.completion,
                createdAt: video.created_at,
            });
        }
        catch (error) {
            console.error('Get resume video stats error:', error);
            return res.status(500).json({ error: 'Failed to get video stats' });
        }
    }
    /**
     * Обновить метаданные видеорезюме
     * PATCH /api/v1/resumes/video
     */
    static async updateVideoMetadata(req, res) {
        try {
            const { title, description } = req.body;
            const userId = req.user.userId;
            const role = req.user.role;
            if (role !== 'jobseeker') {
                return res.status(403).json({ error: 'Only job seekers can update resume videos' });
            }
            // Найти видео
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE user_id = $1 AND type = $2 AND vacancy_id IS NULL', [userId, 'resume']);
            if (!video) {
                return res.status(404).json({ error: 'Resume video not found' });
            }
            // Обновить метаданные
            const updatedVideo = await database_1.db.one(`UPDATE videos
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             updated_at = NOW()
         WHERE id = $3
         RETURNING *`, [title, description, video.id]);
            return res.json({
                success: true,
                video: updatedVideo,
            });
        }
        catch (error) {
            console.error('Update resume video metadata error:', error);
            return res.status(500).json({ error: 'Failed to update video metadata' });
        }
    }
    // ===================================
    // ARCHITECTURE V3: SECURE VIDEO URLS WITH VIEW LIMITING
    // ===================================
    /**
     * Проверить лимит просмотров для работодателя
     * GET /api/v1/resumes/video/:videoId/check-view-limit
     * Query: applicationId
     */
    static async checkViewLimit(req, res) {
        try {
            const { videoId } = req.params;
            const { applicationId } = req.query;
            const employerId = req.user.userId;
            const role = req.user.role;
            if (role !== 'employer') {
                return res.status(403).json({ error: 'Only employers can check view limits' });
            }
            if (!applicationId) {
                return res.status(400).json({ error: 'Application ID is required' });
            }
            // Вызов SQL функции check_video_view_limit
            const result = await database_1.db.one('SELECT * FROM check_video_view_limit($1, $2, $3)', [videoId, applicationId, employerId]);
            return res.json(result);
        }
        catch (error) {
            console.error('Check view limit error:', error);
            return res.status(500).json({ error: 'Failed to check view limit' });
        }
    }
    /**
     * Получить защищенный URL для просмотра видео-резюме
     * POST /api/v1/resumes/video/:videoId/secure-url
     * Body: { applicationId }
     */
    static async getSecureVideoUrl(req, res) {
        try {
            const { videoId } = req.params;
            const { applicationId } = req.body;
            const employerId = req.user.userId;
            const role = req.user.role;
            if (role !== 'employer') {
                return res.status(403).json({ error: 'Only employers can access resume videos' });
            }
            if (!applicationId) {
                return res.status(400).json({ error: 'Application ID is required' });
            }
            // Проверить лимит просмотров
            const viewLimit = await database_1.db.one('SELECT * FROM check_video_view_limit($1, $2, $3)', [videoId, applicationId, employerId]);
            if (!viewLimit.can_view) {
                return res.status(403).json({
                    error: 'View limit exceeded',
                    message: 'Вы исчерпали лимит просмотров этого видео (макс. 2)',
                    views_left: 0,
                });
            }
            // Получить информацию о видео
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE id = $1 AND type = $2', [videoId, 'resume']);
            if (!video) {
                return res.status(404).json({ error: 'Resume video not found' });
            }
            // Проверить, что видео приватное
            if (video.is_public) {
                return res.status(400).json({ error: 'This video is not a private resume video' });
            }
            // Генерировать временный токен (5 минут)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            const token = crypto_1.default.randomBytes(32).toString('hex');
            // TODO: Сохранить токен в кэше (Redis) с TTL 5 минут
            // await redis.setex(`video_token:${token}`, 300, JSON.stringify({
            //   videoId, employerId, applicationId, expiresAt
            // }));
            // Для api.video - можно использовать их встроенные приватные токены
            // или вернуть наш защищенный endpoint
            const secureUrl = `${video.hls_url}?token=${token}`;
            // Увеличить счетчик просмотров
            const incremented = await database_1.db.one('SELECT increment_video_view($1, $2, $3) as increment_video_view', [videoId, applicationId, employerId]);
            if (!incremented.increment_video_view) {
                console.warn(`Failed to increment view count for video ${videoId}`);
            }
            const response = {
                url: secureUrl,
                expires_at: expiresAt,
                views_remaining: viewLimit.views_left - 1, // Минус текущий просмотр
            };
            return res.json(response);
        }
        catch (error) {
            console.error('Get secure video URL error:', error);
            return res.status(500).json({ error: 'Failed to generate secure URL' });
        }
    }
    /**
     * Получить статистику просмотров видео-резюме для соискателя
     * GET /api/v1/resumes/video/view-stats
     */
    static async getResumeViewStats(req, res) {
        try {
            const userId = req.user.userId;
            const role = req.user.role;
            if (role !== 'jobseeker') {
                return res.status(403).json({ error: 'Only job seekers can access resume view stats' });
            }
            // Получить видео соискателя
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE user_id = $1 AND type = $2', [userId, 'resume']);
            if (!video) {
                return res.status(404).json({ error: 'Resume video not found' });
            }
            // Получить статистику из view resume_video_stats
            const stats = await database_1.db.oneOrNone(`SELECT
          unique_employers_viewed,
          total_views,
          applications_with_views,
          employers_exhausted_limit,
          last_viewed_at
        FROM resume_video_stats
        WHERE video_id = $1`, [video.id]);
            return res.json({
                video_id: video.id,
                stats: stats || {
                    unique_employers_viewed: 0,
                    total_views: 0,
                    applications_with_views: 0,
                    employers_exhausted_limit: 0,
                    last_viewed_at: null,
                },
            });
        }
        catch (error) {
            console.error('Get resume view stats error:', error);
            return res.status(500).json({ error: 'Failed to get view stats' });
        }
    }
}
exports.ResumeVideoController = ResumeVideoController;
//# sourceMappingURL=ResumeVideoController.js.map