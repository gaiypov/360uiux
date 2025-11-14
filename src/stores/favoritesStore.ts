/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Favorites Store (Zustand)
 * Architecture v4: Added persistence with AsyncStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vacancy } from '@/types';
import { api } from '@/services/api';

interface FavoritesState {
  favorites: Vacancy[];
  isLoading: boolean;
  isSyncing: boolean;
  addFavorite: (vacancy: Vacancy) => Promise<void>;
  removeFavorite: (vacancyId: string) => Promise<void>;
  isFavorite: (vacancyId: string) => boolean;
  clearFavorites: () => void;
  syncWithBackend: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      isSyncing: false,

      /**
       * Add vacancy to favorites
       * Saves to AsyncStorage and syncs with backend
       */
      addFavorite: async (vacancy: Vacancy) => {
        const { favorites } = get();

        // Check if already favorited
        if (favorites.find((v) => v.id === vacancy.id)) {
          console.log('⏭️ Already favorited:', vacancy.id);
          return;
        }

        // Optimistic update - add to local storage immediately
        set({ favorites: [...favorites, vacancy] });

        // Sync with backend API
        try {
          await api.favoriteVacancy(vacancy.id);
          console.log('✅ Favorited vacancy:', vacancy.id);
        } catch (error) {
          console.error('❌ Error favoriting vacancy:', error);
          // Rollback on error
          set({ favorites });
        }
      },

      /**
       * Remove vacancy from favorites
       * Saves to AsyncStorage and syncs with backend
       */
      removeFavorite: async (vacancyId: string) => {
        const { favorites } = get();

        // Optimistic update - remove from local storage immediately
        const newFavorites = favorites.filter((v) => v.id !== vacancyId);
        set({ favorites: newFavorites });

        // Sync with backend API
        try {
          await api.unfavoriteVacancy(vacancyId);
          console.log('✅ Unfavorited vacancy:', vacancyId);
        } catch (error) {
          console.error('❌ Error unfavoriting vacancy:', error);
          // Rollback on error
          set({ favorites });
        }
      },

      /**
       * Check if vacancy is favorited
       */
      isFavorite: (vacancyId: string) => {
        return get().favorites.some((v) => v.id === vacancyId);
      },

      /**
       * Clear all favorites
       */
      clearFavorites: () => {
        set({ favorites: [] });
      },

      /**
       * Sync favorites with backend
       * Load user's favorites from API and merge with local
       */
      syncWithBackend: async () => {
        try {
          set({ isSyncing: true });

          // Fetch favorites from backend
          const backendFavorites = await api.getFavorites();

          // Merge with local favorites (backend is source of truth)
          set({ favorites: backendFavorites });

          console.log('✅ Synced favorites with backend:', backendFavorites.length);
        } catch (error: any) {
          console.error('❌ Error syncing favorites:', error);

          // If API not implemented, keep local favorites
          if (error.message === 'VACANCY_API_NOT_IMPLEMENTED') {
            console.warn('⚠️ Backend sync not available, using local favorites');
          }
        } finally {
          set({ isSyncing: false });
        }
      },
    }),
    {
      name: 'favorites-storage', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist favorites array (not loading/syncing states)
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
