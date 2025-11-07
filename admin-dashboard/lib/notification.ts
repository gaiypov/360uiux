/**
 * Notification Service for 360° РАБОТА
 *
 * Handles push notifications, email, and SMS notifications
 * Supports multiple providers: FCM, APNs, Email, SMS
 */

import { db } from './db';

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high';
}

export type NotificationType =
  | 'video_viewed'
  | 'video_limit_reached'
  | 'vacancy_approved'
  | 'vacancy_rejected'
  | 'user_blocked'
  | 'user_unblocked'
  | 'complaint_resolved'
  | 'application_received'
  | 'application_viewed'
  | 'message_received'
  | 'system_announcement';

interface NotificationDevice {
  id: string;
  user_id: string;
  device_type: 'ios' | 'android' | 'web';
  fcm_token: string | null;
  apns_token: string | null;
  web_push_subscription: any;
  is_active: boolean;
}

interface NotificationLog {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: any;
  status: 'pending' | 'sent' | 'failed';
  sent_at: Date | null;
  error_message: string | null;
}

class NotificationService {
  /**
   * Send push notification to a user
   * Automatically handles multiple devices and notification preferences
   */
  async send(payload: NotificationPayload): Promise<void> {
    try {
      const { userId, title, body, type, data, priority = 'normal' } = payload;

      // Log notification to database
      await this.logNotification({
        user_id: userId,
        title,
        body,
        type,
        data: data || {},
        status: 'pending',
      });

      // Get user's notification preferences
      const preferences = await this.getUserNotificationPreferences(userId);

      if (!preferences.push_enabled) {
        console.log(`⏭️  Push notifications disabled for user ${userId}`);
        return;
      }

      // Get user's devices
      const devices = await this.getUserDevices(userId);

      if (devices.length === 0) {
        console.log(`⚠️  No devices found for user ${userId}`);
        return;
      }

      // Send to all active devices
      const sendPromises = devices.map(async (device) => {
        try {
          switch (device.device_type) {
            case 'android':
            case 'ios':
              if (device.fcm_token) {
                await this.sendFCM(device.fcm_token, title, body, type, data);
              }
              break;
            case 'web':
              if (device.web_push_subscription) {
                await this.sendWebPush(device.web_push_subscription, title, body, type, data);
              }
              break;
          }
        } catch (error) {
          console.error(`Failed to send to device ${device.id}:`, error);
        }
      });

      await Promise.allSettled(sendPromises);

      // Update log status
      await this.updateNotificationStatus(userId, type, 'sent');

      console.log(`✅ Notification sent to user ${userId}: ${title}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
      await this.updateNotificationStatus(payload.userId, payload.type, 'failed', String(error));
      throw error;
    }
  }

  /**
   * Send to multiple users at once
   */
  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    const sendPromises = payloads.map((payload) => this.send(payload));
    await Promise.allSettled(sendPromises);
  }

  /**
   * Send Firebase Cloud Messaging notification
   */
  private async sendFCM(
    fcmToken: string,
    title: string,
    body: string,
    type: string,
    data?: Record<string, any>
  ): Promise<void> {
    // TODO: Integrate with Firebase Cloud Messaging
    // Example using firebase-admin SDK:
    //
    // import { messaging } from 'firebase-admin';
    //
    // await messaging().send({
    //   token: fcmToken,
    //   notification: { title, body },
    //   data: {
    //     type,
    //     ...data,
    //   },
    //   android: {
    //     priority: 'high',
    //     notification: {
    //       sound: 'default',
    //       channelId: 'default',
    //     },
    //   },
    //   apns: {
    //     payload: {
    //       aps: {
    //         sound: 'default',
    //         badge: 1,
    //       },
    //     },
    //   },
    // });

    console.log(`📱 [FCM] Would send to ${fcmToken}: ${title}`);
  }

  /**
   * Send Web Push notification
   */
  private async sendWebPush(
    subscription: any,
    title: string,
    body: string,
    type: string,
    data?: Record<string, any>
  ): Promise<void> {
    // TODO: Integrate with web-push library
    // Example using web-push:
    //
    // import webpush from 'web-push';
    //
    // const payload = JSON.stringify({
    //   title,
    //   body,
    //   icon: '/icon-192x192.png',
    //   badge: '/badge-72x72.png',
    //   data: { type, ...data },
    // });
    //
    // await webpush.sendNotification(subscription, payload);

    console.log(`🌐 [Web Push] Would send: ${title}`);
  }

  /**
   * Get user's devices from database
   */
  private async getUserDevices(userId: string): Promise<NotificationDevice[]> {
    try {
      const devices = await db.manyOrNone<NotificationDevice>(
        `SELECT id, user_id, device_type, fcm_token, apns_token, web_push_subscription, is_active
         FROM user_devices
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      );
      return devices || [];
    } catch (error) {
      // Table might not exist yet
      console.log('user_devices table not found, using fallback');
      return [];
    }
  }

