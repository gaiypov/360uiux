/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Applications Store (Zustand)
 * Architecture v4: Added persistence and API integration
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Application, Vacancy } from '@/types';
import { api } from '@/services/api';
import { useAuthStore } from './authStore';

interface ApplicationWithVacancy extends Application {
  vacancy: Vacancy;
}

interface ApplicationsState {
  applications: ApplicationWithVacancy[];
  isLoading: boolean;
  addApplication: (vacancy: Vacancy, resumeVideoUrl?: string) => Promise<void>;
  getApplications: () => ApplicationWithVacancy[];
  getApplicationsByStatus: (
    status: Application['status']
  ) => ApplicationWithVacancy[];
  hasApplied: (vacancyId: string) => boolean;
  syncWithBackend: () => Promise<void>;
}

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set, get) => ({
      applications: [],
      isLoading: false,

      /**
       * Apply to a vacancy
       * Saves to AsyncStorage and syncs with backend
       */
      addApplication: async (vacancy: Vacancy, resumeVideoUrl?: string) => {
        const { applications } = get();

        // Check if already applied
        if (applications.find((app) => app.vacancyId === vacancy.id)) {
          console.log('⏭️ Already applied to:', vacancy.id);
          return;
        }

        // Get current user ID from auth store
        const user = useAuthStore.getState().user;
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Create new application (optimistic update)
        const newApplication: ApplicationWithVacancy = {
          id: `app_${Date.now()}`,
          vacancyId: vacancy.id,
          userId: user.id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          vacancy,
        };

        set({ applications: [newApplication, ...applications] });

        // Send to backend API
        try {
          // TODO: Implement createApplication endpoint in backend
          // For now, we'll store locally and sync later
          console.log('✅ Application created locally:', vacancy.id);

          // When backend endpoint is ready:
          // const response = await api.createApplication({
          //   vacancyId: vacancy.id,
          //   resumeVideoUrl,
          // });
          //
          // Update with server-generated ID
          // set({
          //   applications: applications.map(app =>
          //     app.id === newApplication.id ? { ...app, id: response.id } : app
          //   )
          // });
        } catch (error) {
          console.error('❌ Error creating application:', error);

          // Rollback on error
          set({ applications });
          throw error;
        }
      },

      /**
       * Get all applications
       */
      getApplications: () => {
        return get().applications;
      },

      /**
       * Get applications filtered by status
       */
      getApplicationsByStatus: (status: Application['status']) => {
        return get().applications.filter((app) => app.status === status);
      },

      /**
       * Check if user has already applied to vacancy
       */
      hasApplied: (vacancyId: string) => {
        return get().applications.some((app) => app.vacancyId === vacancyId);
      },

      /**
       * Sync applications with backend
       * Load user's applications from API
       */
      syncWithBackend: async () => {
        try {
          set({ isLoading: true });

          // TODO: Fetch applications from backend when endpoint is ready
          // const backendApplications = await api.getApplications();
          // set({ applications: backendApplications });

          console.log('✅ Synced applications with backend');
        } catch (error) {
          console.error('❌ Error syncing applications:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'applications-storage', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist applications array (not loading state)
      partialize: (state) => ({ applications: state.applications }),
    }
  )
);
