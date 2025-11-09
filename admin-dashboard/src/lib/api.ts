/**
 * 360° РАБОТА - Admin Dashboard API Client
 * Connects to backend API with moderator authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;

    // Load token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || 'Ошибка запроса',
        };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: 'Ошибка соединения с сервером',
      };
    }
  }

  // Auth
  async login(phone: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/moderator/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  // Moderation - Vacancies
  async getPendingVacancies(limit = 20) {
    return this.request<any[]>(`/moderation/vacancies/pending?limit=${limit}`, {
      method: 'GET',
    });
  }

  async approveVacancy(vacancyId: string) {
    return this.request<any>(`/moderation/vacancies/${vacancyId}/approve`, {
      method: 'POST',
    });
  }

  async rejectVacancy(vacancyId: string, reason: string) {
    return this.request<any>(`/moderation/vacancies/${vacancyId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Moderation - Users
  async getPendingUsers(limit = 20) {
    return this.request<any[]>(`/moderation/users/pending?limit=${limit}`, {
      method: 'GET',
    });
  }

  async approveUser(userId: string) {
    return this.request<any>(`/moderation/users/${userId}/approve`, {
      method: 'POST',
    });
  }

  async rejectUser(userId: string, reason: string) {
    return this.request<any>(`/moderation/users/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async banUser(userId: string, reason: string, duration?: number) {
    return this.request<any>(`/moderation/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason, duration }),
    });
  }

  // Analytics
  async getStats() {
    return this.request<{
      totalVacancies: number;
      totalUsers: number;
      pendingVacancies: number;
      pendingUsers: number;
      todayRegistrations: number;
      todayVacancies: number;
    }>('/moderation/stats', {
      method: 'GET',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
