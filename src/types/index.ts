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
