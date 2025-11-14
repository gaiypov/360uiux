/**
 * 360° РАБОТА - Secure Storage Wrapper
 * Encrypted storage for sensitive data (JWT tokens, API keys, FCM tokens)
 *
 * IMPORTANT: Requires expo-secure-store package
 * Installation: npx expo install expo-secure-store
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * SecureStorage wrapper for encrypted key-value storage
 *
 * Features:
 * - Hardware-backed encryption on iOS (Keychain)
 * - Hardware-backed encryption on Android (Keystore)
 * - Automatic fallback to software encryption if hardware unavailable
 * - Data persists across app restarts
 * - Data deleted on app uninstall
 */
export class SecureStorage {
  /**
   * Store encrypted value
   * @param key Storage key
   * @param value String value to encrypt and store
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
        requireAuthentication: false, // Don't require biometrics for basic storage
      });
      console.log(`🔒 SecureStorage: Stored ${key}`);
    } catch (error) {
      console.error(`❌ SecureStorage.setItem error for key ${key}:`, error);
      throw new Error(`Failed to store ${key} in SecureStorage`);
    }
  }

  /**
   * Retrieve and decrypt value
   * @param key Storage key
   * @returns Decrypted value or null if not found
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        console.log(`🔓 SecureStorage: Retrieved ${key}`);
      }
      return value;
    } catch (error) {
      console.error(`❌ SecureStorage.getItem error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from secure storage
   * @param key Storage key
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      console.log(`🗑️  SecureStorage: Removed ${key}`);
    } catch (error) {
      console.error(`❌ SecureStorage.removeItem error for key ${key}:`, error);
      // Don't throw - removing non-existent key is not an error
    }
  }

  /**
   * Clear all items (use with caution!)
   * Note: expo-secure-store doesn't provide a clear() method,
   * so you must track and remove keys individually
   */
  static async clear(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
      console.log(`🗑️  SecureStorage: Cleared ${keys.length} items`);
    } catch (error) {
      console.error('❌ SecureStorage.clear error:', error);
      throw new Error('Failed to clear SecureStorage');
    }
  }

  /**
   * Check if SecureStore is available on current platform
   * (Always available on iOS/Android, not available on web)
   */
  static isAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }
}

/**
 * Storage keys for sensitive data
 */
export const SECURE_STORAGE_KEYS = {
  // JWT Authentication
  ACCESS_TOKEN: '@360rabota:secure:access_token',
  REFRESH_TOKEN: '@360rabota:secure:refresh_token',

  // Admin Authentication
  ADMIN_ACCESS_TOKEN: '@360rabota:secure:admin_access_token',
  ADMIN_REFRESH_TOKEN: '@360rabota:secure:admin_refresh_token',

  // Push Notifications
  FCM_TOKEN: '@360rabota:secure:fcm_token',

  // Video Upload (future use)
  VIDEO_UPLOAD_TOKEN: '@360rabota:secure:video_upload_token',
} as const;

/**
 * Migration helper: Move data from AsyncStorage to SecureStorage
 * Use this to migrate existing unencrypted tokens
 */
export async function migrateFromAsyncStorage(
  asyncStorage: any,
  oldKey: string,
  newKey: string
): Promise<boolean> {
  try {
    const value = await asyncStorage.getItem(oldKey);
    if (value) {
      await SecureStorage.setItem(newKey, value);
      await asyncStorage.removeItem(oldKey);
      console.log(`✅ Migrated ${oldKey} → ${newKey}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Migration failed for ${oldKey}:`, error);
    return false;
  }
}
