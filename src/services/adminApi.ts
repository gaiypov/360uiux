/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin API Service - Revolut Style
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@360rabota:access_token',
};

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
          this.accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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

  private handleUnauthorized() {
    // Clear tokens and redirect to login
    AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    this.accessToken = null;
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
}

export const adminApi = new AdminAPIService();
