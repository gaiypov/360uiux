/**
 * 360° РАБОТА - Storage Service
 * Быстрое хранилище на базе MMKV (в 30x быстрее AsyncStorage)
 */

import { MMKV } from 'react-native-mmkv';

// Основное хранилище
const storage = new MMKV({
  id: 'app-storage',
});

// Защищенное хранилище для токенов
const secureStorage = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'your-encryption-key-here-change-in-production',
});

/**
 * StorageService - быстрое хранилище для обычных данных
 */
export const StorageService = {
  /**
   * Сохранить строку
   */
  set: (key: string, value: string): void => {
    storage.set(key, value);
  },

  /**
   * Получить строку
   */
  get: (key: string): string | undefined => {
    return storage.getString(key);
  },

  /**
   * Удалить ключ
   */
  delete: (key: string): void => {
    storage.delete(key);
  },

  /**
   * Сохранить объект как JSON
   */
  setJSON: <T = any>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value));
  },

  /**
   * Получить объект из JSON
   */
  getJSON: <T = any>(key: string): T | null => {
    const data = storage.getString(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('StorageService: Error parsing JSON', error);
      return null;
    }
  },

  /**
   * Сохранить boolean
   */
  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value);
  },

  /**
   * Получить boolean
   */
  getBoolean: (key: string): boolean => {
    return storage.getBoolean(key) ?? false;
  },

  /**
   * Сохранить число
   */
  setNumber: (key: string, value: number): void => {
    storage.set(key, value);
  },

  /**
   * Получить число
   */
  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key);
  },

  /**
   * Проверить наличие ключа
   */
  contains: (key: string): boolean => {
    return storage.contains(key);
  },

  /**
   * Получить все ключи
   */
  getAllKeys: (): string[] => {
    return storage.getAllKeys();
  },

  /**
   * Очистить всё хранилище
   */
  clearAll: (): void => {
    storage.clearAll();
  },
};

/**
 * SecureStorageService - защищенное хранилище для токенов и чувствительных данных
 */
export const SecureStorageService = {
  /**
   * Сохранить JWT access token
   */
  setAccessToken: (token: string): void => {
    secureStorage.set('jwt_access_token', token);
  },

  /**
   * Получить JWT access token
   */
  getAccessToken: (): string | undefined => {
    return secureStorage.getString('jwt_access_token');
  },

  /**
   * Удалить access token
   */
  clearAccessToken: (): void => {
    secureStorage.delete('jwt_access_token');
  },

  /**
   * Сохранить JWT refresh token
   */
  setRefreshToken: (token: string): void => {
    secureStorage.set('jwt_refresh_token', token);
  },

  /**
   * Получить JWT refresh token
   */
  getRefreshToken: (): string | undefined => {
    return secureStorage.getString('jwt_refresh_token');
  },

  /**
   * Удалить refresh token
   */
  clearRefreshToken: (): void => {
    secureStorage.delete('jwt_refresh_token');
  },

  /**
   * Сохранить оба токена
   */
  setTokens: (accessToken: string, refreshToken: string): void => {
    secureStorage.set('jwt_access_token', accessToken);
    secureStorage.set('jwt_refresh_token', refreshToken);
  },

  /**
   * Получить оба токена
   */
  getTokens: (): { accessToken?: string; refreshToken?: string } => {
    return {
      accessToken: secureStorage.getString('jwt_access_token'),
      refreshToken: secureStorage.getString('jwt_refresh_token'),
    };
  },

  /**
   * Удалить все токены (logout)
   */
  clearTokens: (): void => {
    secureStorage.delete('jwt_access_token');
    secureStorage.delete('jwt_refresh_token');
  },

  /**
   * Сохранить данные пользователя
   */
  setUser: <T = any>(user: T): void => {
    secureStorage.set('user_data', JSON.stringify(user));
  },

  /**
   * Получить данные пользователя
   */
  getUser: <T = any>(): T | null => {
    const data = secureStorage.getString('user_data');
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('SecureStorageService: Error parsing user data', error);
      return null;
    }
  },

  /**
   * Удалить данные пользователя
   */
  clearUser: (): void => {
    secureStorage.delete('user_data');
  },

  /**
   * Полный logout - удалить всё
   */
  logout: (): void => {
    secureStorage.clearAll();
  },
};

/**
 * Константы для ключей хранилища
 */
export const STORAGE_KEYS = {
  // Onboarding
  ONBOARDING_COMPLETED: 'onboarding_completed',

  // Theme
  THEME_MODE: 'theme_mode',

  // Settings
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  HAPTIC_ENABLED: 'haptic_enabled',

  // Cache
  VACANCIES_CACHE: 'vacancies_cache',
  APPLICATIONS_CACHE: 'applications_cache',

  // Last sync
  LAST_SYNC_TIME: 'last_sync_time',
} as const;
