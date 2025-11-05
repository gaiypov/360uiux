/**
 * 360° РАБОТА - Revolut Ultra Edition
 * API Service
 */

import axios from 'axios';
import { Vacancy, User } from '@/types';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.360rabota.ru/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления токена
api.interceptors.request.use(
  (config) => {
    // В реальном приложении здесь получение токена из AsyncStorage
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - logout user
      console.log('Unauthorized - logging out');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ user: User; token: string }>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, password: string, role: 'jobseeker' | 'employer') => {
    const response = await api.post<{ user: User; token: string }>('/auth/register', {
      email,
      password,
      role,
    });
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};

// Vacancy API
export const vacancyAPI = {
  getVacancies: async (page = 1, limit = 10) => {
    const response = await api.get<{ vacancies: Vacancy[]; total: number }>(
      '/vacancies',
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  getVacancyById: async (id: string) => {
    const response = await api.get<Vacancy>(`/vacancies/${id}`);
    return response.data;
  },

  searchVacancies: async (query: string) => {
    const response = await api.get<{ vacancies: Vacancy[] }>('/vacancies/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// Application API
export const applicationAPI = {
  apply: async (vacancyId: string) => {
    const response = await api.post('/applications', { vacancyId });
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/applications/me');
    return response.data;
  },
};

export default api;
