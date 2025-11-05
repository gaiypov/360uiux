/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Auth Store (Zustand)
 */

import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  switchRole: (role: 'jobseeker' | 'employer') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });

    // Mock login - в реальном приложении здесь API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockUser: User = {
      id: '1',
      email,
      role: 'jobseeker',
      profile: {
        firstName: 'Иван',
        lastName: 'Иванов',
        city: 'Москва',
      },
    };

    set({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  setUser: (user: User) => {
    set({
      user,
      isAuthenticated: true,
    });
  },

  switchRole: (role: 'jobseeker' | 'employer') => {
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    }));
  },
}));
