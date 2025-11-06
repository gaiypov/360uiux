/**
 * 360° РАБОТА - Notification Service
 * Push notifications with Firebase Cloud Messaging
 */

import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  EventType,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  type: 'new_message' | 'application_status' | 'interview_invite' | 'video_viewed';
  conversationId?: string;
  vacancyId?: string;
  applicationId?: string;
  title: string;
  body: string;
  imageUrl?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;
  private channelId: string = '360rabota-default';

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔔 Initializing notification service...');

      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.warn('⚠️ Notification permission denied');
        return;
      }

      // Create notification channel (Android)
      if (Platform.OS === 'android') {
        await this.createAndroidChannel();
      }

      // Get FCM token
      await this.getFCMToken();

      // Setup message handlers
      this.setupMessageHandlers();

      // Setup foreground listener
      this.setupForegroundListener();

      // Setup background handler
      this.setupBackgroundHandler();

      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    try {
      // Request permission with Notifee (better UX)
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
        console.log('✅ Notification permission granted');
        return true;
      }

      // Fallback to FCM permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('✅ FCM permission granted');
      }

      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      // Check if already registered
      const storedToken = await AsyncStorage.getItem('@360rabota:fcm_token');
      if (storedToken) {
        this.fcmToken = storedToken;
        return storedToken;
      }

      // Get new token
      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        await AsyncStorage.setItem('@360rabota:fcm_token', token);
        console.log('📱 FCM Token:', token);

        // TODO: Send token to backend
        // await api.registerFCMToken(token);

        return token;
      }

      return null;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Create Android notification channel
   */
  private async createAndroidChannel(): Promise<void> {
    try {
      await notifee.createChannel({
        id: this.channelId,
        name: '360° РАБОТА',
        description: 'Notifications for job applications and messages',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        vibrationPattern: [300, 500],
      });

      console.log('✅ Android notification channel created');
    } catch (error) {
      console.error('Error creating Android channel:', error);
    }
  }

  /**
   * Setup foreground message listener
   */
  private setupForegroundListener(): void {
    messaging().onMessage(async (remoteMessage) => {
      console.log('📨 Foreground notification:', remoteMessage);

      // Display notification
      await this.displayNotification(remoteMessage);
    });
  }

  /**
   * Setup background message handler
   */
  private setupBackgroundHandler(): void {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📨 Background notification:', remoteMessage);

      // Display notification
      await this.displayNotification(remoteMessage);
    });
  }

  /**
   * Setup message handlers
   */
  private setupMessageHandlers(): void {
    // Handle notification opened app (from quit state)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📨 Notification opened app from quit state:', remoteMessage);
          this.handleNotificationPress(remoteMessage);
        }
      });

    // Handle notification opened app (from background)
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📨 Notification opened app from background:', remoteMessage);
      this.handleNotificationPress(remoteMessage);
    });

    // Handle Notifee notification press
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('📨 Notifee notification pressed:', detail);
        // TODO: Navigate to relevant screen
      }
    });
  }

  /**
   * Display notification with Notifee
   */
  private async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const { notification, data } = remoteMessage;

      if (!notification) return;

      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          pressAction: {
            id: 'default',
          },
          largeIcon: notification.android?.imageUrl,
          smallIcon: 'ic_notification',
        },
        ios: {
          sound: 'default',
          attachments: notification.ios?.imageUrl
            ? [
                {
                  url: notification.ios.imageUrl,
                },
              ]
            : undefined,
        },
        data,
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  }

  /**
   * Handle notification press
   */
  private handleNotificationPress(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): void {
    const { data } = remoteMessage;

    if (!data) return;

    // TODO: Navigate based on notification type
    console.log('Navigate to:', data);

    // Example:
    // if (data.type === 'new_message' && data.conversationId) {
    //   navigation.navigate('Chat', { conversationId: data.conversationId });
    // }
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(data: NotificationData): Promise<void> {
    try {
      await notifee.displayNotification({
        title: data.title,
        body: data.body,
        android: {
          channelId: this.channelId,
          importance: AndroidImportance.HIGH,
          sound: 'default',
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_notification',
        },
        ios: {
          sound: 'default',
        },
        data: data as any,
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await notifee.getBadgeCount();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await notifee.setBadgeCount(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Increment badge count
   */
  async incrementBadgeCount(): Promise<void> {
    try {
      const current = await this.getBadgeCount();
      await this.setBadgeCount(current + 1);
    } catch (error) {
      console.error('Error incrementing badge count:', error);
    }
  }

  /**
   * Decrement badge count
   */
  async decrementBadgeCount(): Promise<void> {
    try {
      const current = await this.getBadgeCount();
      await this.setBadgeCount(Math.max(0, current - 1));
    } catch (error) {
      console.error('Error decrementing badge count:', error);
    }
  }

  /**
   * Check notification settings
   */
  async checkSettings(): Promise<{
    hasPermission: boolean;
    canShowNotifications: boolean;
  }> {
    try {
      const settings = await notifee.getNotificationSettings();

      return {
        hasPermission: settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED,
        canShowNotifications:
          Platform.OS === 'ios'
            ? settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED
            : settings.android.alarm === AndroidNotificationSetting.ENABLED,
      };
    } catch (error) {
      console.error('Error checking notification settings:', error);
      return {
        hasPermission: false,
        canShowNotifications: false,
      };
    }
  }

  /**
   * Open notification settings
   */
  async openSettings(): Promise<void> {
    try {
      await notifee.openNotificationSettings();
    } catch (error) {
      console.error('Error opening notification settings:', error);
    }
  }

  /**
   * Get FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Refresh FCM token
   */
  async refreshToken(): Promise<string | null> {
    try {
      await messaging().deleteToken();
      await AsyncStorage.removeItem('@360rabota:fcm_token');
      return await this.getFCMToken();
    } catch (error) {
      console.error('Error refreshing FCM token:', error);
      return null;
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`✅ Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`✅ Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
