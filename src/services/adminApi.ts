/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin API Service - Revolut Style
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecureStorage, SECURE_STORAGE_KEYS, migrateFromAsyncStorage } from '../utils/SecureStorage';
import {
  AdminDashboardStats,
  AdminUser,
  AdminVacancy,
  AdminComplaint,
  AdminSettings,
  PaginationMeta,
  AdminFinancialStats,
  AdminTransaction,
} from '../types';

const API_BASE_URL = __DEV__
  ? 'http://localhost:5000/api/v1'
  : 'https://api.360rabota.ru/api/v1';

// Legacy AsyncStorage key (for migration)
const LEGACY_ADMIN_TOKEN_KEY = '@360rabota:admin_access_token';

class AdminAPIService {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/admin`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      async (config) => {
        if (!this.accessToken) {
          // Try loading from SecureStorage first
          this.accessToken = await SecureStorage.getItem(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN);

          // Migration: If not found, check legacy AsyncStorage
          if (!this.accessToken) {
            const migrated = await migrateFromAsyncStorage(
              AsyncStorage,
              LEGACY_ADMIN_TOKEN_KEY,
              SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN
            );
            if (migrated) {
              this.accessToken = await SecureStorage.getItem(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN);
            }
          }
        }

        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleUnauthorized() {
    // Clear tokens from both SecureStorage and legacy AsyncStorage
    await Promise.all([
      SecureStorage.removeItem(SECURE_STORAGE_KEYS.ADMIN_ACCESS_TOKEN),
      AsyncStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY),
    ]);
    this.accessToken = null;
    console.log('✅ Admin unauthorized - tokens cleared');
    // Navigation handled by React Navigation interceptors
  }

  /**
   * Дашборд аналитика
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await this.client.get('/dashboard');
    return response.data;
  }

  /**
   * Получить пользователей
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    verified?: boolean;
  }): Promise<{ users: AdminUser[]; pagination: PaginationMeta }> {
    const response = await this.client.get('/users', { params });
    return response.data;
  }

  /**
   * Обновить пользователя
   */
  async updateUser(
    userId: string,
    data: {
      verified?: boolean;
      balance?: number;
      role?: string;
    }
  ): Promise<{ message: string; user: AdminUser }> {
    const response = await this.client.put(`/users/${userId}`, data);
    return response.data;
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/users/${userId}`);
    return response.data;
  }

  /**
   * Получить вакансии
   */
  async getVacancies(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ vacancies: AdminVacancy[]; pagination: PaginationMeta }> {
    const response = await this.client.get('/vacancies', { params });
    return response.data;
  }

  /**
   * Обновить вакансию
   */
  async updateVacancy(
    vacancyId: string,
    data: {
      status?: string;
      isTop?: boolean;
    }
  ): Promise<{ message: string; vacancy: AdminVacancy }> {
    const response = await this.client.put(`/vacancies/${vacancyId}`, data);
    return response.data;
  }

  /**
   * Удалить вакансию
   */
  async deleteVacancy(vacancyId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/vacancies/${vacancyId}`);
    return response.data;
  }

  /**
   * Получить жалобы
   */
  async getComplaints(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ complaints: AdminComplaint[]; pagination: PaginationMeta }> {
    const response = await this.client.get('/complaints', { params });
    return response.data;
  }

  /**
   * Обработать жалобу
   */
  async processComplaint(
    complaintId: string,
    data: {
      status: 'approved' | 'rejected';
      moderatorComment?: string;
      blockVideo?: boolean;
    }
  ): Promise<{ message: string; complaint: AdminComplaint }> {
    const response = await this.client.put(`/complaints/${complaintId}/process`, data);
    return response.data;
  }

  /**
   * Получить системные настройки
   */
  async getSettings(): Promise<{ settings: AdminSettings }> {
    const response = await this.client.get('/settings');
    return response.data;
  }

  /**
   * Обновить системные настройки
   */
  async updateSettings(settings: Partial<AdminSettings>): Promise<{ message: string; settings: AdminSettings }> {
    const response = await this.client.put('/settings', settings);
    return response.data;
  }

  /**
   * Получить финансовую статистику
   */
  async getFinancialStats(params?: { period?: '24h' | '7d' | '30d' | '90d' }): Promise<AdminFinancialStats> {
    const response = await this.client.get('/financial-stats', { params });
    return response.data;
  }

  /**
   * Получить транзакции
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    employerId?: string;
  }): Promise<{ transactions: AdminTransaction[]; pagination: PaginationMeta }> {
    const response = await this.client.get('/transactions', { params });
    return response.data;
  }

  /**
   * Получить детали транзакции
   */
  async getTransactionDetails(transactionId: string): Promise<{ transaction: AdminTransaction }> {
    const response = await this.client.get(`/transactions/${transactionId}`);
    return response.data;
  }

  /**
   * Получить тарифные планы
   */
  async getPricingPlans(): Promise<{ plans: any[] }> {
    const response = await this.client.get('/pricing');
    return response.data;
  }

  /**
   * Создать тарифный план
   */
  async createPricingPlan(data: {
    name: string;
    description?: string;
    vacancy_post_price: number;
    vacancy_top_price: number;
    vacancy_boost_price: number;
    application_view_price: number;
    is_active: boolean;
  }): Promise<any> {
    const response = await this.client.post('/pricing', data);
    return response.data;
  }

  /**
   * Обновить тарифный план
   */
  async updatePricingPlan(planId: string, data: Partial<{
    name: string;
    description?: string;
    vacancy_post_price: number;
    vacancy_top_price: number;
    vacancy_boost_price: number;
    application_view_price: number;
    is_active: boolean;
  }>): Promise<any> {
    const response = await this.client.put(`/pricing/${planId}`, data);
    return response.data;
  }

  /**
   * Удалить тарифный план
   */
  async deletePricingPlan(planId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/pricing/${planId}`);
    return response.data;
  }

  /**
   * Получить счета
   */
  async getInvoices(params?: {
    page?: number;
    limit?: number;
    status?: string;
    employerId?: string;
  }): Promise<{ invoices: any[]; pagination: PaginationMeta }> {
    const response = await this.client.get('/invoices', { params });
    return response.data;
  }

  /**
   * Обновить счёт
   */
  async updateInvoice(invoiceId: string, data: {
    status?: string;
    paid_date?: Date;
  }): Promise<{ message: string; invoice: any }> {
    const response = await this.client.put(`/invoices/${invoiceId}`, data);
    return response.data;
  }
}

export const adminApi = new AdminAPIService();
