/**
 * 360° РАБОТА - ULTRA EDITION
 * Settings Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  vacancyNotifications: boolean;
  applicationNotifications: boolean;
  chatNotifications: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  showActivityStatus: boolean;
  showLastSeen: boolean;
}

export interface AppSettings {
  theme: 'ultra' | 'light' | 'dark';
  language: 'ru' | 'en';
  currency: 'RUB' | 'USD' | 'EUR';
}

interface SettingsState {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  app: AppSettings;

  // Actions
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
}

const defaultNotifications: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  vacancyNotifications: true,
  applicationNotifications: true,
  chatNotifications: true,
};

const defaultPrivacy: PrivacySettings = {
  profileVisible: true,
  showActivityStatus: true,
  showLastSeen: true,
};

const defaultApp: AppSettings = {
  theme: 'ultra',
  language: 'ru',
  currency: 'RUB',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: defaultNotifications,
      privacy: defaultPrivacy,
      app: defaultApp,

      updateNotificationSettings: (settings) => {
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        }));
      },

      updatePrivacySettings: (settings) => {
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        }));
      },

      updateAppSettings: (settings) => {
        set((state) => ({
          app: { ...state.app, ...settings },
        }));
      },

      resetToDefaults: () => {
        set({
          notifications: defaultNotifications,
          privacy: defaultPrivacy,
          app: defaultApp,
        });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
