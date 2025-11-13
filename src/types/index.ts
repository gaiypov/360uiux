/**
 * 360° РАБОТА - Revolut Ultra Edition
 * TypeScript Type Definitions
 */

export interface Vacancy {
  id: string;
  title: string;
  employer: Employer;
  salaryMin: number;
  salaryMax?: number;
  city: string;
  metro?: string;
  videoUrl: string;
  benefits: string[];
  applications: number;
  commentsCount?: number; // Architecture v3: TikTok-style comments
  createdAt: string;
  description?: string;
  requirements?: string[];
  schedule?: string;
  experience?: string;
}

export interface Employer {
  id: string;
  companyName: string;
  rating: number;
  logoUrl?: string;
  verified: boolean;
  industry?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'jobseeker' | 'employer';
  profile: JobSeekerProfile | EmployerProfile;
}

export interface JobSeekerProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  city: string;
  profession?: string;
  experience?: number;
  resume?: string;
}

export interface EmployerProfile {
  companyName: string;
  logo?: string;
  industry: string;
  website?: string;
  verified: boolean;
}

export interface Application {
  id: string;
  vacancyId: string;
  userId: string;
  status: 'pending' | 'viewed' | 'accepted' | 'rejected';
  createdAt: string;
}

// ===============================
// ADMIN PANEL TYPES
// ===============================

export interface AdminDashboardStats {
  overview: {
    totalUsers: number;
    totalJobseekers: number;
    totalEmployers: number;
    totalVacancies: number;
    activeVacancies: number;
    totalApplications: number;
    totalVideos: number;
  };
  moderation: {
    pendingModeration: number;
    totalComplaints: number;
    pendingComplaints: number;
  };
  today: {
    newUsers: number;
    newVacancies: number;
    newApplications: number;
  };
  charts: {
    weeklyUsers: ChartDataPoint[];
    weeklyVacancies: ChartDataPoint[];
  };
  topEmployers: TopEmployer[];
}

export interface ChartDataPoint {
  date: string;
  count: number;
}

export interface TopEmployer {
  id: string;
  name: string;
  vacanciesCount: number;
  totalApplications: number;
  verified: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'JOBSEEKER' | 'EMPLOYER' | 'MODERATOR';
  companyName?: string;
  verified: boolean;
  balance: number;
  createdAt: string;
  stats: {
    vacancies: number;
    applications: number;
    videos: number;
  };
}

export interface AdminVacancy {
  id: string;
  title: string;
  profession: string;
  city: string;
  salaryMin?: number;
  salaryMax?: number;
  status: string;
  views: number;
  applicationsCount: number;
  isTop: boolean;
  employer: {
    id: string;
    name: string;
    verified: boolean;
  };
  createdAt: string;
}

export interface AdminComplaint {
  id: string;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  moderatorComment?: string;
  video: {
    id: string;
    title: string;
    type: 'VACANCY' | 'RESUME';
    status: string;
    user: {
      id: string;
      name: string;
    };
  };
}

export interface AdminSettings {
  autoModeration: boolean;
  guestViewLimit: number;
  resumeVideoViewLimit: number;
  topVacancyCostPerDay: number;
  minimumWithdrawal: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
