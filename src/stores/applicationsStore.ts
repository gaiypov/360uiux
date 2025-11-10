/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Applications Store (Zustand)
 */

import { create } from 'zustand';
import { Application, Vacancy } from '@/types';
import { api } from '@/services/api';
import { useAuthStore } from './authStore';

interface ApplicationWithVacancy extends Application {
  vacancy: Vacancy;
}

interface ApplicationsState {
  applications: ApplicationWithVacancy[];
  loading: boolean;
  error: string | null;
  addApplication: (vacancy: Vacancy) => Promise<void>;
  fetchApplications: () => Promise<void>;
  getApplications: () => ApplicationWithVacancy[];
  getApplicationsByStatus: (
    status: Application['status']
  ) => ApplicationWithVacancy[];
  hasApplied: (vacancyId: string) => boolean;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,

  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.getMyApplications();
      const applications = response.applications || [];

      // Transform to ApplicationWithVacancy format
      const applicationsWithVacancy: ApplicationWithVacancy[] = applications.map(
        (app: any) => ({
          id: app.id,
          vacancyId: app.vacancy_id,
          userId: app.jobseeker_id,
          status: app.status || 'pending',
          createdAt: app.created_at,
          message: app.message,
          vacancy: app.vacancy || {
            id: app.vacancy_id,
            title: 'Вакансия',
            company_name: 'Компания',
          },
        })
      );

      set({ applications: applicationsWithVacancy, loading: false });
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      set({ error: error.message || 'Failed to fetch applications', loading: false });
    }
  },

  addApplication: async (vacancy: Vacancy) => {
    const { applications } = get();

    // Check if already applied
    if (applications.find((app) => app.vacancyId === vacancy.id)) {
      return;
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Optimistic update
    const tempApplication: ApplicationWithVacancy = {
      id: `app_${Date.now()}`,
      vacancyId: vacancy.id,
      userId: user.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      vacancy,
    };

    set({ applications: [tempApplication, ...applications] });

    try {
      // Send to API - Note: This is for simple apply without message
      // For full application with message, use ApplicationScreen
      const result = await api.createApplication({
        vacancyId: vacancy.id,
        message: '',
        attachResumeVideo: false,
      });

      // Update with real application data
      const realApplication: ApplicationWithVacancy = {
        id: result.application.id,
        vacancyId: result.application.vacancy_id,
        userId: result.application.jobseeker_id,
        status: result.application.status || 'pending',
        createdAt: result.application.created_at,
        vacancy,
      };

      set({
        applications: [
          realApplication,
          ...applications.filter((app) => app.id !== tempApplication.id),
        ],
      });
    } catch (error: any) {
      console.error('Error creating application:', error);
      // Revert optimistic update
      set({ applications: applications.filter((app) => app.id !== tempApplication.id) });
      throw error;
    }
  },

  getApplications: () => {
    return get().applications;
  },

  getApplicationsByStatus: (status: Application['status']) => {
    return get().applications.filter((app) => app.status === status);
  },

  hasApplied: (vacancyId: string) => {
    return get().applications.some((app) => app.vacancyId === vacancyId);
  },
}));
