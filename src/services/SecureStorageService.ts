/**
 * 360° РАБОТА - Secure Storage Service
 * Using react-native-keychain for encrypted storage
 * Replacement for Expo SecureStore
 */

import * as Keychain from 'react-native-keychain';

class SecureStorageService {
  private serviceName = '360-rabota';

  /**
   * Save value securely
   */
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(key, value, {
        service: `${this.serviceName}-${key}`,
      });
      return true;
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      return false;
    }
  }

  /**
   * Get value from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.serviceName}-${key}`,
      });

      if (credentials) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  /**
   * Remove value from secure storage
   */
  async deleteItem(key: string): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: `${this.serviceName}-${key}`,
      });
      return true;
    } catch (error) {
      console.error('SecureStorage deleteItem error:', error);
      return false;
    }
  }

  /**
   * Save JWT tokens (access + refresh)
   */
  async saveTokens(accessToken: string, refreshToken: string): Promise<boolean> {
    const success1 = await this.setItem('jwt_access_token', accessToken);
    const success2 = await this.setItem('jwt_refresh_token', refreshToken);
    return success1 && success2;
  }

  /**
   * Get access token
   */
  async getAccessToken(): Promise<string | null> {
    return await this.getItem('jwt_access_token');
  }

  /**
   * Get refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return await this.getItem('jwt_refresh_token');
  }

  /**
   * Clear all tokens (logout)
   */
  async clearTokens(): Promise<boolean> {
    const success1 = await this.deleteItem('jwt_access_token');
    const success2 = await this.deleteItem('jwt_refresh_token');
    return success1 && success2;
  }

  /**
   * Save biometric auth enabled preference
   */
  async setBiometricEnabled(enabled: boolean): Promise<boolean> {
    return await this.setItem('biometric_enabled', enabled.toString());
  }

  /**
   * Get biometric auth enabled preference
   */
  async getBiometricEnabled(): Promise<boolean> {
    const value = await this.getItem('biometric_enabled');
    return value === 'true';
  }

  /**
   * Check if biometrics are available
   */
  async isBiometricsAvailable(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get biometry type (FaceID, TouchID, Fingerprint, etc.)
   */
  async getBiometryType(): Promise<string | null> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType;
    } catch (error) {
      return null;
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometrics(reason: string = 'Войти в приложение'): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${this.serviceName}-jwt_access_token`,
        authenticationPrompt: {
          title: '360° РАБОТА',
          subtitle: reason,
          cancel: 'Отмена',
        },
      });
      return credentials !== false;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  }
}

export const secureStorage = new SecureStorageService();
