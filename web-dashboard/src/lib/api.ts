/**
 * 360° РАБОТА - Web Dashboard API Service
 * REST API client for employer dashboard
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Types
export interface Vacancy {
  id: string;
  title: string;
  profession: string;
  city: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requirements?: string;
  benefits?: string;
  experience?: number;
  employment?: string;
  schedule?: string;
  videoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  moderationComment?: string;
  viewsCount: number;
  applicationsCount?: number;
  employer?: {
    id: string;
    companyName: string;
    verified: boolean;
    rating?: number;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  vacancyId: string;
  coverLetter?: string;
  videoUrl?: string;
  resumeUrl?: string;
  status: 'NEW' | 'VIEWED' | 'INTERVIEW' | 'REJECTED' | 'HIRED';
  videoViewCount: number;
  videoDeletedAt?: string;
  user?: {
    id: string;
    name: string;
    phone: string;
    avatarUrl?: string;
  };
  vacancy?: {
    id: string;
    title: string;
    profession: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  activeVacancies: number;
  totalApplications: number;
  newApplicationsToday: number;
  responseRate: number;
  totalViews: number;
  conversionRate: number;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  role: 'JOBSEEKER' | 'EMPLOYER';
  companyName?: string;
  description?: string;
  avatarUrl?: string;
  website?: string;
  address?: string;
  city?: string;
  rating?: number;
  verified: boolean;
  createdAt: string;
  statistics?: any;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
        message: response.statusText,
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // ==================== Auth ====================

  async login(phone: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  // ==================== Vacancies ====================

  async getVacancies(params?: {
    query?: string;
    cities?: string[];
    experience?: number[];
    employment?: string[];
    schedule?: string[];
    salaryMin?: number;
    salaryMax?: number;
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
  }): Promise<{ vacancies: Vacancy[]; pagination: any }> {
    const queryParams = new URLSearchParams();

    if (params?.query) queryParams.append('query', params.query);
    if (params?.cities?.length) queryParams.append('cities', params.cities.join(','));
    if (params?.experience?.length) queryParams.append('experience', params.experience.join(','));
    if (params?.employment?.length) queryParams.append('employment', params.employment.join(','));
    if (params?.schedule?.length) queryParams.append('schedule', params.schedule.join(','));
    if (params?.salaryMin) queryParams.append('salaryMin', params.salaryMin.toString());
    if (params?.salaryMax) queryParams.append('salaryMax', params.salaryMax.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    return this.request(`/vacancies?${queryParams.toString()}`);
  }

  async getVacancy(id: string): Promise<{ vacancy: Vacancy }> {
    return this.request(`/vacancies/${id}`);
  }

  async createVacancy(data: Partial<Vacancy>): Promise<{ vacancy: Vacancy }> {
    return this.request('/vacancies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVacancy(id: string, data: Partial<Vacancy>): Promise<{ vacancy: Vacancy }> {
    return this.request(`/vacancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVacancy(id: string): Promise<{ success: boolean }> {
    return this.request(`/vacancies/${id}`, {
      method: 'DELETE',
    });
  }

  async getFilterOptions(): Promise<{
    cities: string[];
    professions: string[];
    employmentTypes: string[];
    scheduleTypes: string[];
  }> {
    return this.request('/vacancies/filters/options');
  }

  // ==================== Applications ====================

  async getApplications(params?: {
    vacancyId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ applications: Application[]; pagination: any }> {
    const queryParams = new URLSearchParams();

    if (params?.vacancyId) queryParams.append('vacancyId', params.vacancyId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request(`/applications?${queryParams.toString()}`);
  }

  async getApplicationsByVacancy(vacancyId: string): Promise<{ applications: Application[] }> {
    return this.request(`/applications/vacancy/${vacancyId}`);
  }

  async getApplication(id: string): Promise<{ application: Application }> {
    return this.request(`/applications/${id}`);
  }

  async updateApplicationStatus(
    id: string,
    data: { status: string; message?: string }
  ): Promise<{ application: Application }> {
    return this.request(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ==================== Profile ====================

  async getProfile(): Promise<{ user: User }> {
    return this.request('/users/profile');
  }

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(avatarUrl: string): Promise<{ user: User }> {
    return this.request('/users/profile/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl }),
    });
  }

  // ==================== Dashboard Stats ====================

  async getDashboardStats(): Promise<DashboardStats> {
    const [vacancies, applications] = await Promise.all([
      this.getVacancies({ limit: 1 }),
      this.getApplications({ limit: 1 }),
    ]);

    // Calculate stats from responses
    // This is a simplified version - in production, you'd have a dedicated endpoint
    return {
      activeVacancies: vacancies.pagination?.total || 0,
      totalApplications: applications.pagination?.total || 0,
      newApplicationsToday: 0, // Would need a date filter
      responseRate: 0,
      totalViews: 0,
      conversionRate: 0,
    };
  }

  // ==================== Analytics ====================

  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalViews: number;
    totalApplications: number;
    conversionRate: number;
    averageTimeToHire: number;
    vacancyPerformance: any[];
    applicationsOverTime: any[];
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    // Placeholder - this endpoint would need to be created in backend
    return {
      totalViews: 0,
      totalApplications: 0,
      conversionRate: 0,
      averageTimeToHire: 0,
      vacancyPerformance: [],
      applicationsOverTime: [],
    };
  }

  // ==================== Wallet ====================

  async getWalletBalance(): Promise<{ balance: number; currency: string }> {
    return this.request('/billing/wallet/balance');
  }

  async getTransactions(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: any[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    return this.request(`/billing/wallet/transactions?${queryParams.toString()}`);
  }

  async initPayment(amount: number): Promise<{ paymentUrl: string; orderId: string }> {
    return this.request('/billing/payment/init', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }
}

export const api = new ApiService();
