/**
 * 360° РАБОТА - Notification Service
 * Rich notifications with quick reply and actions
 * Architecture v3: Push notifications with notification actions
 */

import { Platform, AppState, AppStateStatus } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  AuthorizationStatus,
  EventType,
  Event,
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { wsService } from './WebSocketService';

export interface NotificationData {
  type: 'new_message' | 'video_message' | 'application_status' | 'interview_invite' | 'video_viewed';
  conversationId?: string;
  messageId?: string;
  vacancyId?: string;
  applicationId?: string;
  senderName?: string;
  senderId?: string;
  title: string;
  body: string;
  imageUrl?: string;
}

// Notification channels
const CHANNELS = {
  MESSAGES: 'messages',
  VIDEO_MESSAGES: 'video_messages',
  SYSTEM: 'system',
};

// Notification actions
const ACTIONS = {
  QUICK_REPLY: 'quick_reply',
  MARK_READ: 'mark_read',
  VIEW_CONVERSATION: 'view_conversation',
};

// iOS categories
const IOS_CATEGORIES = {
  MESSAGE: 'message_category',
  VIDEO_MESSAGE: 'video_message_category',
};

export class NotificationService {
  private static instance: NotificationService;
  private fcmToken: string | null = null;
  private channelId: string = CHANNELS.MESSAGES; // Default channel
  private appState: AppStateStatus = AppState.currentState;
  private navigationCallback: ((route: string, params: any) => void) | null = null;

