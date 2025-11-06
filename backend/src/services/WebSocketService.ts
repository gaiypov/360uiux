/**
 * 360° РАБОТА - WebSocket Service
 * Real-time notifications using Socket.io
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';

export interface WebSocketUser {
  userId: string;
  socketId: string;
  role: 'jobseeker' | 'employer';
}

// Event types
export interface VideoViewedEvent {
  videoId: string;
  messageId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  viewedAt: string;
  viewsRemaining: number;
}

export interface VideoDeletedEvent {
  videoId: string;
  messageId: string;
  deletedAt: string;
}

export interface MessageNewEvent {
  messageId: string;
  applicationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messageType: 'text' | 'video' | 'voice' | 'image';
  content?: string;
  createdAt: string;
}

export interface MessageDeletedEvent {
  messageId: string;
  applicationId: string;
  deletedBy: string;
  deletedForAll: boolean;
}

export interface ApplicationStatusChangedEvent {
  applicationId: string;
  newStatus: string;
  previousStatus: string;
  changedBy: string;
  changedAt: string;
  message?: string;
}

class WebSocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> Set<socketId>

  /**
   * Инициализировать WebSocket сервер
   */
  initialize(httpServer: HTTPServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || '*',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupConnectionHandlers();

    console.log('✅ WebSocket service initialized');
  }

  /**
   * Настроить обработчики подключений
   */
  private setupConnectionHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Аутентификация пользователя
      socket.on('authenticate', (data: { userId: string; role: 'jobseeker' | 'employer' }) => {
        const { userId, role } = data;

        // Добавить пользователя в карту подключенных
        if (!this.connectedUsers.has(userId)) {
          this.connectedUsers.set(userId, new Set());
        }
        this.connectedUsers.get(userId)!.add(socket.id);

        // Присоединить к room пользователя
        socket.join(`user:${userId}`);
        socket.join(`role:${role}`);

        // Сохранить данные в socket
        socket.data.userId = userId;
        socket.data.role = role;

        console.log(`✅ User authenticated: ${userId} (${role}), socket: ${socket.id}`);

        socket.emit('authenticated', { success: true, userId });
      });

      // Присоединиться к чату (application)
      socket.on('join:application', (applicationId: string) => {
        socket.join(`application:${applicationId}`);
        console.log(`📱 Socket ${socket.id} joined application:${applicationId}`);
      });

      // Покинуть чат
      socket.on('leave:application', (applicationId: string) => {
        socket.leave(`application:${applicationId}`);
        console.log(`📱 Socket ${socket.id} left application:${applicationId}`);
      });

      // Typing indicator
      socket.on('typing:start', (applicationId: string) => {
        const userId = socket.data.userId;
        socket.to(`application:${applicationId}`).emit('typing:start', { userId });
      });

      socket.on('typing:stop', (applicationId: string) => {
        const userId = socket.data.userId;
        socket.to(`application:${applicationId}`).emit('typing:stop', { userId });
      });

      // Отключение
      socket.on('disconnect', () => {
        const userId = socket.data.userId;

        if (userId && this.connectedUsers.has(userId)) {
          this.connectedUsers.get(userId)!.delete(socket.id);

          // Если у пользователя больше нет активных соединений, удалить из карты
          if (this.connectedUsers.get(userId)!.size === 0) {
            this.connectedUsers.delete(userId);
          }
        }

        console.log(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Получить Socket.io сервер
   */
  getIO(): Server {
    if (!this.io) {
      throw new Error('WebSocket service not initialized');
    }
    return this.io;
  }

  /**
   * Проверить подключен ли пользователь
   */
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  /**
   * Получить количество активных подключений пользователя
   */
  getUserConnectionsCount(userId: string): number {
    return this.connectedUsers.get(userId)?.size || 0;
  }

  // ===================================
  // EVENT EMITTERS
  // ===================================

  /**
   * Отправить событие "видео просмотрено"
   */
  emitVideoViewed(senderId: string, event: VideoViewedEvent) {
    if (!this.io) return;

    // Отправить отправителю видео
    this.io.to(`user:${senderId}`).emit('video:viewed', event);

    console.log(`📹 Video viewed event sent to user ${senderId}`);
  }

  /**
   * Отправить событие "видео удалено"
   */
  emitVideoDeleted(applicationId: string, event: VideoDeletedEvent) {
    if (!this.io) return;

    // Отправить всем участникам чата
    this.io.to(`application:${applicationId}`).emit('video:deleted', event);

    console.log(`🗑️ Video deleted event sent to application ${applicationId}`);
  }

  /**
   * Отправить событие "новое сообщение"
   */
  emitMessageNew(applicationId: string, recipientId: string, event: MessageNewEvent) {
    if (!this.io) return;

    // Отправить получателю
    this.io.to(`user:${recipientId}`).emit('message:new', event);

    // Также отправить всем в чате (для обновления UI)
    this.io.to(`application:${applicationId}`).emit('message:new', event);

    console.log(`💬 New message event sent to application ${applicationId}`);
  }

  /**
   * Отправить событие "сообщение удалено"
   */
  emitMessageDeleted(applicationId: string, event: MessageDeletedEvent) {
    if (!this.io) return;

    if (event.deletedForAll) {
      // Удалено для всех - отправить всем участникам
      this.io.to(`application:${applicationId}`).emit('message:deleted', event);
    } else {
      // Удалено только для себя - отправить только удалившему
      this.io.to(`user:${event.deletedBy}`).emit('message:deleted', event);
    }

    console.log(`🗑️ Message deleted event sent to application ${applicationId}`);
  }

  /**
   * Отправить событие "статус отклика изменен"
   */
  emitApplicationStatusChanged(jobseekerId: string, event: ApplicationStatusChangedEvent) {
    if (!this.io) return;

    // Отправить соискателю
    this.io.to(`user:${jobseekerId}`).emit('application:status_changed', event);

    console.log(`📋 Application status changed event sent to user ${jobseekerId}`);
  }

  /**
   * Отправить событие "новый отклик" работодателю
   */
  emitApplicationNew(employerId: string, event: any) {
    if (!this.io) return;

    // Отправить работодателю
    this.io.to(`user:${employerId}`).emit('application:new', event);

    console.log(`📋 New application event sent to employer ${employerId}`);
  }

  /**
   * Отправить кастомное событие пользователю
   */
  emitToUser(userId: string, eventName: string, data: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(eventName, data);

    console.log(`📤 Event ${eventName} sent to user ${userId}`);
  }

  /**
   * Отправить кастомное событие в чат (application)
   */
  emitToApplication(applicationId: string, eventName: string, data: any) {
    if (!this.io) return;

    this.io.to(`application:${applicationId}`).emit(eventName, data);

    console.log(`📤 Event ${eventName} sent to application ${applicationId}`);
  }

  /**
   * Broadcast событие всем подключенным пользователям
   */
  broadcast(eventName: string, data: any) {
    if (!this.io) return;

    this.io.emit(eventName, data);

    console.log(`📡 Broadcast event ${eventName} to all users`);
  }
}

// Singleton export
export const webSocketService = new WebSocketService();
