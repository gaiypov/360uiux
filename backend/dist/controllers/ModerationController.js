"use strict";
/**
 * 360° РАБОТА - Moderation Controller
 *
 * Управление модерацией видео:
 * - AI проверка видео
 * - Ручная модерация
 * - Система жалоб
 * - Логи модерации
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationController = void 0;
const database_1 = __importDefault(require("../config/database"));
class ModerationController {
    /**
     * Получить список видео, ожидающих модерации
     * GET /api/v1/moderation/pending
     * Доступ: только модераторы
     */
    static async getPendingVideos(req, res) {
        try {
            const { page = 1, limit = 20, priority_only = false } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            // Построение WHERE условия
            let whereConditions = `status IN ('auto_moderation', 'pending_moderation')`;
            if (priority_only === 'true') {
                whereConditions += ` AND priority_moderation = true`;
            }
            // Получение общего количества
            const totalResult = await database_1.default.one(`SELECT COUNT(*) as count FROM videos WHERE ${whereConditions}`);
            const total = parseInt(totalResult.count);
            // Получение видео
            const videos = await database_1.default.manyOrNone(`SELECT v.*, u.phone, u.name, u.company_name
         FROM videos v
         LEFT JOIN users u ON v.user_id = u.id
         WHERE ${whereConditions}
         ORDER BY
           priority_moderation DESC,
           created_at ASC
         LIMIT $1 OFFSET $2`, [limit, offset]);
            const response = {
                videos: videos || [],
                total,
                page: Number(page),
                limit: Number(limit),
            };
            return res.json({ success: true, data: response });
        }
        catch (error) {
            console.error('Error fetching pending videos:', error);
            return res.status(500).json({ error: 'Failed to fetch pending videos' });
        }
    }
    /**
     * Промодерировать видео (одобрить/отклонить/пометить/заблокировать)
     * POST /api/v1/moderation/moderate
     * Доступ: только модераторы
     */
    static async moderateVideo(req, res) {
        try {
            const { video_id, action, reason, comment } = req.body;
            const moderatorId = req.user.userId;
            // Проверка видео
            const video = await database_1.default.oneOrNone('SELECT * FROM videos WHERE id = $1', [video_id]);
            if (!video) {
                return res.status(404).json({ error: 'Video not found' });
            }
            let newStatus;
            let moderationStatus;
            switch (action) {
                case 'approve':
                    newStatus = 'approved';
                    moderationStatus = 'approved';
                    break;
                case 'reject':
                    newStatus = 'rejected';
                    moderationStatus = 'rejected';
                    break;
                case 'flag':
                    newStatus = 'flagged';
                    moderationStatus = 'in_review';
                    break;
                case 'block':
                    newStatus = 'blocked';
                    moderationStatus = 'rejected';
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid action' });
            }
            // Обновление видео
            const updatedVideo = await database_1.default.one(`UPDATE videos
         SET status = $1,
             moderation_status = $2,
             moderated_by = $3,
             moderated_at = CURRENT_TIMESTAMP,
             rejection_reason = $4,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`, [newStatus, moderationStatus, moderatorId, reason || null, video_id]);
            // Создание лога модерации
            await database_1.default.none(`INSERT INTO moderation_logs (video_id, action, performed_by, comment, details)
         VALUES ($1, $2, $3, $4, $5)`, [
                video_id,
                action === 'approve' ? 'approved' :
                    action === 'reject' ? 'rejected' :
                        action === 'flag' ? 'flagged' : 'blocked',
                moderatorId,
                comment || null,
                JSON.stringify({ reason, previous_status: video.status }),
            ]);
            // TODO: Отправить уведомление пользователю
            // await sendModerationNotification(video.user_id, action, reason);
            return res.json({
                success: true,
                message: `Video ${action}ed successfully`,
                video: updatedVideo,
            });
        }
        catch (error) {
            console.error('Error moderating video:', error);
            return res.status(500).json({ error: 'Failed to moderate video' });
        }
    }
    /**
     * Создать жалобу на видео
     * POST /api/v1/moderation/complaints
     * Доступ: авторизованные пользователи
     */
    static async submitComplaint(req, res) {
        try {
            const { video_id, reason, description } = req.body;
            const userId = req.user.userId;
            // Проверка существования видео
            const video = await database_1.default.oneOrNone('SELECT * FROM videos WHERE id = $1', [video_id]);
            if (!video) {
                return res.status(404).json({ error: 'Video not found' });
            }
            // Проверка, не подавал ли пользователь уже жалобу на это видео
            const existingComplaint = await database_1.default.oneOrNone('SELECT * FROM video_complaints WHERE video_id = $1 AND user_id = $2', [video_id, userId]);
            if (existingComplaint) {
                return res.status(400).json({ error: 'You have already submitted a complaint for this video' });
            }
            // Создание жалобы
            const complaint = await database_1.default.one(`INSERT INTO video_complaints (video_id, user_id, reason, description)
         VALUES ($1, $2, $3, $4)
         RETURNING *`, [video_id, userId, reason, description || null]);
            // Создание лога
            await database_1.default.none(`INSERT INTO moderation_logs (video_id, action, performed_by, details)
         VALUES ($1, $2, $3, $4)`, [
                video_id,
                'complaint_received',
                userId,
                JSON.stringify({ reason, complaint_id: complaint.id }),
            ]);
            // Триггер автоматически увеличит complaints_count
            return res.status(201).json({
                success: true,
                message: 'Complaint submitted successfully',
                complaint,
            });
        }
        catch (error) {
            console.error('Error submitting complaint:', error);
            return res.status(500).json({ error: 'Failed to submit complaint' });
        }
    }
    /**
     * Получить список жалоб
     * GET /api/v1/moderation/complaints
     * Доступ: только модераторы
     */
    static async getComplaints(req, res) {
        try {
            const { status, page = 1, limit = 20 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            let whereConditions = '1=1';
            if (status) {
                whereConditions += ` AND vc.status = '${status}'`;
            }
            const complaints = await database_1.default.manyOrNone(`SELECT vc.*,
                v.title as video_title,
                v.type as video_type,
                u.phone as user_phone,
                u.name as user_name
         FROM video_complaints vc
         LEFT JOIN videos v ON vc.video_id = v.id
         LEFT JOIN users u ON vc.user_id = u.id
         WHERE ${whereConditions}
         ORDER BY vc.created_at DESC
         LIMIT $1 OFFSET $2`, [limit, offset]);
            return res.json({ success: true, complaints: complaints || [] });
        }
        catch (error) {
            console.error('Error fetching complaints:', error);
            return res.status(500).json({ error: 'Failed to fetch complaints' });
        }
    }
    /**
     * Рассмотреть жалобу
     * PATCH /api/v1/moderation/complaints/:complaintId
     * Доступ: только модераторы
     */
    static async reviewComplaint(req, res) {
        try {
            const { complaintId } = req.params;
            const { status, comment } = req.body;
            const moderatorId = req.user.userId;
            // Обновление жалобы
            const complaint = await database_1.default.one(`UPDATE video_complaints
         SET status = $1,
             reviewed_by = $2,
             reviewed_at = CURRENT_TIMESTAMP,
             moderator_comment = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`, [status, moderatorId, comment || null, complaintId]);
            // Создание лога
            await database_1.default.none(`INSERT INTO moderation_logs (video_id, action, performed_by, details)
         VALUES ($1, $2, $3, $4)`, [
                complaint.video_id,
                'complaint_resolved',
                moderatorId,
                JSON.stringify({ complaint_id: complaintId, decision: status }),
            ]);
            return res.json({
                success: true,
                message: 'Complaint reviewed successfully',
                complaint,
            });
        }
        catch (error) {
            console.error('Error reviewing complaint:', error);
            return res.status(500).json({ error: 'Failed to review complaint' });
        }
    }
    /**
     * AI проверка видео (автоматическая модерация)
     * POST /api/v1/moderation/ai-check/:videoId
     * Доступ: система (internal)
     */
    static async performAICheck(req, res) {
        try {
            const { videoId } = req.params;
            // Получение видео
            const video = await database_1.default.oneOrNone('SELECT * FROM videos WHERE id = $1', [videoId]);
            if (!video) {
                return res.status(404).json({ error: 'Video not found' });
            }
            // Логирование начала AI проверки
            await database_1.default.none(`INSERT INTO moderation_logs (video_id, action, details)
         VALUES ($1, $2, $3)`, [videoId, 'ai_check_started', JSON.stringify({ video_url: video.player_url })]);
            // TODO: Интеграция с AWS Rekognition или другим AI сервисом
            // Пока используем mock результат
            const aiResult = await this.mockAICheck(video);
            // Обновление видео с результатами AI
            let newStatus = aiResult.passed ? 'pending_moderation' : 'rejected';
            let moderationStatus = aiResult.passed ? 'pending' : 'rejected';
            await database_1.default.none(`UPDATE videos
         SET status = $1,
             moderation_status = $2,
             ai_check_passed = $3,
             ai_check_results = $4,
             rejection_reason = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`, [
                newStatus,
                moderationStatus,
                aiResult.passed,
                JSON.stringify(aiResult),
                aiResult.passed ? null : aiResult.issues?.join(', '),
                videoId,
            ]);
            // Логирование завершения AI проверки
            await database_1.default.none(`INSERT INTO moderation_logs (video_id, action, details)
         VALUES ($1, $2, $3)`, [
                videoId,
                aiResult.passed ? 'ai_check_completed' : 'ai_check_failed',
                JSON.stringify(aiResult),
            ]);
            return res.json({
                success: true,
                message: `AI check ${aiResult.passed ? 'passed' : 'failed'}`,
                result: aiResult,
            });
        }
        catch (error) {
            console.error('Error performing AI check:', error);
            // Логирование ошибки AI проверки
            if (req.params.videoId) {
                await database_1.default.none(`INSERT INTO moderation_logs (video_id, action, details)
           VALUES ($1, $2, $3)`, [req.params.videoId, 'ai_check_failed', JSON.stringify({ error: error.message })]).catch(() => { });
            }
            return res.status(500).json({ error: 'Failed to perform AI check' });
        }
    }
    /**
     * Получить логи модерации для видео
     * GET /api/v1/moderation/logs/:videoId
     * Доступ: только модераторы
     */
    static async getModerationLogs(req, res) {
        try {
            const { videoId } = req.params;
            const logs = await database_1.default.manyOrNone(`SELECT ml.*,
                u.name as performed_by_name,
                u.phone as performed_by_phone
         FROM moderation_logs ml
         LEFT JOIN users u ON ml.performed_by = u.id
         WHERE ml.video_id = $1
         ORDER BY ml.created_at DESC`, [videoId]);
            return res.json({ success: true, logs: logs || [] });
        }
        catch (error) {
            console.error('Error fetching moderation logs:', error);
            return res.status(500).json({ error: 'Failed to fetch moderation logs' });
        }
    }
    /**
     * Mock AI проверка (временно, до интеграции с AWS Rekognition)
     */
    static async mockAICheck(video) {
        // Имитация задержки AI обработки
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Mock: проверка длительности
        const durationOk = video.duration ? video.duration >= 30 && video.duration <= 180 : true;
        // Mock: случайная проверка "контента" (в реальности - AWS Rekognition)
        const contentOk = Math.random() > 0.1; // 90% проходит
        const passed = durationOk && contentOk;
        const result = {
            passed,
            confidence: passed ? 0.95 : 0.45,
            labels: passed ? ['person', 'indoor', 'professional'] : ['explicit', 'violence'],
            issues: passed ? [] : [
                !durationOk ? 'Invalid duration' : '',
                !contentOk ? 'Inappropriate content detected' : '',
            ].filter(Boolean),
            details: {
                duration_check: durationOk,
                content_check: contentOk,
                quality_score: 0.87,
            },
        };
        return result;
    }
}
exports.ModerationController = ModerationController;
//# sourceMappingURL=ModerationController.js.map