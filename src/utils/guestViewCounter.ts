/**
 * 360° РАБОТА - ULTRA EDITION
 * Guest View Counter
 * Architecture v4: Production-ready with proper error handling
 *
 * Guest Mode Strategy:
 * - Users can view up to 20 unique vacancies without registration
 * - After 20 views, registration is required
 * - View data is synced to backend after registration
 * - View counter is reset after successful registration
 *
 * Features:
 * - Tracks unique vacancy views (no double-counting)
 * - Stores timestamps for analytics
 * - Proper AsyncStorage error handling
 * - Type-safe Promise returns
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const GUEST_VIEWS_KEY = '@360rabota:guest_views';
const MAX_GUEST_VIEWS = 20;

/**
 * Guest views data structure
 */
export interface GuestViewsData {
  count: number;
  viewedVacancies: string[];
  firstViewAt: string;
  lastViewAt: string;
}

/**
 * Get current guest views data from AsyncStorage
 * Returns empty data if not found or error occurs
 *
 * @returns Promise<GuestViewsData> - Current guest views data
 */
export async function getGuestViews(): Promise<GuestViewsData> {
  try {
    const data = await AsyncStorage.getItem(GUEST_VIEWS_KEY);

    if (!data) {
      console.log('ℹ️ No guest views found, returning empty data');
      return {
        count: 0,
        viewedVacancies: [],
        firstViewAt: new Date().toISOString(),
        lastViewAt: new Date().toISOString(),
      };
    }

    const parsed: GuestViewsData = JSON.parse(data);
    console.log(`📊 Guest views loaded: ${parsed.count} vacancies viewed`);
    return parsed;
  } catch (error) {
    console.error('❌ Error getting guest views:', error);

    // Return safe default on error
    return {
      count: 0,
      viewedVacancies: [],
      firstViewAt: new Date().toISOString(),
      lastViewAt: new Date().toISOString(),
    };
  }
}

/**
 * Increment guest view count for a vacancy
 * Only increments if vacancy hasn't been viewed before (unique views)
 *
 * @param vacancyId - Unique identifier of the vacancy
 * @returns Promise<GuestViewsData> - Updated views data
 * @throws Error if AsyncStorage operation fails
 */
export async function incrementGuestView(vacancyId: string): Promise<GuestViewsData> {
  try {
    const currentData = await getGuestViews();

    // Skip if already viewed this vacancy (prevent double-counting)
    if (currentData.viewedVacancies.includes(vacancyId)) {
      console.log(`ℹ️ Vacancy ${vacancyId} already viewed, skipping increment`);
      return currentData;
    }

    const updatedData: GuestViewsData = {
      count: currentData.count + 1,
      viewedVacancies: [...currentData.viewedVacancies, vacancyId],
      firstViewAt: currentData.firstViewAt || new Date().toISOString(),
      lastViewAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(GUEST_VIEWS_KEY, JSON.stringify(updatedData));
    console.log(`✅ Guest view incremented: ${updatedData.count}/${MAX_GUEST_VIEWS}`);

    return updatedData;
  } catch (error) {
    console.error('❌ Error incrementing guest view:', error);
    throw error; // Re-throw for caller to handle
  }
}

/**
 * Check if guest has reached the 20-video view limit
 *
 * @returns Promise<boolean> - True if limit reached, false otherwise
 */
export async function hasReachedViewLimit(): Promise<boolean> {
  try {
    const data = await getGuestViews();
    const limitReached = data.count >= MAX_GUEST_VIEWS;

    if (limitReached) {
      console.log('⚠️ Guest view limit reached:', data.count);
    }

    return limitReached;
  } catch (error) {
    console.error('❌ Error checking view limit:', error);
    // Return false on error (fail-open to not block users)
    return false;
  }
}

/**
 * Get remaining views count before registration required
 *
 * @returns Promise<number> - Number of remaining views (0-20)
 */
export async function getRemainingViews(): Promise<number> {
  try {
    const data = await getGuestViews();
    const remaining = Math.max(0, MAX_GUEST_VIEWS - data.count);

    console.log(`📊 Remaining guest views: ${remaining}/${MAX_GUEST_VIEWS}`);
    return remaining;
  } catch (error) {
    console.error('❌ Error getting remaining views:', error);
    // Return full limit on error (fail-safe)
    return MAX_GUEST_VIEWS;
  }
}

/**
 * Reset guest views counter
 * Called after successful registration to clean up guest data
 *
 * @returns Promise<void>
 */
export async function resetGuestViews(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GUEST_VIEWS_KEY);
    console.log('✅ Guest views reset');
  } catch (error) {
    console.error('❌ Error resetting guest views:', error);
    // Don't throw - not critical
  }
}

/**
 * Get view limit as percentage (0-100)
 * Useful for UI progress bars
 *
 * @returns Promise<number> - Percentage (0-100)
 */
export async function getViewLimitPercentage(): Promise<number> {
  try {
    const data = await getGuestViews();
    const percentage = Math.min(100, (data.count / MAX_GUEST_VIEWS) * 100);

    return Math.round(percentage);
  } catch (error) {
    console.error('❌ Error getting view limit percentage:', error);
    return 0;
  }
}

/**
 * Get the maximum guest views limit
 * Useful for displaying to users
 *
 * @returns number - Max views (20)
 */
export function getMaxGuestViews(): number {
  return MAX_GUEST_VIEWS;
}
