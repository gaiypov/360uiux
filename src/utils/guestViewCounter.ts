/**
 * 360° РАБОТА - ULTRA EDITION
 * Guest View Counter
 * Architecture v3: Track guest video views (max 20) + Server sync
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const GUEST_VIEWS_KEY = '@360rabota:guest_views';
const GUEST_ID_KEY = '@360rabota:guest_id';
const MAX_GUEST_VIEWS = 20;

export interface GuestViewsData {
  count: number;
  viewedVacancies: string[];
  firstViewAt: string;
  lastViewAt: string;
}

/**
 * Get current guest views data
 */
export async function getGuestViews(): Promise<GuestViewsData> {
  try {
    const data = await AsyncStorage.getItem(GUEST_VIEWS_KEY);
    if (!data) {
      return {
        count: 0,
        viewedVacancies: [],
        firstViewAt: new Date().toISOString(),
        lastViewAt: new Date().toISOString(),
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting guest views:', error);
    return {
      count: 0,
      viewedVacancies: [],
      firstViewAt: new Date().toISOString(),
      lastViewAt: new Date().toISOString(),
    };
  }
}

/**
 * Increment guest view count
 * @returns Updated views data
 */
export async function incrementGuestView(vacancyId: string): Promise<GuestViewsData> {
  try {
    const currentData = await getGuestViews();

    // Skip if already viewed this vacancy
    if (currentData.viewedVacancies.includes(vacancyId)) {
      return currentData;
    }

    const updatedData: GuestViewsData = {
      count: currentData.count + 1,
      viewedVacancies: [...currentData.viewedVacancies, vacancyId],
      firstViewAt: currentData.firstViewAt || new Date().toISOString(),
      lastViewAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(GUEST_VIEWS_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error('Error incrementing guest view:', error);
    throw error;
  }
}

/**
 * Check if guest has reached view limit
 */
export async function hasReachedViewLimit(): Promise<boolean> {
  try {
    const data = await getGuestViews();
    return data.count >= MAX_GUEST_VIEWS;
  } catch (error) {
    console.error('Error checking view limit:', error);
    return false;
  }
}

/**
 * Get remaining views count
 */
export async function getRemainingViews(): Promise<number> {
  try {
    const data = await getGuestViews();
    return Math.max(0, MAX_GUEST_VIEWS - data.count);
  } catch (error) {
    console.error('Error getting remaining views:', error);
    return MAX_GUEST_VIEWS;
  }
}

/**
 * Reset guest views (called after registration)
 */
export async function resetGuestViews(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GUEST_VIEWS_KEY);
  } catch (error) {
    console.error('Error resetting guest views:', error);
  }
}

/**
 * Get view limit percentage (0-100)
 */
export async function getViewLimitPercentage(): Promise<number> {
  try {
    const data = await getGuestViews();
    return Math.min(100, (data.count / MAX_GUEST_VIEWS) * 100);
  } catch (error) {
    console.error('Error getting view limit percentage:', error);
    return 0;
  }
}

/**
 * Get or generate guest ID for server tracking
 * Priority 3: Server-side guest view tracking
 */
export async function getGuestId(): Promise<string> {
  try {
    let guestId = await AsyncStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      // Generate a simple UUID-like ID
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  } catch (error) {
    console.error('Error getting guest ID:', error);
    return `guest_${Date.now()}`;
  }
}

/**
 * Sync guest views with server
 * Priority 3: Server-side tracking for better view limit enforcement
 */
export async function syncGuestViewsWithServer(): Promise<void> {
  try {
    const guestId = await getGuestId();
    const localData = await getGuestViews();

    if (localData.viewedVacancies.length === 0) {
      return;
    }

    // Sync with server
    const serverData = await api.syncGuestViews(guestId, localData.viewedVacancies);

    // Update local count if server has more views (e.g., from another device)
    if (serverData.count > localData.count) {
      const updatedData: GuestViewsData = {
        ...localData,
        count: serverData.count,
      };
      await AsyncStorage.setItem(GUEST_VIEWS_KEY, JSON.stringify(updatedData));
    }

    console.log(`✅ Synced ${localData.viewedVacancies.length} guest views with server`);
  } catch (error) {
    console.error('Error syncing guest views with server:', error);
    // Don't throw - local tracking should still work if server is down
  }
}

/**
 * Track guest view with optional server sync
 * Priority 3: Server-side tracking
 */
export async function trackGuestViewWithServer(vacancyId: string): Promise<GuestViewsData> {
  try {
    const guestId = await getGuestId();

    // Track locally first
    const localData = await incrementGuestView(vacancyId);

    // Try to track on server (non-blocking)
    try {
      const serverData = await api.trackGuestView(vacancyId, guestId);

      // If server has more views, update local
      if (serverData.count > localData.count) {
        const updatedData: GuestViewsData = {
          ...localData,
          count: serverData.count,
        };
        await AsyncStorage.setItem(GUEST_VIEWS_KEY, JSON.stringify(updatedData));
        return updatedData;
      }
    } catch (error) {
      console.warn('Server tracking failed, using local count:', error);
    }

    return localData;
  } catch (error) {
    console.error('Error tracking guest view:', error);
    throw error;
  }
}
