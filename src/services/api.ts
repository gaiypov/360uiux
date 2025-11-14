/**
 * 360° РАБОТА - ULTRA EDITION
 * API Service - Backend Integration
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage, SECURE_STORAGE_KEYS, migrateFromAsyncStorage } from '../utils/SecureStorage';

// API Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api/v1'
  : 'https://api.360rabota.ru/api/v1';

// Legacy AsyncStorage keys (for migration)
const LEGACY_STORAGE_KEYS = {
  ACCESS_TOKEN: '@360rabota:access_token',
  REFRESH_TOKEN: '@360rabota:refresh_token',
};

// Non-sensitive data (kept in AsyncStorage)
const STORAGE_KEYS = {
  USER: '@360rabota:user',
};

// ===================================
// Types
// ===================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  role: 'jobseeker' | 'employer' | 'moderator';
  name?: string;
  company_name?: string;
  verified?: boolean;
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
  expiresAt: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  requiresRegistration: boolean;
  phone?: string;
  user?: User;
  tokens?: AuthTokens;
}

export interface RegisterJobSeekerRequest {
  phone: string;
  name: string;
  age?: number; // Architecture v3: Simplified registration
}

export interface RegisterEmployerRequest {
  phone: string;
  email: string;
  company_name: string;
  inn: string;
  legal_address?: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  created_at: string;
  completed_at?: string;
}

export interface InitPaymentRequest {
  amount: number;
  paymentSystem: 'alfabank' | 'invoice';
  cardType?: 'business' | 'mir' | 'regular';
}

export interface InitPaymentResponse {
  transactionId: string;
  paymentUrl: string;
  amount: number;
}

// ===================================
// API Service Class
// ===================================

class APIService {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - добавляем токен
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.accessToken) {
          await this.loadTokensFromStorage();
        }

        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - обработка 401 и refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Если 401 и еще не пытались обновить токен
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Пытаемся обновить токен
            const newTokens = await this.refreshAccessToken();

            if (newTokens) {
              // Повторяем оригинальный запрос с новым токеном
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Не удалось обновить токен - выходим
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ===================================
  // Token Management
  // ===================================

  private async loadTokensFromStorage() {
    try {
      // Try loading from SecureStorage first
      const [accessToken, refreshToken] = await Promise.all([
        SecureStorage.getItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN),
        SecureStorage.getItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      // If tokens found in SecureStorage, use them
      if (accessToken && refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        return;
      }

      // Migration: If not found in SecureStorage, check legacy AsyncStorage
      console.log('🔄 Migrating JWT tokens from AsyncStorage to SecureStorage...');
      const migrated = await Promise.all([
        migrateFromAsyncStorage(
          AsyncStorage,
          LEGACY_STORAGE_KEYS.ACCESS_TOKEN,
          SECURE_STORAGE_KEYS.ACCESS_TOKEN
        ),
        migrateFromAsyncStorage(
          AsyncStorage,
          LEGACY_STORAGE_KEYS.REFRESH_TOKEN,
          SECURE_STORAGE_KEYS.REFRESH_TOKEN
        ),
      ]);

      // Load again after migration
      if (migrated[0] || migrated[1]) {
        const [newAccessToken, newRefreshToken] = await Promise.all([
          SecureStorage.getItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN),
          SecureStorage.getItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN),
        ]);
        this.accessToken = newAccessToken;
        this.refreshToken = newRefreshToken;
      }
    } catch (error) {
      console.error('❌ Error loading tokens:', error);
    }
  }

  private async saveTokens(tokens: AuthTokens) {
    try {
      // Save to SecureStorage (encrypted)
      await Promise.all([
        SecureStorage.setItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        SecureStorage.setItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);

      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;

      console.log('✅ JWT tokens saved to SecureStorage');
    } catch (error) {
      console.error('❌ Error saving tokens:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<AuthTokens | null> {
    try {
      if (!this.refreshToken) {
        await this.loadTokensFromStorage();
      }

      if (!this.refreshToken) {
        return null;
      }

      // P1 FIX: Add timeout for token refresh
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.refreshToken,
      }, {
        timeout: 10000, // 10s timeout for refresh token
      });

      const tokens = response.data.tokens;
      await this.saveTokens(tokens);

      return tokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // ===================================
  // AUTH API
  // ===================================

  async sendCode(phone: string): Promise<SendCodeResponse> {
    const response = await this.client.post('/auth/send-code', { phone });
    return response.data;
  }

  async verifyCode(phone: string, code: string): Promise<VerifyCodeResponse> {
    const response = await this.client.post('/auth/verify-code', { phone, code });

    // Если пользователь существует - сохраняем токены
    if (response.data.tokens) {
      await this.saveTokens(response.data.tokens);
    }

    // Сохраняем пользователя
    if (response.data.user) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
    }

    return response.data;
  }

  async registerJobSeeker(data: RegisterJobSeekerRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post('/auth/register/jobseeker', data);

    await this.saveTokens(response.data.tokens);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));

    return response.data;
  }

  async registerEmployer(data: RegisterEmployerRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post('/auth/register/employer', data);

    await this.saveTokens(response.data.tokens);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));

    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens from SecureStorage (encrypted tokens)
      await Promise.all([
        SecureStorage.removeItem(SECURE_STORAGE_KEYS.ACCESS_TOKEN),
        SecureStorage.removeItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN),
        // Clear legacy AsyncStorage tokens (migration cleanup)
        AsyncStorage.removeItem(LEGACY_STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(LEGACY_STORAGE_KEYS.REFRESH_TOKEN),
        // Clear user data (non-sensitive)
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);

      this.accessToken = null;
      this.refreshToken = null;

      console.log('✅ Logged out - all tokens cleared');
    }
  }

  // ===================================
  // BILLING API
  // ===================================

  async getWalletBalance(): Promise<WalletBalance> {
    const response = await this.client.get('/billing/wallet/balance');
    return response.data;
  }

  async getTransactions(params?: {
    limit?: number;
    offset?: number;
    type?: string;
  }): Promise<Transaction[]> {
    const response = await this.client.get('/billing/wallet/transactions', { params });
    return response.data.transactions;
  }

  async initPayment(data: InitPaymentRequest): Promise<InitPaymentResponse> {
    const response = await this.client.post('/billing/payment/init', data);
    return response.data;
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    const response = await this.client.get(`/billing/payment/${paymentId}/status`);
    return response.data;
  }

  async getPricing(): Promise<{ plans: any[] }> {
    const response = await this.client.get('/billing/pricing');
    return response.data;
  }

  async purchaseService(data: {
    service: string;
    amount: number;
  }): Promise<{ success: boolean; transaction: any }> {
    const response = await this.client.post('/billing/purchase-service', data);
    return response.data;
  }

  // ===================================
  // VACANCY API
  // ===================================

  /**
   * Get list of vacancies (TikTok-style feed)
   * @param params Pagination and filter params
   * @returns List of vacancies
   */
  async getVacancies(params?: {
    limit?: number;
    offset?: number;
    city?: string;
    salaryMin?: number;
    industry?: string;
  }): Promise<{ vacancies: any[]; hasMore: boolean; total: number }> {
    try {
      const response = await this.client.get('/vacancies', { params });
      return response.data;
    } catch (error: any) {
      // Graceful fallback: if backend returns "Coming soon" or 404
      if (error?.response?.status === 404 || error?.response?.data?.message?.includes('Coming soon')) {
        console.warn('⚠️ Vacancy API not implemented yet, using mock data');
        throw new Error('VACANCY_API_NOT_IMPLEMENTED');
      }
      throw error;
    }
  }

  /**
   * Get single vacancy by ID
   * @param vacancyId Vacancy ID
   * @returns Vacancy details
   */
  async getVacancy(vacancyId: string): Promise<any> {
    const response = await this.client.get(`/vacancies/${vacancyId}`);
    return response.data;
  }

  // ===================================
  // VACANCY INTERACTIONS API (Architecture v3)
  // ===================================

  async likeVacancy(vacancyId: string): Promise<{ liked: boolean }> {
    const response = await this.client.post(`/vacancies/${vacancyId}/like`);
    return response.data;
  }

  async unlikeVacancy(vacancyId: string): Promise<{ liked: boolean }> {
    const response = await this.client.delete(`/vacancies/${vacancyId}/like`);
    return response.data;
  }

  async favoriteVacancy(vacancyId: string): Promise<{ favorited: boolean }> {
    const response = await this.client.post(`/vacancies/${vacancyId}/favorite`);
    return response.data;
  }

  async unfavoriteVacancy(vacancyId: string): Promise<{ favorited: boolean }> {
    const response = await this.client.delete(`/vacancies/${vacancyId}/favorite`);
    return response.data;
  }

  async addComment(vacancyId: string, text: string): Promise<{ id: string; text: string; createdAt: string }> {
    const response = await this.client.post(`/vacancies/${vacancyId}/comments`, { text });
    return response.data;
  }

  async getComments(vacancyId: string, params?: { limit?: number; offset?: number }): Promise<any[]> {
    const response = await this.client.get(`/vacancies/${vacancyId}/comments`, { params });
    return response.data.comments;
  }

  async getFavorites(params?: { limit?: number; offset?: number }): Promise<any[]> {
    const response = await this.client.get('/vacancies/favorites', { params });
    return response.data.vacancies;
  }

  // ===================================
  // GUEST VIEWS SYNC API (Architecture v3)
  // ===================================

  async syncGuestViews(viewsData: {
    count: number;
    viewedVacancies: string[];
    firstViewAt: string;
    lastViewAt: string;
  }): Promise<{ synced: boolean }> {
    const response = await this.client.post('/analytics/guest-views', viewsData);
    return response.data;
  }

  // ===================================
  // VIDEO RESUME API (Architecture v3)
  // ===================================

  async trackResumeVideoView(videoId: string, data?: {
    applicationId?: string;
    conversationId?: string;
  }): Promise<{ viewsRemaining: number; autoDeleted: boolean }> {
    const response = await this.client.post(`/videos/${videoId}/track-view`, data);
    return response.data;
  }

  async getVideoViewsRemaining(videoId: string): Promise<{ viewsRemaining: number }> {
    const response = await this.client.get(`/videos/${videoId}/views`);
    return response.data;
  }

  // ===================================
  // FCM TOKENS API (Push Notifications)
  // ===================================

  /**
   * Зарегистрировать FCM токен для push-уведомлений
   * @param token FCM токен от Firebase
   */
  async registerFCMToken(token: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/users/fcm-token', { token });
    return response.data;
  }

  /**
   * Удалить FCM токен (при logout или отписке от уведомлений)
   */
  async removeFCMToken(): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete('/users/fcm-token');
    return response.data;
  }

  // ===================================
  // Helper Methods
  // ===================================

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.loadTokensFromStorage();
      return !!this.accessToken;
    } catch (error) {
      return false;
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  }
}

// Export singleton instance
export const api = new APIService();
