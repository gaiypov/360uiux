/**
 * 360° РАБОТА - Moderation Controller
 *
 * Управление модерацией видео:
 * - AI проверка видео
 * - Ручная модерация
 * - Система жалоб
 * - Логи модерации
 */
import { Request, Response } from 'express';
export declare class ModerationController {
    /**
     * Получить список видео, ожидающих модерации
     * GET /api/v1/moderation/pending
     * Доступ: только модераторы
     */
    static getPendingVideos(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Промодерировать видео (одобрить/отклонить/пометить/заблокировать)
     * POST /api/v1/moderation/moderate
     * Доступ: только модераторы
     */
    static moderateVideo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Создать жалобу на видео
     * POST /api/v1/moderation/complaints
     * Доступ: авторизованные пользователи
     */
    static submitComplaint(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить список жалоб
     * GET /api/v1/moderation/complaints
     * Доступ: только модераторы
     */
    static getComplaints(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Рассмотреть жалобу
     * PATCH /api/v1/moderation/complaints/:complaintId
     * Доступ: только модераторы
     */
    static reviewComplaint(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * AI проверка видео (автоматическая модерация)
     * POST /api/v1/moderation/ai-check/:videoId
     * Доступ: система (internal)
     */
    static performAICheck(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить логи модерации для видео
     * GET /api/v1/moderation/logs/:videoId
     * Доступ: только модераторы
     */
    static getModerationLogs(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Mock AI проверка (временно, до интеграции с AWS Rekognition)
     */
    private static mockAICheck;
}
//# sourceMappingURL=ModerationController.d.ts.map