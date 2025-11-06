/**
 * 360° РАБОТА - ULTRA EDITION
 * Guest View Counter
 * Architecture v3: Track guest video views (max 20)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_VIEWS_KEY = '@360rabota:guest_views';
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
