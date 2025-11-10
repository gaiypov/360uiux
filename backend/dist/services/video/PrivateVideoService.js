"use strict";
/**
 * 360° РАБОТА - Private Video Service
 * Architecture v3: Приватные видео-резюме с лимитом просмотров
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.privateVideoService = exports.PrivateVideoService = void 0;
const database_1 = require("../../config/database");
const VideoService_1 = require("./VideoService");
const redis_1 = require("../../config/redis");
const crypto_1 = __importDefault(require("crypto"));
class PrivateVideoService {
    /**
     * Загрузить ПРИВАТНОЕ видео-резюме
     * Architecture v3: is_public = false, download_protected = true
     */
    async uploadPrivateResumeVideo(params) {
        console.log(`📹 Uploading private resume video for user ${params.userId}...`);
        try {
            // 1. Загрузить видео через VideoService
            const uploadResult = await VideoService_1.videoService.uploadVideo({
                file: params.file,
                fileName: params.fileName,
                metadata: {
                    type: 'resume',
                    userId: params.userId,
                    title: params.title || `Resume Video ${params.resumeId}`,
                    description: params.description,
                },
            });
            // 2. Сохранить в БД как ПРИВАТНОЕ
            const video = await database_1.db.one(`INSERT INTO videos (
          video_id, type, user_id, title, description,
          player_url, hls_url, thumbnail_url, duration,
          status, views, provider,
          is_public, download_protected,
          moderation_status, ai_check_passed,
          created_at, updated_at
        )
        VALUES (
          $1, 'resume', $2, $3, $4, $5, $6, $7, $8,
          'approved', 0, $9,
          false, true,
          'approved', true,
          NOW(), NOW()
        )
        RETURNING *`, [
                uploadResult.videoId,
                params.userId,
                params.title || `Resume Video ${params.resumeId}`,
                params.description,
                uploadResult.playerUrl,
                uploadResult.hlsUrl,
                uploadResult.thumbnailUrl,
                uploadResult.duration,
                VideoService_1.videoService.getProviderType(),
            ]);
            // 3. Обновить Resume с video_id
            await database_1.db.none(`UPDATE resumes
         SET video_id = $1, video_status = 'ready', updated_at = NOW()
         WHERE id = $2`, [video.id, params.resumeId]);
            console.log(`✅ Private resume video uploaded: ${video.id}`);
            return {
                video,
                message: 'Private resume video uploaded successfully',
            };
        }
        catch (error) {
            console.error('❌ Error uploading private resume video:', error);
            throw error;
        }
    }
    /**
     * Проверить лимит просмотров для работодателя
     * SQL функция: check_video_view_limit(video_id, application_id, employer_id)
     */
    async checkViewLimit(params) {
        try {
            const result = await database_1.db.one('SELECT * FROM check_video_view_limit($1, $2, $3)', [params.videoId, params.applicationId, params.employerId]);
            return result;
        }
        catch (error) {
            console.error('Error checking view limit:', error);
            throw new Error('Failed to check view limit');
        }
    }
    /**
     * Генерировать защищённую временную ссылку на видео
     * Architecture v3: 5-минутный токен, увеличение счётчика просмотров
     */
    async generateSecureUrl(params) {
        console.log(`🔐 Generating secure URL for video ${params.videoId}...`);
        try {
            // 1. Проверить лимит просмотров
            const viewStatus = await this.checkViewLimit(params);
            if (!viewStatus.can_view) {
                throw new Error('View limit exceeded (max 2 views)');
            }
            // 2. Получить видео
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE id = $1 AND type = $2', [params.videoId, 'resume']);
            if (!video) {
                throw new Error('Resume video not found');
            }
            // Проверить что видео приватное
            if (video.is_public) {
                throw new Error('This is not a private resume video');
            }
            // 3. Увеличить счётчик просмотров (SQL функция)
            const incremented = await database_1.db.one('SELECT increment_video_view($1, $2, $3) as increment_video_view', [params.videoId, params.applicationId, params.employerId]);
            if (!incremented.increment_video_view) {
                console.warn(`⚠️ Failed to increment view count for video ${params.videoId}`);
            }
            // 4. Генерировать временный токен (5 минут)
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
            const token = crypto_1.default.randomBytes(32).toString('hex');
            // Сохранить токен в Redis с TTL 5 минут (300 секунд)
            await redis_1.redisHelpers.setJSON(`video_token:${token}`, {
                videoId: params.videoId,
                employerId: params.employerId,
                applicationId: params.applicationId,
                expiresAt: expiresAt.toISOString(),
            }, 300 // 5 минут TTL
            );
            // 5. Создать защищённую ссылку
            // Для api.video можно использовать их private token API
            // Для простоты возвращаем HLS URL с нашим токеном
            const secureUrl = `${video.hls_url}?token=${token}&expires=${expiresAt.getTime()}`;
            console.log(`✅ Secure URL generated, ${viewStatus.views_left - 1} views left`);
            return {
                url: secureUrl,
                expires_at: expiresAt,
                views_remaining: viewStatus.views_left - 1,
                max_views: 2,
                video_id: video.id,
            };
        }
        catch (error) {
            console.error('❌ Error generating secure URL:', error);
            throw error;
        }
    }
    /**
     * Получить статистику просмотров для соискателя
     * Показывает сколько работодателей посмотрели видео
     */
    async getResumeVideoStats(videoId, userId) {
        try {
            // Проверить что видео принадлежит пользователю
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE id = $1 AND user_id = $2 AND type = $3', [videoId, userId, 'resume']);
            if (!video) {
                throw new Error('Resume video not found or access denied');
            }
            // Получить статистику из view
            const stats = await database_1.db.oneOrNone(`SELECT
          unique_employers_viewed,
          total_views,
          applications_with_views,
          employers_exhausted_limit,
          last_viewed_at
        FROM resume_video_stats
        WHERE video_id = $1`, [videoId]);
            return {
                video_id: videoId,
                stats: stats || {
                    unique_employers_viewed: 0,
                    total_views: 0,
                    applications_with_views: 0,
                    employers_exhausted_limit: 0,
                    last_viewed_at: null,
                },
            };
        }
        catch (error) {
            console.error('Error getting resume video stats:', error);
            throw error;
        }
    }
    /**
     * Удалить приватное видео-резюме
     */
    async deletePrivateResumeVideo(videoId, userId) {
        try {
            // 1. Получить видео
            const video = await database_1.db.oneOrNone('SELECT * FROM videos WHERE id = $1 AND user_id = $2 AND type = $3', [videoId, userId, 'resume']);
            if (!video) {
                throw new Error('Resume video not found or access denied');
            }
            // 2. Удалить из провайдера (api.video)
            await VideoService_1.videoService.deleteVideo(video.video_id);
            // 3. Удалить из БД (cascade удалит view records)
            await database_1.db.none('DELETE FROM videos WHERE id = $1', [videoId]);
            // 4. Очистить ссылку в резюме
            await database_1.db.none(`UPDATE resumes
         SET video_id = NULL, video_status = 'none', updated_at = NOW()
         WHERE video_id = $1`, [videoId]);
            console.log(`🗑️ Private resume video deleted: ${videoId}`);
            return { success: true, message: 'Resume video deleted successfully' };
        }
        catch (error) {
            console.error('Error deleting private resume video:', error);
            throw error;
        }
    }
    /**
     * Auto-delete videos that have reached their 2-view limit
     * This should be called by a cron job periodically
     */
    async autoDeleteExpiredVideos() {
        try {
            console.log('🗑️  Running auto-deletion of videos with exhausted view limits...');
            // Find all videos where ALL employers have exhausted their 2-view limit
            // This query finds videos where every application has 2+ views
            const expiredVideos = await database_1.db.manyOrNone(`SELECT DISTINCT v.id as video_id, v.user_id
         FROM videos v
         WHERE v.type = 'resume'
           AND v.is_public = false
           AND NOT EXISTS (
             -- Check if there are any applications with less than 2 views
             SELECT 1
             FROM applications a
             LEFT JOIN video_views vv ON vv.video_id = v.id AND vv.application_id = a.id
             WHERE a.resume_id IN (
               SELECT r.id FROM resumes r WHERE r.video_id = v.id
             )
             GROUP BY a.id
             HAVING COALESCE(COUNT(vv.id), 0) < 2
           )
           AND EXISTS (
             -- Only delete if there's at least one application
             SELECT 1
             FROM applications a
             WHERE a.resume_id IN (
               SELECT r.id FROM resumes r WHERE r.video_id = v.id
             )
           )`);
            if (!expiredVideos || expiredVideos.length === 0) {
                console.log('✅ No expired videos to delete');
                return { deleted: 0, videoIds: [] };
            }
            const deletedIds = [];
            // Delete each video
            for (const video of expiredVideos) {
                try {
                    await this.deletePrivateResumeVideo(video.video_id, video.user_id);
                    deletedIds.push(video.video_id);
                    console.log(`🗑️  Deleted video ${video.video_id} (view limit exhausted)`);
                }
                catch (error) {
                    console.error(`Error deleting video ${video.video_id}:`, error);
                }
            }
            console.log(`✅ Auto-deletion complete: ${deletedIds.length} videos deleted`);
            return {
                deleted: deletedIds.length,
                videoIds: deletedIds,
            };
        }
        catch (error) {
            console.error('Error in auto-delete expired videos:', error);
            throw error;
        }
    }
    /**
     * Проверить валиден ли токен для просмотра видео
     */
    async validateVideoToken(token) {
        try {
            // Проверить токен в Redis
            const data = await redis_1.redisHelpers.getJSON(`video_token:${token}`);
            if (!data) {
                console.warn(`⚠️ Video token not found: ${token}`);
                return false;
            }
            // Проверить срок действия
            const expiresAt = new Date(data.expiresAt);
            if (expiresAt < new Date()) {
                console.warn(`⚠️ Video token expired: ${token}`);
                await redis_1.redisHelpers.deleteByPattern(`video_token:${token}`);
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('Error validating video token:', error);
            return false;
        }
    }
}
exports.PrivateVideoService = PrivateVideoService;
// Singleton export
exports.privateVideoService = new PrivateVideoService();
//# sourceMappingURL=PrivateVideoService.js.map