/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Auth Store (Zustand)
 * Architecture v3: Integrated with API service
 */

import { create } from 'zustand';
import { api, User as APIUser } from '@/services/api';
import { User } from '@/types';
import { resetGuestViews, getGuestViews } from '@/utils/guestViewCounter';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (user: APIUser) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  switchRole: (role: 'jobseeker' | 'employer') => void;
  syncGuestViews: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  /**
   * Initialize auth state from storage
   */
  initialize: async () => {
    try {
      set({ isLoading: true });

      const storedUser = await api.getStoredUser();
      const isAuth = await api.isAuthenticated();

      if (storedUser && isAuth) {
        // Convert APIUser to User type
        const user: User = {
          id: storedUser.id,
          email: storedUser.email || storedUser.phone,
          role: storedUser.role,
          profile: {
            firstName: storedUser.name || '',
            lastName: '',
            city: '',
          },
        };

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  /**
   * Login user and sync guest views
   */
  login: async (apiUser: APIUser) => {
    try {
      // Convert APIUser to User type
      const user: User = {
        id: apiUser.id,
        email: apiUser.email || apiUser.phone,
        role: apiUser.role,
        profile: {
          firstName: apiUser.name || '',
          lastName: '',
          city: '',
        },
      };

      set({
        user,
        isAuthenticated: true,
      });

      // Sync guest views to backend
      await get().syncGuestViews();

      // Reset guest views counter after successful registration
      await resetGuestViews();
    } catch (error) {
      console.error('Error during login:', error);
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  /**
   * Set user directly (for backward compatibility)
   */
  setUser: (user: User) => {
    set({
      user,
      isAuthenticated: true,
    });
  },

  /**
   * Switch between jobseeker and employer roles
   */
  switchRole: (role: 'jobseeker' | 'employer') => {
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    }));
  },

  /**
   * Sync guest views to backend (Architecture v3)
   */
  syncGuestViews: async () => {
    try {
      const guestViews = await getGuestViews();

      // Only sync if user viewed some vacancies as guest
      if (guestViews.count > 0) {
        await api.syncGuestViews({
          count: guestViews.count,
          viewedVacancies: guestViews.viewedVacancies,
          firstViewAt: guestViews.firstViewAt,
          lastViewAt: guestViews.lastViewAt,
        });

        console.log(`Synced ${guestViews.count} guest views to backend`);
      }
    } catch (error) {
      console.error('Error syncing guest views:', error);
      // Don't throw - this is not critical for user flow
    }
  },
}));