  private constructor() {
    this.setupAppStateListener();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Setup app state listener
   */
  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState) => {
      this.appState = nextAppState;
      console.log('📱 App state changed:', nextAppState);
    });
  }

  /**
   * Set navigation callback for deep linking
   */
  setNavigationCallback(callback: (route: string, params: any) => void): void {
    this.navigationCallback = callback;
    console.log('✅ Navigation callback set');
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

      // Create notification channels (Android)
      if (Platform.OS === 'android') {
        await this.createAndroidChannel();
      }

      // Setup iOS categories with actions
      if (Platform.OS === 'ios') {
        await this.setupIOSCategories();
      }

      // Get FCM token
      await this.getFCMToken();

      // Setup message handlers
      this.setupMessageHandlers();

      // Setup notification action handlers
      this.setupActionHandlers();

      // Setup foreground listener
      this.setupForegroundListener();

      // Setup background handler
      this.setupBackgroundHandler();

      // Setup WebSocket listeners
      this.setupWebSocketListeners();

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
   * Create Android notification channels
   */
  private async createAndroidChannel(): Promise<void> {
    try {
      // Messages channel
      await notifee.createChannel({
        id: CHANNELS.MESSAGES,
        name: 'Сообщения',
        description: 'Новые сообщения от работодателей',
        importance: AndroidImportance.HIGH,
        sound: 'message_sound', // Custom sound
        vibration: true,
        vibrationPattern: [300, 500],
      });

      // Video messages channel
      await notifee.createChannel({
        id: CHANNELS.VIDEO_MESSAGES,
        name: 'Видео-сообщения',
        description: 'Новые видео-сообщения',
        importance: AndroidImportance.HIGH,
        sound: 'video_message_sound', // Custom sound
        vibration: true,
        vibrationPattern: [300, 200, 300],
      });

      // System channel
      await notifee.createChannel({
        id: CHANNELS.SYSTEM,
        name: 'Системные уведомления',
        description: 'Статусы заявок и приглашения',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
        vibration: false,
      });

      console.log('✅ Android notification channels created');
    } catch (error) {
      console.error('Error creating Android channels:', error);
    }
  }

  /**
   * Setup iOS categories with actions
   */
  private async setupIOSCategories(): Promise<void> {
    try {
      // Message category with quick reply and mark as read
      await notifee.setNotificationCategories([
        {
          id: IOS_CATEGORIES.MESSAGE,
          actions: [
            {
              id: ACTIONS.QUICK_REPLY,
              title: 'Ответить',
              input: {
                placeholder: 'Введите ответ...',
                buttonText: 'Отправить',
              },
            },
            {
              id: ACTIONS.MARK_READ,
              title: 'Прочитано',
            },
          ],
        },
        {
          id: IOS_CATEGORIES.VIDEO_MESSAGE,
          actions: [
            {
              id: ACTIONS.VIEW_CONVERSATION,
              title: 'Открыть',
            },
            {
              id: ACTIONS.MARK_READ,
              title: 'Прочитано',
            },
          ],
        },
      ]);

      console.log('✅ iOS notification categories setup');
    } catch (error) {
      console.error('Error setting up iOS categories:', error);
    }
  }

  /**
   * Setup WebSocket listeners for real-time notifications
   */
  private setupWebSocketListeners(): void {
    // Listen for new messages
    wsService.on('message:new', (data: any) => {
      // Only show notification if app is in background
      if (this.appState !== 'active') {
        this.showMessageNotification({
          type: 'new_message',
          conversationId: data.conversationId,
          messageId: data.messageId,
          senderName: data.senderName || 'Работодатель',
          senderId: data.senderId,
          title: data.senderName || 'Новое сообщение',
          body: this.formatMessageBody(data),
        });
      }
    });

    // Listen for video messages
    wsService.on('message:video', (data: any) => {
      if (this.appState !== 'active') {
        this.showMessageNotification({
          type: 'video_message',
          conversationId: data.conversationId,
          messageId: data.messageId,
          senderName: data.senderName || 'Работодатель',
          senderId: data.senderId,
          title: data.senderName || 'Новое видео-сообщение',
          body: '📹 Видео-резюме получено',
        });
      }
    });

    console.log('✅ WebSocket listeners setup for notifications');
  }

  /**
   * Format message body for notification
   */
  private formatMessageBody(data: any): string {
    if (data.type === 'video') {
      return '📹 Видео-резюме';
    } else if (data.type === 'image') {
      return '🖼️ Изображение';
    } else if (data.type === 'file') {
      return '📎 Файл';
    } else {
      // Truncate long messages
      const maxLength = 100;
      const text = data.text || 'Новое сообщение';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
  }

  /**
   * Show message notification with actions
   */
  async showMessageNotification(data: NotificationData): Promise<void> {
    try {
      const isVideoMessage = data.type === 'video_message';
      const channelId = isVideoMessage ? CHANNELS.VIDEO_MESSAGES : CHANNELS.MESSAGES;
      const notificationId = `${data.conversationId}-${data.messageId || Date.now()}`;

      await notifee.displayNotification({
        id: notificationId,
        title: data.title,
        body: data.body,
        android: {
          channelId,
          importance: AndroidImportance.HIGH,
          sound: isVideoMessage ? 'video_message_sound' : 'message_sound',
          smallIcon: 'ic_notification',
          color: '#1A1A1A',
          timestamp: Date.now(),
          showTimestamp: true,
          pressAction: {
            id: ACTIONS.VIEW_CONVERSATION,
            launchActivity: 'default',
          },
          actions: [
            {
              title: '💬 Ответить',
              pressAction: {
                id: ACTIONS.QUICK_REPLY,
                launchActivity: 'default',
              },
              input: {
                placeholder: 'Введите ответ...',
                submitButtonText: 'Отправить',
              },
            },
            {
              title: '✓ Прочитано',
              pressAction: {
                id: ACTIONS.MARK_READ,
              },
            },
          ],
        },
        ios: {
          categoryId: isVideoMessage ? IOS_CATEGORIES.VIDEO_MESSAGE : IOS_CATEGORIES.MESSAGE,
          sound: isVideoMessage ? 'video_message_sound.wav' : 'message_sound.wav',
        },
        data: {
          conversationId: data.conversationId,
          messageId: data.messageId,
          senderId: data.senderId,
          senderName: data.senderName,
          type: data.type,
        },
      });

      console.log('✅ Message notification shown:', notificationId);
    } catch (error) {
      console.error('❌ Error showing message notification:', error);
    }
  }

  /**
   * Setup notification action handlers
   */
  private setupActionHandlers(): void {
    // Handle foreground and background notification events
    notifee.onForegroundEvent(async (event: Event) => {
      await this.handleNotificationEvent(event);
    });

    notifee.onBackgroundEvent(async (event: Event) => {
      await this.handleNotificationEvent(event);
    });

    console.log('✅ Notification action handlers setup');
  }

  /**
   * Handle notification event (press, action)
   */
  private async handleNotificationEvent(event: Event): Promise<void> {
    const { type, detail } = event;

    console.log('📨 Notification event:', type, detail);

    if (!detail.notification) return;

    const notificationData = detail.notification.data as any;
    const { conversationId, messageId, senderName } = notificationData;

    switch (type) {
      case EventType.PRESS:
        // Open conversation
        console.log('👆 Notification pressed, opening conversation:', conversationId);
        if (this.navigationCallback && conversationId) {
          this.navigationCallback('Chat', {
            conversationId,
            employerName: senderName || 'Работодатель',
          });
        }
        // Cancel notification after opening
        if (detail.notification.id) {
          await notifee.cancelNotification(detail.notification.id);
        }
        break;

      case EventType.ACTION_PRESS:
        const actionId = detail.pressAction?.id;
        const inputText = detail.input;

        console.log('⚡ Action pressed:', actionId, inputText);

        if (actionId === ACTIONS.QUICK_REPLY && inputText && conversationId) {
          // Send quick reply
          await this.handleQuickReply(conversationId, inputText);
          // Cancel notification
          if (detail.notification.id) {
            await notifee.cancelNotification(detail.notification.id);
          }
        } else if (actionId === ACTIONS.MARK_READ && conversationId) {
          // Mark as read
          await this.handleMarkAsRead(conversationId);
          // Cancel notification
          if (detail.notification.id) {
            await notifee.cancelNotification(detail.notification.id);
          }
        } else if (actionId === ACTIONS.VIEW_CONVERSATION && conversationId) {
          // Open conversation
          if (this.navigationCallback) {
            this.navigationCallback('Chat', {
              conversationId,
              employerName: senderName || 'Работодатель',
            });
          }
          // Cancel notification
          if (detail.notification.id) {
            await notifee.cancelNotification(detail.notification.id);
          }
        }
        break;

      case EventType.DISMISSED:
        console.log('👋 Notification dismissed');
        break;
    }
  }

  /**
   * Handle quick reply action
   */
  private async handleQuickReply(conversationId: string, message: string): Promise<void> {
    try {
      console.log('💬 Quick reply:', conversationId, message);

      // Send message via WebSocket
      wsService.sendMessage(conversationId, message);

      // Show confirmation notification
      await notifee.displayNotification({
        title: 'Сообщение отправлено',
        body: message,
        android: {
          channelId: CHANNELS.SYSTEM,
          importance: AndroidImportance.LOW,
          smallIcon: 'ic_notification',
          color: '#1A1A1A',
          timeout: 3000, // Auto-dismiss after 3 seconds
        },
      });

      console.log('✅ Quick reply sent');
    } catch (error) {
      console.error('❌ Error sending quick reply:', error);
    }
  }

  /**
   * Handle mark as read action
   */
  private async handleMarkAsRead(conversationId: string): Promise<void> {
    try {
      console.log('✅ Marking conversation as read:', conversationId);

      // Mark as read via WebSocket
      wsService.markConversationAsRead(conversationId);

      console.log('✅ Conversation marked as read');
    } catch (error) {
      console.error('❌ Error marking as read:', error);
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
