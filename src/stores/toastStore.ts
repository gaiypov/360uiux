/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Toast Store (Zustand)
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  visible: boolean;
  type: ToastType;
  message: string;
  showToast: (type: ToastType, message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  type: 'info',
  message: '',

  showToast: (type: ToastType, message: string) => {
    set({ visible: true, type, message });
  },

  hideToast: () => {
    set({ visible: false });
  },
}));
