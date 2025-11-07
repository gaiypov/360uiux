/**
 * 360° РАБОТА - ULTRA EDITION
 * API Service - Backend Integration
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api/v1'
  : 'https://api.360rabota.ru/api/v1';

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@360rabota:access_token',
  REFRESH_TOKEN: '@360rabota:refresh_token',
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
  role: 'jobseeker' | 'employer';
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
  paymentSystem: 'tinkoff' | 'alfabank';
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
      const [accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }

  private async saveTokens(tokens: AuthTokens) {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);

      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
    } catch (error) {
      console.error('Error saving tokens:', error);
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

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.refreshToken,
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
      // Очищаем токены и данные
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
      ]);

      this.accessToken = null;
      this.refreshToken = null;
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

  // ===================================
  // VACANCIES API (Phase 2)
  // ===================================

  async getVacancies(params?: {
    query?: string;
    cities?: string[];
    experience?: number[];
    employment?: string[];
    schedule?: string[];
    salaryMin?: number;
    salaryMax?: number;
    limit?: number;
    offset?: number;
    sortBy?: 'newest' | 'salary_high' | 'salary_low' | 'most_views';
  }): Promise<{ vacancies: any[]; pagination: any }> {
    const queryParams: any = {};

    if (params?.query) queryParams.query = params.query;
    if (params?.cities?.length) queryParams.cities = params.cities.join(',');
    if (params?.experience?.length) queryParams.experience = params.experience.join(',');
    if (params?.employment?.length) queryParams.employment = params.employment.join(',');
    if (params?.schedule?.length) queryParams.schedule = params.schedule.join(',');
    if (params?.salaryMin) queryParams.salaryMin = params.salaryMin;
    if (params?.salaryMax) queryParams.salaryMax = params.salaryMax;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset) queryParams.offset = params.offset;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;

    const response = await this.client.get('/vacancies', { params: queryParams });
    return response.data;
  }

  async getVacancy(vacancyId: string): Promise<any> {
    const response = await this.client.get(`/vacancies/${vacancyId}`);
    return response.data.vacancy;
  }

  async createVacancy(data: {
    title: string;
    profession: string;
    description?: string;
    requirements?: string;
    benefits?: string;
    responsibilities?: string;
    salaryMin?: number;
    salaryMax?: number;
    currency?: string;
    city: string;
    address?: string;
    metroStation?: string;
    employment?: string;
    schedule?: string;
    experienceRequired?: number;
    videoUrl?: string;
    thumbnailUrl?: string;
    tags?: string[];
  }): Promise<any> {
    const response = await this.client.post('/vacancies', data);
    return response.data.vacancy;
  }

  async updateVacancy(vacancyId: string, data: Partial<{
    title: string;
    profession: string;
    description: string;
    requirements: string;
    benefits: string;
    responsibilities: string;
    salaryMin: number;
    salaryMax: number;
    currency: string;
    city: string;
    address: string;
    metroStation: string;
    employment: string;
    schedule: string;
    experienceRequired: number;
    videoUrl: string;
    thumbnailUrl: string;
    tags: string[];
    status: string;
  }>): Promise<any> {
    const response = await this.client.put(`/vacancies/${vacancyId}`, data);
    return response.data.vacancy;
  }

  async deleteVacancy(vacancyId: string): Promise<void> {
    await this.client.delete(`/vacancies/${vacancyId}`);
  }

  async getFilterOptions(): Promise<{
    cities: string[];
    professions: string[];
    employmentTypes: string[];
    schedules: string[];
    experienceLevels: Array<{ value: number; label: string }>;
  }> {
    const response = await this.client.get('/vacancies/filters');
    return response.data.filters;
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
  // USER PROFILE API (Phase 2)
  // ===================================

  async getProfile(): Promise<{
    user: any;
  }> {
    const response = await this.client.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: Partial<{
    name: string;
    email: string;
    companyName: string;
    description: string;
    website: string;
    address: string;
    city: string;
  }>): Promise<{ user: any }> {
    const response = await this.client.put('/users/profile', data);
    return response.data;
  }

  async uploadAvatar(avatarUrl: string): Promise<{ user: any }> {
    const response = await this.client.post('/users/profile/avatar', { avatarUrl });
    return response.data;
  }

  async deleteAccount(confirmPassword: string): Promise<void> {
    await this.client.delete('/users/profile', {
      data: { confirmPassword },
    });
  }

  async getUserById(userId: string): Promise<{ user: any }> {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  // ===================================
  // APPLICATIONS API (Phase 2)
  // ===================================

  async getMyApplications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ applications: any[]; count: number }> {
    const response = await this.client.get('/applications/my', { params });
    return response.data;
  }

  async getApplication(applicationId: string): Promise<{ application: any }> {
    const response = await this.client.get(`/applications/${applicationId}`);
    return response.data;
  }

  async createApplication(data: {
    vacancyId: string;
    resumeId?: string;
    message?: string;
    attachResumeVideo?: boolean;
  }): Promise<{ application: any }> {
    const response = await this.client.post('/applications', data);
    return response.data;
  }

  async deleteApplication(applicationId: string): Promise<void> {
    await this.client.delete(`/applications/${applicationId}`);
  }

  async getApplicationsByStatus(status?: string): Promise<{
    applications: any[];
    count: number;
    status: string;
  }> {
    const response = await this.client.get('/applications', {
      params: { status },
    });
    return response.data;
  }

  async updateApplicationStatus(
    applicationId: string,
    data: {
      status: 'pending' | 'viewed' | 'interview' | 'rejected' | 'hired' | 'cancelled';
      rejectionReason?: string;
    }
  ): Promise<{ application: any }> {
    const response = await this.client.patch(`/applications/${applicationId}/status`, data);
    return response.data;
  }

  // ===================================
  // DEVICE & NOTIFICATIONS API (Phase 2)
  // ===================================

  async registerDevice(data: {
    deviceType: 'ios' | 'android' | 'web';
    fcmToken?: string;
    apnsToken?: string;
    webPushSubscription?: any;
    deviceModel?: string;
    osVersion?: string;
    appVersion?: string;
  }): Promise<{ device: any }> {
    const response = await this.client.post('/devices/register', data);
    return response.data;
  }

  async unregisterDevice(deviceId: string): Promise<void> {
    await this.client.delete(`/devices/${deviceId}`);
  }

  async getUserDevices(): Promise<{ devices: any[]; count: number }> {
    const response = await this.client.get('/devices');
    return response.data;
  }

  async updateDeviceToken(deviceId: string, data: {
    fcmToken?: string;
    apnsToken?: string;
    webPushSubscription?: any;
  }): Promise<{ device: any }> {
    const response = await this.client.put(`/devices/${deviceId}/token`, data);
    return response.data;
  }

  async getNotificationPreferences(): Promise<{
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    notificationTypes: string[];
  }> {
    const response = await this.client.get('/devices/preferences');
    return response.data.preferences;
  }

  async updateNotificationPreferences(data: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    notificationTypes?: string[];
  }): Promise<{ preferences: any }> {
    const response = await this.client.put('/devices/preferences', data);
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
