/**
 * 360° РАБОТА - ULTRA EDITION
 * Guest Navigator
 *
 * Limited navigation for non-authenticated users (guests)
 * Architecture v4: Prevents crashes by restricting access to auth-only features
 *
 * Guest Access:
 * ✅ Feed - Browse vacancies (20-video limit enforced)
 * ✅ VacancyDetail - View vacancy details (read-only)
 * ✅ CompanyDetail - View company profiles (read-only)
 *
 * Blocked Features (redirect to RegistrationRequired):
 * ❌ Apply to vacancies
 * ❌ Like/Favorite
 * ❌ Chat with employers
 * ❌ Profile/Settings
 * ❌ Video recording
 * ❌ Notifications
 *
 * CRITICAL: Do NOT use full JobSeekerNavigator for guests (crash risk!)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VacancyFeedScreen } from '@/screens/jobseeker/VacancyFeedScreen';
import { VacancyDetailScreen } from '@/screens/jobseeker/VacancyDetailScreen';
import { CompanyDetailScreen } from '@/screens/jobseeker/CompanyDetailScreen';

const Stack = createNativeStackNavigator();

export function GuestNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Primary Screen - TikTok-style Feed */}
      <Stack.Screen
        name="Feed"
        component={VacancyFeedScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Read-Only Detail Screens */}
      <Stack.Screen
        name="VacancyDetail"
        component={VacancyDetailScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      <Stack.Screen
        name="CompanyDetail"
        component={CompanyDetailScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Usage in RootNavigator:
 *
 * export function RootNavigator() {
 *   const { user, isAuthenticated } = useAuthStore();
 *
 *   return (
 *     <Stack.Navigator>
 *       {!isAuthenticated ? (
 *         // Guest Mode - Limited access
 *         <Stack.Screen name="Guest" component={GuestNavigator} />
 *       ) : user?.role === 'jobseeker' ? (
 *         // Authenticated JobSeeker - Full access
 *         <Stack.Screen name="JobSeeker" component={JobSeekerNavigator} />
 *       ) : (
 *         // Authenticated Employer - Full access
 *         <Stack.Screen name="Employer" component={EmployerNavigator} />
 *       )}
 *     </Stack.Navigator>
 *   );
 * }
 *
 * Note: VacancyFeedScreen handles 20-video limit internally and
 * navigates to RegistrationRequired when limit is reached.
 */
