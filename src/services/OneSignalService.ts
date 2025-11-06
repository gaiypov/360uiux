/**
 * 360° РАБОТА - OneSignal Push Notifications Service
 *
 * Сервис для управления push уведомлениями через OneSignal
 * Architecture v3: Push notifications для новых сообщений и изменений статуса
 */

import OneSignal from 'react-native-onesignal';
import { Platform } from 'react-native';
import { api } from './api';

const ONESIGNAL_APP_ID = 'YOUR_ONESIGNAL_APP_ID'; // Заменить на реальный App ID

class OneSignalService {
  private initialized = false;
  private userId: string | null = null;

  /**
   * Инициализировать OneSignal
   */
  async initialize() {
    if (this.initialized) {
      console.log('OneSignal already initialized');
      return;
    }

    try {
      // Настроить OneSignal
      OneSignal.setAppId(ONESIGNAL_APP_ID);

      // Запросить разрешение на уведомления (iOS)
      if (Platform.OS === 'ios') {
        OneSignal.promptForPushNotificationsWithUserResponse((response) => {
          console.log('Push notifications permission:', response);
        });
      }

      // Обработчики событий
      this.setupHandlers();

      this.initialized = true;
      console.log('OneSignal initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OneSignal:', error);
    }
  }

  /**
   * Настроить обработчики событий
   */
  private setupHandlers() {
    // Обработка получения уведомления
    OneSignal.setNotificationWillShowInForegroundHandler(
      (notificationReceivedEvent) => {
        console.log('Notification received:', notificationReceivedEvent);
        const notification = notificationReceivedEvent.getNotification();

        // Показать уведомление
        notificationReceivedEvent.complete(notification);
      }
    );

    // Обработка клика по уведомлению
    OneSignal.setNotificationOpenedHandler((openedEvent) => {
      console.log('Notification opened:', openedEvent);
      const { notification } = openedEvent;
      const data = notification.additionalData;

      // Навигация в зависимости от типа уведомления
      this.handleNotificationClick(data);
    });

    // Обработка изменения состояния подписки
    OneSignal.setSubscriptionObserver((event) => {
      console.log('Subscription state changed:', event);
    });
  }

  /**
   * Обработать клик по уведомлению
   */
  private handleNotificationClick(data: any) {
    if (!data) return;

    // TODO: Добавить навигацию в зависимости от типа уведомления
    // Например:
    // - type: 'new_message' -> открыть чат
    // - type: 'status_changed' -> открыть список откликов
    // - type: 'video_viewed' -> открыть чат

    console.log('Notification data:', data);
  }

  /**
   * Зарегистрировать пользователя
   */
  async registerUser(userId: string, userRole: 'jobseeker' | 'employer') {
    try {
      this.userId = userId;

      // Установить External User ID
      OneSignal.setExternalUserId(userId, (results) => {
        console.log('External User ID set:', results);
      });

      // Добавить теги для сегментации
      OneSignal.sendTags({
        user_id: userId,
        user_role: userRole,
        platform: Platform.OS,
      });

      // Получить Player ID (push token)
      const deviceState = await OneSignal.getDeviceState();
      if (deviceState?.userId) {
        const playerId = deviceState.userId;
        console.log('OneSignal Player ID:', playerId);

        // Отправить push token на backend
        await this.updatePushToken(playerId, Platform.OS);
      }

      console.log('User registered with OneSignal');
    } catch (error) {
      console.error('Failed to register user with OneSignal:', error);
    }
  }

  /**
   * Обновить push token на backend
   */
  async updatePushToken(pushToken: string, platform: string) {
    try {
      await api.put('/users/push-token', {
        push_token: pushToken,
        push_enabled: true,
        push_platform: platform,
      });

      console.log('Push token updated on backend');
    } catch (error) {
      console.error('Failed to update push token:', error);
    }
  }

  /**
   * Удалить регистрацию пользователя (logout)
   */
  async unregisterUser() {
    try {
      // Удалить External User ID
      OneSignal.removeExternalUserId((results) => {
        console.log('External User ID removed:', results);
      });

      // Отключить push на backend
      await api.put('/users/push-token', {
        push_enabled: false,
      });

      this.userId = null;
      console.log('User unregistered from OneSignal');
    } catch (error) {
      console.error('Failed to unregister user:', error);
    }
  }

  /**
   * Отправить тег
   */
  async sendTag(key: string, value: string) {
    try {
      OneSignal.sendTag(key, value);
      console.log(`Tag sent: ${key} = ${value}`);
    } catch (error) {
      console.error('Failed to send tag:', error);
    }
  }

  /**
   * Удалить тег
   */
  async deleteTag(key: string) {
    try {
      OneSignal.deleteTag(key);
      console.log(`Tag deleted: ${key}`);
    } catch (error) {
      console.error('Failed to delete tag:', error);
    }
  }

  /**
   * Получить текущее состояние устройства
   */
  async getDeviceState() {
    try {
      const deviceState = await OneSignal.getDeviceState();
      console.log('Device state:', deviceState);
      return deviceState;
    } catch (error) {
      console.error('Failed to get device state:', error);
      return null;
    }
  }

  /**
   * Включить/выключить push уведомления
   */
  async setPushEnabled(enabled: boolean) {
    try {
      OneSignal.disablePush(!enabled);

      // Обновить на backend
      await api.put('/users/push-token', {
        push_enabled: enabled,
      });

      console.log(`Push notifications ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to set push enabled:', error);
    }
  }
}

export const oneSignalService = new OneSignalService();
