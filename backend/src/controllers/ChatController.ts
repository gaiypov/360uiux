/**
 * 360° РАБОТА - Chat Controller
 * Architecture v3: Chat endpoints для общения между соискателем и работодателем
 */

import { Request, Response } from 'express';
import { chatService } from '../services/ChatService';

export class ChatController {
  /**
   * Получить все сообщения в чате
   * GET /api/chat/:applicationId/messages
   */
  static async getMessages(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const userId = req.user!.userId;

      const messages = await chatService.getMessages(applicationId, userId);

      return res.json({
        success: true,
        messages,
        count: messages.length,
      });
    } catch (error: any) {
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
   * Body: { messageType: 'text' | 'video' | 'voice' | 'image', content?: string, videoId?: string, audioUri?: string, audioDuration?: number, imageUri?: string, imageWidth?: number, imageHeight?: number }
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const {
        messageType,
        content,
        videoId,
        audioUri,
        audioDuration,
        imageUri,
        imageWidth,
        imageHeight,
      } = req.body;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

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

      if (messageType === 'voice' && !audioUri) {
        return res.status(400).json({ error: 'Audio URI is required for voice messages' });
      }

      if (messageType === 'image' && !imageUri) {
        return res.status(400).json({ error: 'Image URI is required for image messages' });
      }

      // Определить тип отправителя
      const senderType = userRole === 'jobseeker' ? 'jobseeker' : 'employer';

      // Создать сообщение
      const message = await chatService.createMessage({
        applicationId,
        senderId: userId,
        senderType,
        messageType,
        content,
        videoId,
        audioUri,
        audioDuration,
        imageUri,
        imageWidth,
        imageHeight,
      });

      return res.status(201).json({
        success: true,
        message,
      });
    } catch (error: any) {
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
  static async markAsRead(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const userRole = req.user!.role;

      // Отметить сообщения от другой стороны
      const otherSenderType = userRole === 'jobseeker' ? 'employer' : 'jobseeker';
      await chatService.markAsRead(applicationId, otherSenderType);

      return res.json({
        success: true,
        message: 'Messages marked as read',
      });
    } catch (error: any) {
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
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const userRole = req.user!.role;

      const userType = userRole === 'jobseeker' ? 'jobseeker' : 'employer';
      const count = await chatService.getUnreadCount(applicationId, userType);

      return res.json({
        success: true,
        unread_count: count,
      });
    } catch (error: any) {
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
  static async getMyChats(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (userRole !== 'jobseeker' && userRole !== 'employer') {
        return res.status(403).json({ error: 'Only jobseekers and employers can access chats' });
      }

      const chats = await chatService.getUserChats(userId, userRole);

      return res.json({
        success: true,
        chats,
        count: chats.length,
      });
    } catch (error: any) {
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
   * Query: deleteForAll=true|false
   */
  static async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { deleteForAll } = req.query;
      const userId = req.user!.userId;

      const deleteForAllBoolean = deleteForAll === 'true';

      await chatService.deleteMessage(messageId, userId, deleteForAllBoolean);

      return res.json({
        success: true,
        message: 'Message deleted successfully',
        deletedForAll: deleteForAllBoolean,
      });
    } catch (error: any) {
      console.error('Delete message error:', error);

      if (
        error.message.includes('not found') ||
        error.message.includes('Access denied') ||
        error.message.includes('Cannot delete for all')
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Failed to delete message',
        message: error.message,
      });
    }
  }

  // ===================================
  // ARCHITECTURE V3: VIDEO MESSAGE TRACKING
  // ===================================

  /**
   * Отследить просмотр видео в чате
   * POST /api/chat/messages/:messageId/track-view
   * Architecture v3: 2-view limit with auto-delete
   */
  static async trackVideoView(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;

      const result = await chatService.trackVideoView(messageId, userId);

      return res.json({
        success: result.success,
        viewsRemaining: result.views_remaining,
        autoDeleted: result.views_remaining === 0,
      });
    } catch (error: any) {
      console.error('Track video view error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Video message not found' });
      }

      if (error.message.includes('limit exceeded')) {
        return res.status(403).json({
          error: 'View limit exceeded',
          viewsRemaining: 0,
          autoDeleted: true,
        });
      }

      return res.status(500).json({
        error: 'Failed to track video view',
        message: error.message,
      });
    }
  }

  /**
   * Получить количество оставшихся просмотров видео
   * GET /api/chat/messages/:messageId/views
   */
  static async getVideoViews(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;

      const viewsRemaining = await chatService.getVideoViews(messageId, userId);

      return res.json({
        success: true,
        viewsRemaining,
      });
    } catch (error: any) {
      console.error('Get video views error:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({ error: 'Video message not found' });
      }

      return res.status(500).json({
        error: 'Failed to get video views',
        message: error.message,
      });
    }
  }
}
