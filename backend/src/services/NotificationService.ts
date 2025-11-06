/**
 * 360° РАБОТА - Push Notification Service
 *
 * Сервис для отправки push уведомлений через OneSignal
 * Architecture v3: Real-time notifications for chat, video views, status changes
 */

import axios from 'axios';

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID || 'YOUR_ONESIGNAL_APP_ID';
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY || 'YOUR_REST_API_KEY';
const ONESIGNAL_API_URL = 'https://onesignal.com/api/v1';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  userId?: string; // External User ID
  userIds?: string[]; // Multiple users
  segment?: string; // Segment name (e.g., 'All', 'Jobseekers', 'Employers')
  largeIcon?: string;
  bigPicture?: string;
}

interface OneSignalResponse {
  id: string;
  recipients: number;
  errors?: any;
}

class NotificationService {
  private apiKey: string;
  private appId: string;

  constructor() {
    this.apiKey = ONESIGNAL_REST_API_KEY;
    this.appId = ONESIGNAL_APP_ID;

    if (!this.apiKey || this.apiKey === 'YOUR_REST_API_KEY') {
      console.warn('⚠️  OneSignal REST API Key not configured');
    } else {
      console.log('✅ Notification service initialized');
    }
  }

  /**
   * Отправить уведомление одному пользователю
   */
  async sendToUser(
    userId: string,
    payload: Omit<NotificationPayload, 'userId' | 'userIds'>
  ): Promise<OneSignalResponse> {
    try {
      console.log(`📬 Sending notification to user ${userId}:`, payload.title);

      const response = await axios.post(
        `${ONESIGNAL_API_URL}/notifications`,
        {
          app_id: this.appId,
          include_external_user_ids: [userId],
          headings: { en: payload.title },
          contents: { en: payload.body },
          data: payload.data || {},
          large_icon: payload.largeIcon,
          big_picture: payload.bigPicture,
          // iOS настройки
          ios_badgeType: 'Increase',
          ios_badgeCount: 1,
          // Android настройки
          android_accent_color: '8B5CF6',
          small_icon: 'ic_notification',
        },
        {
          headers: {
            Authorization: `Basic ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Notification sent successfully: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to send notification:', error.response?.data || error.message);
      throw new Error(`Notification send failed: ${error.message}`);
    }
  }

  /**
   * Отправить уведомление нескольким пользователям
   */
  async sendToUsers(
    userIds: string[],
    payload: Omit<NotificationPayload, 'userId' | 'userIds'>
  ): Promise<OneSignalResponse> {
    try {
      console.log(`📬 Sending notification to ${userIds.length} users:`, payload.title);

      const response = await axios.post(
        `${ONESIGNAL_API_URL}/notifications`,
        {
          app_id: this.appId,
          include_external_user_ids: userIds,
          headings: { en: payload.title },
          contents: { en: payload.body },
          data: payload.data || {},
          large_icon: payload.largeIcon,
          big_picture: payload.bigPicture,
          ios_badgeType: 'Increase',
          ios_badgeCount: 1,
          android_accent_color: '8B5CF6',
          small_icon: 'ic_notification',
        },
        {
          headers: {
            Authorization: `Basic ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Notification sent to ${response.data.recipients} users`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to send notification:', error.response?.data || error.message);
      throw new Error(`Notification send failed: ${error.message}`);
    }
  }

  /**
   * Отправить уведомление сегменту пользователей
   */
  async sendToSegment(
    segment: string,
    payload: Omit<NotificationPayload, 'userId' | 'userIds' | 'segment'>
  ): Promise<OneSignalResponse> {
    try {
      console.log(`📬 Sending notification to segment "${segment}":`, payload.title);

      const response = await axios.post(
        `${ONESIGNAL_API_URL}/notifications`,
        {
          app_id: this.appId,
          included_segments: [segment],
          headings: { en: payload.title },
          contents: { en: payload.body },
          data: payload.data || {},
          large_icon: payload.largeIcon,
          big_picture: payload.bigPicture,
          ios_badgeType: 'Increase',
          ios_badgeCount: 1,
          android_accent_color: '8B5CF6',
          small_icon: 'ic_notification',
        },
        {
          headers: {
            Authorization: `Basic ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Notification sent to segment: ${response.data.recipients} recipients`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to send notification:', error.response?.data || error.message);
      throw new Error(`Notification send failed: ${error.message}`);
    }
  }

  // ===================================
  // BUSINESS LOGIC NOTIFICATIONS
  // ===================================

  /**
   * Уведомление о новом сообщении в чате
   */
  async notifyNewMessage(params: {
    recipientId: string;
    senderName: string;
    messagePreview: string;
    applicationId: string;
  }) {
    return this.sendToUser(params.recipientId, {
      title: `${params.senderName}`,
      body: params.messagePreview,
      data: {
        type: 'new_message',
        applicationId: params.applicationId,
        senderName: params.senderName,
      },
    });
  }

  /**
   * Уведомление об изменении статуса отклика
   */
  async notifyStatusChange(params: {
    recipientId: string;
    vacancyTitle: string;
    newStatus: string;
    applicationId: string;
  }) {
    const statusMessages: Record<string, string> = {
      viewed: 'Ваш отклик просмотрен',
      interview: 'Вас приглашают на собеседование!',
      hired: 'Поздравляем! Вы приняты на работу!',
      rejected: 'К сожалению, отклик отклонен',
    };

    const message = statusMessages[params.newStatus] || 'Статус отклика изменен';

    return this.sendToUser(params.recipientId, {
      title: params.vacancyTitle,
      body: message,
      data: {
        type: 'status_change',
        applicationId: params.applicationId,
        newStatus: params.newStatus,
      },
    });
  }

  /**
   * Уведомление о просмотре видео
   */
  async notifyVideoViewed(params: {
    recipientId: string;
    viewerName: string;
    viewsRemaining: number;
    applicationId: string;
  }) {
    const message =
      params.viewsRemaining > 0
        ? `Осталось просмотров: ${params.viewsRemaining}`
        : 'Видео удалено после 2 просмотров';

    return this.sendToUser(params.recipientId, {
      title: `${params.viewerName} посмотрел ваше видео`,
      body: message,
      data: {
        type: 'video_viewed',
        applicationId: params.applicationId,
        viewsRemaining: params.viewsRemaining,
      },
    });
  }

  /**
   * Уведомление о новом отклике (для работодателя)
   */
  async notifyNewApplication(params: {
    employerId: string;
    jobseekerName: string;
    vacancyTitle: string;
    applicationId: string;
  }) {
    return this.sendToUser(params.employerId, {
      title: 'Новый отклик!',
      body: `${params.jobseekerName} откликнулся на вакансию "${params.vacancyTitle}"`,
      data: {
        type: 'new_application',
        applicationId: params.applicationId,
        jobseekerName: params.jobseekerName,
      },
    });
  }

  /**
   * Уведомление о приглашении на собеседование
   */
  async notifyInterviewInvite(params: {
    jobseekerId: string;
    companyName: string;
    vacancyTitle: string;
    interviewDate?: string;
    applicationId: string;
  }) {
    const body = params.interviewDate
      ? `Собеседование назначено на ${params.interviewDate}`
      : 'Вас приглашают на собеседование';

    return this.sendToUser(params.jobseekerId, {
      title: `${params.companyName} - ${params.vacancyTitle}`,
      body,
      data: {
        type: 'interview_invite',
        applicationId: params.applicationId,
        companyName: params.companyName,
        interviewDate: params.interviewDate,
      },
    });
  }

  /**
   * Массовое уведомление (broadcast)
   */
  async sendBroadcast(params: {
    title: string;
    message: string;
    segment: 'All' | 'Jobseekers' | 'Employers';
    data?: Record<string, any>;
  }) {
    return this.sendToSegment(params.segment, {
      title: params.title,
      body: params.message,
      data: params.data || {},
    });
  }

  /**
   * Получить статистику уведомления
   */
  async getNotificationStats(notificationId: string) {
    try {
      const response = await axios.get(
        `${ONESIGNAL_API_URL}/notifications/${notificationId}?app_id=${this.appId}`,
        {
          headers: {
            Authorization: `Basic ${this.apiKey}`,
          },
        }
      );

      return {
        id: response.data.id,
        successful: response.data.successful,
        failed: response.data.failed,
        converted: response.data.converted,
        remaining: response.data.remaining,
      };
    } catch (error: any) {
      console.error('❌ Failed to get notification stats:', error.response?.data || error.message);
      throw new Error(`Get notification stats failed: ${error.message}`);
    }
  }
}

export const notificationService = new NotificationService();