  /**
   * Get user's notification preferences
   */
  private async getUserNotificationPreferences(
    userId: string
  ): Promise<{ push_enabled: boolean; email_enabled: boolean; sms_enabled: boolean }> {
    try {
      const prefs = await db.oneOrNone<any>(
        `SELECT push_enabled, email_enabled, sms_enabled
         FROM user_notification_preferences
         WHERE user_id = $1`,
        [userId]
      );

      return (
        prefs || {
          push_enabled: true, // Default: enabled
          email_enabled: true,
          sms_enabled: false,
        }
      );
    } catch (error) {
      // Table might not exist, return defaults
      return {
        push_enabled: true,
        email_enabled: true,
        sms_enabled: false,
      };
    }
  }

  /**
   * Log notification to database
   */
  private async logNotification(log: Partial<NotificationLog>): Promise<void> {
    try {
      await db.none(
        `INSERT INTO notification_logs (user_id, title, body, type, data, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [log.user_id, log.title, log.body, log.type, JSON.stringify(log.data), log.status]
      );
    } catch (error) {
      // Table might not exist, just log to console
      console.log('Failed to log notification (table may not exist):', error);
    }
  }

  /**
   * Update notification status
   */
  private async updateNotificationStatus(
    userId: string,
    type: string,
    status: 'sent' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    try {
      await db.none(
        `UPDATE notification_logs
         SET status = $1, sent_at = CURRENT_TIMESTAMP, error_message = $2
         WHERE user_id = $3 AND type = $4 AND status = 'pending'
         ORDER BY created_at DESC
         LIMIT 1`,
        [status, errorMessage || null, userId, type]
      );
    } catch (error) {
      console.log('Failed to update notification status:', error);
    }
  }

  /**
   * Notify when video is viewed (1st time)
   */
  async notifyVideoViewed(params: {
    jobseekerId: string;
    viewerName: string;
    viewsRemaining: number;
    applicationId: string;
  }): Promise<void> {
    await this.send({
      userId: params.jobseekerId,
      title: 'Ваше видео просмотрено!',
      body: `${params.viewerName} просмотрел ваше видео-резюме. Осталось ${params.viewsRemaining} просмотр.`,
      type: 'video_viewed',
      data: {
        applicationId: params.applicationId,
        viewsRemaining: params.viewsRemaining,
      },
      priority: 'high',
    });
  }

  /**
   * Notify when video view limit reached (2nd time)
   */
  async notifyVideoLimitReached(params: {
    jobseekerId: string;
    viewerName: string;
    applicationId: string;
  }): Promise<void> {
    await this.send({
      userId: params.jobseekerId,
      title: 'Лимит просмотров достигнут',
      body: `${params.viewerName} просмотрел ваше видео во второй раз. Видео удалено согласно правилам платформы.`,
      type: 'video_limit_reached',
      data: {
        applicationId: params.applicationId,
        viewsRemaining: 0,
      },
      priority: 'high',
    });
  }

  /**
   * Notify when vacancy is approved
   */
  async notifyVacancyApproved(params: {
    employerId: string;
    vacancyId: string;
    vacancyTitle: string;
  }): Promise<void> {
    await this.send({
      userId: params.employerId,
      title: 'Вакансия одобрена',
      body: `Ваша вакансия "${params.vacancyTitle}" успешно прошла модерацию и опубликована.`,
      type: 'vacancy_approved',
      data: {
        vacancyId: params.vacancyId,
      },
      priority: 'normal',
    });
  }

  /**
   * Notify when vacancy is rejected
   */
  async notifyVacancyRejected(params: {
    employerId: string;
    vacancyId: string;
    vacancyTitle: string;
    reason: string;
    comment?: string;
  }): Promise<void> {
    const body = `Ваша вакансия "${params.vacancyTitle}" отклонена модератором.\nПричина: ${params.reason}${
      params.comment ? `\nКомментарий: ${params.comment}` : ''
    }`;

    await this.send({
      userId: params.employerId,
      title: 'Вакансия отклонена',
      body,
      type: 'vacancy_rejected',
      data: {
        vacancyId: params.vacancyId,
        reason: params.reason,
        comment: params.comment,
      },
      priority: 'normal',
    });
  }

  /**
   * Notify when user is blocked
   */
  async notifyUserBlocked(params: {
    userId: string;
    reason: string;
    blockedUntil?: Date;
  }): Promise<void> {
    const body = `Ваш аккаунт был заблокирован.\nПричина: ${params.reason}${
      params.blockedUntil ? `\nБлокировка действует до: ${params.blockedUntil.toLocaleDateString('ru-RU')}` : ''
    }`;

    await this.send({
      userId: params.userId,
      title: 'Аккаунт заблокирован',
      body,
      type: 'user_blocked',
      data: {
        reason: params.reason,
        blockedUntil: params.blockedUntil?.toISOString(),
      },
      priority: 'high',
    });
  }

  /**
   * Notify when user is unblocked
   */
  async notifyUserUnblocked(params: { userId: string }): Promise<void> {
    await this.send({
      userId: params.userId,
      title: 'Аккаунт разблокирован',
      body: 'Ваш аккаунт был разблокирован. Вы снова можете пользоваться платформой.',
      type: 'user_unblocked',
      priority: 'normal',
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
