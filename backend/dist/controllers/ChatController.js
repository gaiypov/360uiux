"use strict";
/**
 * 360° РАБОТА - Chat Controller
 * Architecture v3: Chat endpoints для общения между соискателем и работодателем
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const ChatService_1 = require("../services/ChatService");
class ChatController {
    /**
     * Получить все сообщения в чате
     * GET /api/chat/:applicationId/messages
     */
    static async getMessages(req, res) {
        try {
            const { applicationId } = req.params;
            const userId = req.user.userId;
            const messages = await ChatService_1.chatService.getMessages(applicationId, userId);
            return res.json({
                success: true,
                messages,
                count: messages.length,
            });
        }
        catch (error) {
            console.error('Get messages error:', error);
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ error: error.message });
            }
            return res.status(500).json({
                error: 'Failed to get messages',
                message: error.message,
            });
        }
    }
    /**
     * Отправить сообщение
     * POST /api/chat/:applicationId/messages
     * Body: { messageType: 'text' | 'video', content?: string, videoId?: string }
     */
    static async sendMessage(req, res) {
        try {
            const { applicationId } = req.params;
            const { messageType, content, videoId } = req.body;
            const userId = req.user.userId;
            const userRole = req.user.role;
            // Валидация
            if (!messageType) {
                return res.status(400).json({ error: 'Message type is required' });
            }
            if (messageType === 'text' && !content) {
                return res.status(400).json({ error: 'Content is required for text messages' });
            }
            if (messageType === 'video' && !videoId) {
                return res.status(400).json({ error: 'Video ID is required for video messages' });
            }
            // Определить тип отправителя
            const senderType = userRole === 'jobseeker' ? 'jobseeker' : 'employer';
            // Создать сообщение
            const message = await ChatService_1.chatService.createMessage({
                applicationId,
                senderId: userId,
                senderType,
                messageType,
                content,
                videoId,
            });
            return res.status(201).json({
                success: true,
                message,
            });
        }
        catch (error) {
            console.error('Send message error:', error);
            return res.status(500).json({
                error: 'Failed to send message',
                message: error.message,
            });
        }
    }
    /**
     * Отметить сообщения как прочитанные
     * PUT /api/chat/:applicationId/read
     */
    static async markAsRead(req, res) {
        try {
            const { applicationId } = req.params;
            const userRole = req.user.role;
            // Отметить сообщения от другой стороны
            const otherSenderType = userRole === 'jobseeker' ? 'employer' : 'jobseeker';
            await ChatService_1.chatService.markAsRead(applicationId, otherSenderType);
            return res.json({
                success: true,
                message: 'Messages marked as read',
            });
        }
        catch (error) {
            console.error('Mark as read error:', error);
            return res.status(500).json({
                error: 'Failed to mark messages as read',
                message: error.message,
            });
        }
    }
    /**
     * Получить количество непрочитанных сообщений
     * GET /api/chat/:applicationId/unread-count
     */
    static async getUnreadCount(req, res) {
        try {
            const { applicationId } = req.params;
            const userRole = req.user.role;
            const userType = userRole === 'jobseeker' ? 'jobseeker' : 'employer';
            const count = await ChatService_1.chatService.getUnreadCount(applicationId, userType);
            return res.json({
                success: true,
                unread_count: count,
            });
        }
        catch (error) {
            console.error('Get unread count error:', error);
            return res.status(500).json({
                error: 'Failed to get unread count',
                message: error.message,
            });
        }
    }
    /**
     * Получить все чаты пользователя
     * GET /api/chat/my-chats
     */
    static async getMyChats(req, res) {
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            if (userRole !== 'jobseeker' && userRole !== 'employer') {
                return res.status(403).json({ error: 'Only jobseekers and employers can access chats' });
            }
            const chats = await ChatService_1.chatService.getUserChats(userId, userRole);
            return res.json({
                success: true,
                chats,
                count: chats.length,
            });
        }
        catch (error) {
            console.error('Get my chats error:', error);
            return res.status(500).json({
                error: 'Failed to get chats',
                message: error.message,
            });
        }
    }
    /**
     * Удалить сообщение
     * DELETE /api/chat/messages/:messageId
     */
    static async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const userId = req.user.userId;
            await ChatService_1.chatService.deleteMessage(messageId, userId);
            return res.json({
                success: true,
                message: 'Message deleted successfully',
            });
        }
        catch (error) {
            console.error('Delete message error:', error);
            if (error.message.includes('not found') || error.message.includes('Access denied')) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({
                error: 'Failed to delete message',
                message: error.message,
            });
        }
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=ChatController.js.map