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

  async createVacancy(data: {
    title: string;
    profession: string;
    video_url: string;
    thumbnail_url?: string;
    salary_min?: number;
    salary_max?: number;
    currency?: string;
    city: string;
    metro?: string;
    schedule?: string;
    requires_experience?: boolean;
    benefits?: string;
    requirements?: string;
    tags?: string[];
  }): Promise<{ success: boolean; vacancy: any }> {
    const response = await this.client.post('/vacancies', data);
    return response.data;
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
  // RESUME API (Architecture v3)
  // ===================================

  async getMyResumes(): Promise<any[]> {
    const response = await this.client.get('/resumes/my');
    return response.data.resumes;
  }

  async getMyResumeVideo(): Promise<{ video: any | null }> {
    const response = await this.client.get('/resumes/video/my');
    return response.data;
  }

  async createResume(data: {
    name: string;
    profession: string;
    city: string;
    salaryExpected?: string;
    about?: string;
    videoId?: string;
    videoUrl?: string;
    hlsUrl?: string;
    thumbnailUrl?: string;
  }): Promise<{ resume: any }> {
    const response = await this.client.post('/resumes', data);
    return response.data;
  }

  async updateResume(resumeId: string, data: {
    name?: string;
    profession?: string;
    city?: string;
    salaryExpected?: string;
    about?: string;
    videoId?: string;
  }): Promise<{ resume: any }> {
    const response = await this.client.put(`/resumes/${resumeId}`, data);
    return response.data;
  }

  async deleteResume(resumeId: string): Promise<{ success: boolean }> {
    const response = await this.client.delete(`/resumes/${resumeId}`);
    return response.data;
  }

  // ===================================
  // APPLICATION API (Architecture v3)
  // ===================================

  async createApplication(data: {
    vacancyId: string;
    message?: string;
    attachResumeVideo: boolean;
    resumeId?: string;
  }): Promise<{ success: boolean; application: any }> {
    const response = await this.client.post('/applications', data);
    return response.data;
  }

  async getMyApplications(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    const response = await this.client.get('/applications/my', { params });
    return response.data.applications;
  }

  async getApplication(applicationId: string): Promise<any> {
    const response = await this.client.get(`/applications/${applicationId}`);
    return response.data.application;
  }

  async deleteApplication(applicationId: string): Promise<{ success: boolean }> {
    const response = await this.client.delete(`/applications/${applicationId}`);
    return response.data;
  }

  // ===================================
  // LIKES & FAVORITES SYNC API
  // ===================================

  async getMyLikes(): Promise<any[]> {
    const response = await this.client.get('/vacancies/likes/my');
    return response.data.likes;
  }

  async getMyFavorites(): Promise<any[]> {
    const response = await this.client.get('/vacancies/favorites/my');
    return response.data.favorites;
  }

  // ===================================
  // GUEST VIEW TRACKING (Priority 3)
  // ===================================

  async trackGuestView(vacancyId: string, guestId?: string): Promise<{
    success: boolean;
    guestId: string;
    count: number;
    limit: number;
    remaining: number;
    limitReached: boolean;
  }> {
    const response = await this.client.post('/guests/views', {
      vacancyId,
      guestId,
    });
    return response.data;
  }

  async getGuestViewStatus(guestId: string): Promise<{
    success: boolean;
    count: number;
    limit: number;
    remaining: number;
    limitReached: boolean;
    vacancyIds: string[];
    lastViewedAt?: string;
  }> {
    const response = await this.client.get(`/guests/views/${guestId}`);
    return response.data;
  }

  async syncGuestViews(guestId: string, vacancyIds: string[]): Promise<{
    success: boolean;
    guestId: string;
    count: number;
    limit: number;
    remaining: number;
    limitReached: boolean;
  }> {
    const response = await this.client.post('/guests/views/sync', {
      guestId,
      vacancyIds,
    });
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
