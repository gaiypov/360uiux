/**
 * 360° РАБОТА - Chat Service
 * Architecture v3: Чат между соискателем и работодателем
 */

import { db } from '../config/database';
import { webSocketService } from './WebSocketService';
import { notificationService } from './NotificationService';

export type ChatSenderType = 'jobseeker' | 'employer' | 'system';
export type ChatMessageType = 'text' | 'video' | 'system';

interface CreateMessageParams {
  applicationId: string;
  senderId: string;
  senderType: ChatSenderType;
  messageType: ChatMessageType;
  content?: string;
  videoId?: string;
}

interface ChatMessage {
  id: string;
  application_id: string;
  sender_id: string;
  sender_type: ChatSenderType;
  message_type: ChatMessageType;
  content?: string;
  video_id?: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class ChatService {
  /**
   * Создать сообщение в чате
   */
  async createMessage(params: CreateMessageParams): Promise<ChatMessage> {
    try {
      console.log(`💬 Creating ${params.messageType} message in application ${params.applicationId}`);

      // Валидация
      if (params.messageType === 'text' && !params.content) {
        throw new Error('Content is required for text messages');
      }

      if (params.messageType === 'video' && !params.videoId) {
        throw new Error('Video ID is required for video messages');
      }

      // Создать сообщение
      const message = await db.one<ChatMessage>(
        `INSERT INTO chat_messages (
          application_id, sender_id, sender_type,
          message_type, content, video_id,
          is_read, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())
        RETURNING *`,
        [
          params.applicationId,
          params.senderId,
          params.senderType,
          params.messageType,
          params.content || null,
          params.videoId || null,
        ]
      );

      // WebSocket уведомление
      await this.sendWebSocketNotification(params.applicationId, message);

      // Push уведомление
      await this.sendPushNotification(params, message);

      console.log(`✅ Message created: ${message.id}`);

      return message;
    } catch (error: any) {
      console.error('❌ Error creating message:', error);
      throw error;
    }
  }

  /**
   * Получить все сообщения для отклика
   */
  async getMessages(applicationId: string, userId: string): Promise<ChatMessage[]> {
    try {
      // Проверить доступ (пользователь должен быть jobseeker или employer этого отклика)
      const application = await db.oneOrNone(
        `SELECT a.*, v.employer_id
         FROM applications a
         JOIN vacancies v ON v.id = a.vacancy_id
         WHERE a.id = $1`,
        [applicationId]
      );

      if (!application) {
        throw new Error('Application not found');
      }

      const isJobseeker = application.jobseeker_id === userId;
      const isEmployer = application.employer_id === userId;

      if (!isJobseeker && !isEmployer) {
        throw new Error('Access denied: you are not part of this conversation');
      }

      // Получить сообщения
      const messages = await db.manyOrNone<ChatMessage>(
        `SELECT * FROM chat_messages
         WHERE application_id = $1
         ORDER BY created_at ASC`,
        [applicationId]
      );

      // Обновить статус прочитанных для текущего пользователя
      // Прочитать все сообщения от другой стороны
      const otherSenderType = isJobseeker ? 'employer' : 'jobseeker';
      await this.markAsRead(applicationId, otherSenderType);

      return messages || [];
    } catch (error: any) {
      console.error('❌ Error getting messages:', error);
      throw error;
    }
  }

  /**
   * Отметить сообщения как прочитанные
   */
  async markAsRead(applicationId: string, senderType: ChatSenderType): Promise<void> {
    try {
      await db.none(
        `UPDATE chat_messages
         SET is_read = true, read_at = NOW(), updated_at = NOW()
         WHERE application_id = $1
         AND sender_type = $2
         AND is_read = false`,
        [applicationId, senderType]
      );

      console.log(`✅ Messages marked as read in application ${applicationId}`);
    } catch (error: any) {
      console.error('❌ Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Получить количество непрочитанных сообщений
   */
  async getUnreadCount(applicationId: string, userType: ChatSenderType): Promise<number> {
    try {
      // Подсчитать непрочитанные от другой стороны
      const otherType = userType === 'jobseeker' ? 'employer' : 'jobseeker';

      const result = await db.one<{ count: string }>(
        `SELECT COUNT(*) as count
         FROM chat_messages
         WHERE application_id = $1
         AND sender_type = $2
         AND is_read = false`,
        [applicationId, otherType]
      );

      return parseInt(result.count, 10);
    } catch (error: any) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Создать системное сообщение
   * (например, "Соискатель откликнулся на вакансию")
   */
  async createSystemMessage(
    applicationId: string,
    content: string
  ): Promise<ChatMessage> {
    return this.createMessage({
      applicationId,
      senderId: 'system',
      senderType: 'system',
      messageType: 'system',
      content,
    });
  }

  /**
   * Создать сообщение с видео-резюме
   * Architecture v3: Автоматически при создании отклика
   */
  async createVideoMessage(
    applicationId: string,
    senderId: string,
    videoId: string
  ): Promise<ChatMessage> {
    return this.createMessage({
      applicationId,
      senderId,
      senderType: 'jobseeker',
      messageType: 'video',
      content: '📹 Видео-резюме (доступно 2 просмотра)',
      videoId,
    });
  }

  /**
   * Получить последнее сообщение для отклика
   */
  async getLastMessage(applicationId: string): Promise<ChatMessage | null> {
    try {
      const message = await db.oneOrNone<ChatMessage>(
        `SELECT * FROM chat_messages
         WHERE application_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [applicationId]
      );

      return message;
    } catch (error: any) {
      console.error('❌ Error getting last message:', error);
      return null;
    }
  }

  /**
   * Получить все чаты для пользователя
   * (список откликов с последними сообщениями)
   */
  async getUserChats(userId: string, userRole: 'jobseeker' | 'employer') {
    try {
      let query: string;

      if (userRole === 'jobseeker') {
        // Соискатель видит чаты по своим откликам
        query = `
          SELECT
            a.id as application_id,
            a.vacancy_id,
            a.status,
            a.created_at as applied_at,
            v.title as vacancy_title,
            u.company_name as employer_name,
            u.id as employer_id,
            (
              SELECT COUNT(*)
              FROM chat_messages cm
              WHERE cm.application_id = a.id
              AND cm.sender_type = 'employer'
              AND cm.is_read = false
            ) as unread_count,
            (
              SELECT cm.*
              FROM chat_messages cm
              WHERE cm.application_id = a.id
              ORDER BY cm.created_at DESC
              LIMIT 1
            ) as last_message
          FROM applications a
          JOIN vacancies v ON v.id = a.vacancy_id
          JOIN users u ON u.id = v.employer_id
          WHERE a.jobseeker_id = $1
          ORDER BY a.created_at DESC
        `;
      } else {
        // Работодатель видит чаты по откликам на свои вакансии
        query = `
          SELECT
            a.id as application_id,
            a.vacancy_id,
            a.status,
            a.created_at as applied_at,
            v.title as vacancy_title,
            u.name as jobseeker_name,
            u.profession as jobseeker_profession,
            u.id as jobseeker_id,
            (
              SELECT COUNT(*)
              FROM chat_messages cm
              WHERE cm.application_id = a.id
              AND cm.sender_type = 'jobseeker'
              AND cm.is_read = false
            ) as unread_count,
            (
              SELECT row_to_json(cm.*)
              FROM chat_messages cm
              WHERE cm.application_id = a.id
              ORDER BY cm.created_at DESC
              LIMIT 1
            ) as last_message
          FROM applications a
          JOIN vacancies v ON v.id = a.vacancy_id
          JOIN users u ON u.id = a.jobseeker_id
          WHERE v.employer_id = $1
          ORDER BY a.created_at DESC
        `;
      }

      const chats = await db.manyOrNone(query, [userId]);

      return chats || [];
    } catch (error: any) {
      console.error('❌ Error getting user chats:', error);
      throw error;
    }
  }

  /**
   * Удалить сообщение (только свои)
   */
  async deleteMessage(
    messageId: string,
    userId: string,
    deleteForAll: boolean = false
  ): Promise<void> {
    try {
      // Получить сообщение перед удалением
      const message = await db.oneOrNone<ChatMessage>(
        'SELECT * FROM chat_messages WHERE id = $1 AND sender_id = $2',
        [messageId, userId]
      );

      if (!message) {
        throw new Error('Message not found or access denied');
      }

      // Проверить можно ли удалить для всех (в течение 5 минут)
      if (deleteForAll) {
        const messageAge = Date.now() - new Date(message.created_at).getTime();
        const fiveMinutes = 5 * 60 * 1000;

        if (messageAge > fiveMinutes) {
          throw new Error('Cannot delete for all: message is older than 5 minutes');
        }
      }

      // Удалить сообщение
      const result = await db.result(
        `DELETE FROM chat_messages WHERE id = $1`,
        [messageId]
      );

      if (result.rowCount === 0) {
        throw new Error('Failed to delete message');
      }

      // Отправить WebSocket событие
      webSocketService.emitMessageDeleted(message.application_id, {
        messageId: messageId,
        applicationId: message.application_id,
        deletedBy: userId,
        deletedForAll: deleteForAll,
      });

      console.log(
        `🗑️ Message deleted: ${messageId} (deleteForAll: ${deleteForAll})`
      );
    } catch (error: any) {
      console.error('❌ Error deleting message:', error);
      throw error;
    }
  }

  /**
   * WebSocket notification
   */
  private async sendWebSocketNotification(applicationId: string, message: ChatMessage) {
    try {
      // Получить информацию о чате (application)
      const application = await db.oneOrNone(
        `SELECT a.*, v.employer_id, j.name as jobseeker_name, j.avatar_url as jobseeker_avatar
         FROM applications a
         JOIN vacancies v ON v.id = a.vacancy_id
         LEFT JOIN users j ON j.id = a.jobseeker_id
         WHERE a.id = $1`,
        [applicationId]
      );

      if (!application) {
        console.warn(`⚠️ Application not found: ${applicationId}`);
        return;
      }

      // Определить получателя (кто НЕ отправитель)
      const recipientId =
        message.sender_type === 'jobseeker'
          ? application.employer_id
          : application.jobseeker_id;

      // Получить информацию об отправителе
      const sender = await db.oneOrNone(
        'SELECT id, name, avatar_url FROM users WHERE id = $1',
        [message.sender_id]
      );

      // Отправить WebSocket событие
      webSocketService.emitMessageNew(applicationId, recipientId, {
        messageId: message.id,
        applicationId: message.application_id,
        senderId: message.sender_id,
        senderName: sender?.name || 'Unknown',
        senderAvatar: sender?.avatar_url,
        messageType: message.message_type,
        content: message.content,
        createdAt: message.created_at.toISOString(),
      });

      console.log(`🔔 WebSocket notification sent for application ${applicationId}`);
    } catch (error: any) {
      console.error('❌ Error sending WebSocket notification:', error);
      // Не бросаем ошибку, чтобы не прервать создание сообщения
    }
  }

  // ===================================
  // ARCHITECTURE V3: VIDEO MESSAGE TRACKING
  // ===================================

  /**
   * Отследить просмотр видео в сообщении чата
   * Architecture v3: 2-view limit with auto-delete
   */
  async trackVideoView(messageId: string, userId: string): Promise<{ success: boolean; views_remaining: number }> {
    try {
      console.log(`🎥 Tracking video view for message ${messageId} by user ${userId}`);

      // Вызвать функцию track_message_video_view
      const result = await db.one<{ success: boolean; views_remaining: number }>(
        'SELECT * FROM track_message_video_view($1, $2)',
        [messageId, userId]
      );

      if (!result.success) {
        if (result.views_remaining === 0) {
          throw new Error('View limit exceeded');
        }
        throw new Error('Failed to track video view');
      }

      console.log(`✅ Video view tracked. Views remaining: ${result.views_remaining}`);

      // Получить информацию о сообщении для WebSocket
      const message = await db.oneOrNone<ChatMessage>(
        'SELECT * FROM chat_messages WHERE id = $1',
        [messageId]
      );

      if (message) {
        // Получить информацию о зрителе
        const viewer = await db.oneOrNone(
          'SELECT id, name, avatar_url FROM users WHERE id = $1',
          [userId]
        );

        // Отправить WebSocket событие отправителю видео
        webSocketService.emitVideoViewed(message.sender_id, {
          videoId: message.video_id || messageId,
          messageId: messageId,
          userId: userId,
          userName: viewer?.name || 'Unknown',
          userAvatar: viewer?.avatar_url,
          viewedAt: new Date().toISOString(),
          viewsRemaining: result.views_remaining,
        });

        // Если видео удалено (0 просмотров осталось), отправить событие удаления
        if (result.views_remaining === 0) {
          webSocketService.emitVideoDeleted(message.application_id, {
            videoId: message.video_id || messageId,
            messageId: messageId,
            deletedAt: new Date().toISOString(),
          });
        }
      }

      return result;
    } catch (error: any) {
      console.error('❌ Error tracking video view:', error);
      throw error;
    }
  }

  /**
   * Получить количество оставшихся просмотров для видео в сообщении
   */
  async getVideoViews(messageId: string, userId: string): Promise<number> {
    try {
      // Получить сообщение
      const message = await db.oneOrNone<ChatMessage & { video_views_remaining?: number }>(
        `SELECT * FROM chat_messages
         WHERE id = $1 AND message_type = 'video'`,
        [messageId]
      );

      if (!message) {
        throw new Error('Video message not found');
      }

      // Если пользователь автор, возвращаем текущее количество просмотров
      if (message.sender_id === userId) {
        return message.video_views_remaining || 2;
      }

      // Для других пользователей возвращаем оставшиеся просмотры
      return message.video_views_remaining || 2;
    } catch (error: any) {
      console.error('❌ Error getting video views:', error);
      throw error;
    }
  }

  /**
   * Отправить push уведомление о новом сообщении
   */
  private async sendPushNotification(
    params: CreateMessageParams,
    message: ChatMessage
  ): Promise<void> {
    try {
      // Получить информацию об отклике для уведомления
      const application = await db.oneOrNone(
        `SELECT
          a.id,
          a.jobseeker_id,
          v.employer_id,
          v.title as vacancy_title,
          u_jobseeker.name as jobseeker_name,
          u_employer.name as employer_name
        FROM applications a
        JOIN vacancies v ON v.id = a.vacancy_id
        JOIN users u_jobseeker ON u_jobseeker.id = a.jobseeker_id
        JOIN users u_employer ON u_employer.id = v.employer_id
        WHERE a.id = $1`,
        [params.applicationId]
      );

      if (!application) {
        console.warn('⚠️  Application not found for push notification');
        return;
      }

      // Определить получателя (кому отправить уведомление)
      const recipientId =
        params.senderType === 'jobseeker'
          ? application.employer_id
          : application.jobseeker_id;

      const senderName =
        params.senderType === 'jobseeker'
          ? application.jobseeker_name
          : application.employer_name;

      // Определить preview сообщения
      let messagePreview = '';
      if (params.messageType === 'text') {
        messagePreview = params.content || 'Новое сообщение';
      } else if (params.messageType === 'video') {
        messagePreview = '📹 Отправил видео';
      }

      // Отправить push уведомление
      await notificationService.notifyNewMessage({
        recipientId,
        senderName,
        messagePreview,
        applicationId: params.applicationId,
      });

      console.log(`✅ Push notification sent to ${recipientId}`);
    } catch (error: any) {
      // Не бросаем ошибку, чтобы не блокировать создание сообщения
      console.error('❌ Error sending push notification:', error);
    }
  }
}

// Singleton export
export const chatService = new ChatService();
