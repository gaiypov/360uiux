/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Favorites Store (Zustand)
 */

import { create } from 'zustand';
import { Vacancy } from '@/types';

interface FavoritesState {
  favorites: Vacancy[];
  addFavorite: (vacancy: Vacancy) => void;
  removeFavorite: (vacancyId: string) => void;
  isFavorite: (vacancyId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  addFavorite: (vacancy: Vacancy) => {
    const { favorites } = get();
    if (!favorites.find((v) => v.id === vacancy.id)) {
      set({ favorites: [...favorites, vacancy] });
    }
  },

  removeFavorite: (vacancyId: string) => {
    set((state) => ({
      favorites: state.favorites.filter((v) => v.id !== vacancyId),
    }));
  },

  isFavorite: (vacancyId: string) => {
    return get().favorites.some((v) => v.id === vacancyId);
  },

  clearFavorites: () => {
    set({ favorites: [] });
  },
}));
