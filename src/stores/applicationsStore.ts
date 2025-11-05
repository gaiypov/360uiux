/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Applications Store (Zustand)
 */

import { create } from 'zustand';
import { Application, Vacancy } from '@/types';

interface ApplicationWithVacancy extends Application {
  vacancy: Vacancy;
}

interface ApplicationsState {
  applications: ApplicationWithVacancy[];
  addApplication: (vacancy: Vacancy) => Promise<void>;
  getApplications: () => ApplicationWithVacancy[];
  getApplicationsByStatus: (
    status: Application['status']
  ) => ApplicationWithVacancy[];
  hasApplied: (vacancyId: string) => boolean;
}

export const useApplicationsStore = create<ApplicationsState>((set, get) => ({
  applications: [],

  addApplication: async (vacancy: Vacancy) => {
    const { applications } = get();

    // Check if already applied
    if (applications.find((app) => app.vacancyId === vacancy.id)) {
      return;
    }

    // Create new application
    const newApplication: ApplicationWithVacancy = {
      id: `app_${Date.now()}`,
      vacancyId: vacancy.id,
      userId: '1', // TODO: Get from auth store
      status: 'pending',
      createdAt: new Date().toISOString(),
      vacancy,
    };

    set({ applications: [newApplication, ...applications] });

    // TODO: Send to API
    // await applicationAPI.apply(vacancy.id);
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
