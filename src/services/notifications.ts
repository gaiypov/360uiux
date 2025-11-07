/**
 * 360° РАБОТА - ULTRA EDITION
 * Push Notifications Service
 *
 * Handles Firebase Cloud Messaging (FCM) for push notifications
 * Supports both iOS (APNs) and Android
 */

import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { api } from './api';
import DeviceInfo from 'react-native-device-info';

// Notification types
export type NotificationType =
  | 'video_viewed'
  | 'video_limit_reached'
  | 'vacancy_approved'
  | 'vacancy_rejected'
  | 'application_received'
  | 'application_viewed'
  | 'application_status_changed'
  | 'message_received'
  | 'user_blocked'
  | 'user_unblocked';

export interface NotificationData {
  type: NotificationType;
  [key: string]: any;
}

export interface RemoteMessage extends FirebaseMessagingTypes.RemoteMessage {
  data?: NotificationData;
}

class NotificationService {
  private fcmToken: string | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;
  private unsubscribeOnNotificationOpen: (() => void) | null = null;

  /**
   * Initialize notification service
   * Request permissions and register device
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      const authStatus = await this.requestPermissions();

      if (authStatus === messaging.AuthorizationStatus.DENIED) {
        console.log('⛔ Notification permissions denied');
        return;
      }

      console.log('✅ Notification permissions granted');

      // Get FCM token
      await this.getFCMToken();

      // Register device with backend
      if (this.fcmToken) {
        await this.registerDevice();
      }

      // Setup message handlers
      this.setupMessageHandlers();

      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<messaging.AuthorizationStatus> {
    const authStatus = await messaging().requestPermission();

    return authStatus;
  }

  /**
   * Get FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('📱 FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Register device with backend
   */
  async registerDevice(): Promise<void> {
    if (!this.fcmToken) {
      console.log('⚠️ No FCM token available');
      return;
    }

    try {
      const deviceModel = await DeviceInfo.getModel();
      const osVersion = DeviceInfo.getSystemVersion();
      const appVersion = DeviceInfo.getVersion();

      await api.registerDevice({
        deviceType: Platform.OS as 'ios' | 'android',
        fcmToken: this.fcmToken,
        deviceModel,
        osVersion,
        appVersion,
      });

      console.log('✅ Device registered with backend');
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  /**
   * Update FCM token on backend
   */
  async updateToken(deviceId: string): Promise<void> {
    if (!this.fcmToken) return;

    try {
      await api.updateDeviceToken(deviceId, {
        fcmToken: this.fcmToken,
      });
      console.log('✅ FCM token updated');
    } catch (error) {
      console.error('Failed to update token:', error);
    }
  }

  /**
   * Setup message handlers
   */
  private setupMessageHandlers(): void {
    // Handle foreground messages
    this.unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
      console.log('📬 Foreground notification received:', remoteMessage);
      this.handleNotification(remoteMessage as RemoteMessage);
    });

    // Handle background/quit notification opens
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      console.log('📬 Notification opened app from background:', remoteMessage);
      this.handleNotificationOpen(remoteMessage as RemoteMessage);
    });

    // Check if app was opened by notification (from quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📬 Notification opened app from quit state:', remoteMessage);
          this.handleNotificationOpen(remoteMessage as RemoteMessage);
        }
      });

    // Handle token refresh
    messaging().onTokenRefresh(async (token) => {
      console.log('🔄 FCM token refreshed:', token);
      this.fcmToken = token;
      // Update token on backend
      // Note: Would need to store deviceId to update
    });
  }

  /**
   * Handle incoming notification (foreground)
   */
  private handleNotification(message: RemoteMessage): void {
    const { notification, data } = message;

    if (!notification) return;

    // Display in-app notification
    // Could use a custom toast/banner component
    console.log('Notification:', {
      title: notification.title,
      body: notification.body,
      data,
    });

    // Handle based on type
    if (data?.type) {
      this.handleNotificationType(data as NotificationData);
    }
  }

  /**
   * Handle notification open (background/quit)
   */
  private handleNotificationOpen(message: RemoteMessage): void {
    const { data } = message;

    if (!data?.type) return;

    // Navigate based on notification type
    this.handleNotificationType(data as NotificationData);
  }

  /**
   * Handle notification based on type
   * Navigate to appropriate screen
   */
  private handleNotificationType(data: NotificationData): void {
    const { type } = data;

    switch (type) {
      case 'video_viewed':
      case 'video_limit_reached':
        // Navigate to applications screen
        console.log('Navigate to applications:', data.applicationId);
        break;

      case 'vacancy_approved':
      case 'vacancy_rejected':
        // Navigate to vacancy detail
        console.log('Navigate to vacancy:', data.vacancyId);
        break;

      case 'application_received':
      case 'application_viewed':
      case 'application_status_changed':
        // Navigate to application detail
        console.log('Navigate to application:', data.applicationId);
        break;

      case 'message_received':
        // Navigate to chat
        console.log('Navigate to chat:', data.chatId);
        break;

      case 'user_blocked':
      case 'user_unblocked':
        // Show alert
        console.log('User status changed:', type);
        break;

      default:
        console.log('Unknown notification type:', type);
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<{
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    notificationTypes: string[];
  }> {
    try {
      return await api.getNotificationPreferences();
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return {
        pushEnabled: true,
        emailEnabled: true,
        smsEnabled: false,
        notificationTypes: [],
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    notificationTypes?: string[];
  }): Promise<void> {
    try {
      await api.updateNotificationPreferences(preferences);
      console.log('✅ Preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  }

  /**
   * Get badge count (iOS only)
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS !== 'ios') return 0;

    try {
      return await messaging().getAPNSToken().then(() => 0); // Placeholder
    } catch (error) {
      return 0;
    }
  }

  /**
   * Set badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
      // iOS badge handling would go here
      console.log('Set badge count:', count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await messaging().deleteToken();
      console.log('✅ All notifications cleared');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
    }
    if (this.unsubscribeOnNotificationOpen) {
      this.unsubscribeOnNotificationOpen();
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

/**
 * Navigation helper for notifications
 * Should be called from the root navigator
 */
export const setupNotificationNavigation = (navigation: any) => {
  // This would be implemented in the root navigator component
  // to handle navigation from notification clicks
};
