/**
 * 360° РАБОТА - Chat Controller
 * Architecture v3: Chat endpoints для общения между соискателем и работодателем
 */
import { Request, Response } from 'express';
export declare class ChatController {
    /**
     * Получить все сообщения в чате
     * GET /api/chat/:applicationId/messages
     */
    static getMessages(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Отправить сообщение
     * POST /api/chat/:applicationId/messages
     * Body: { messageType: 'text' | 'video', content?: string, videoId?: string }
     */
    static sendMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Отметить сообщения как прочитанные
     * PUT /api/chat/:applicationId/read
     */
    static markAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить количество непрочитанных сообщений
     * GET /api/chat/:applicationId/unread-count
     */
    static getUnreadCount(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получить все чаты пользователя
     * GET /api/chat/my-chats
     */
    static getMyChats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удалить сообщение
     * DELETE /api/chat/messages/:messageId
     */
    static deleteMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=ChatController.d.ts.map