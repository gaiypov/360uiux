/**
 * 360° РАБОТА - ULTRA EDITION
 * Shared Navigator
 *
 * Contains screens shared across JobSeeker, Employer, and Admin navigators
 * to eliminate code duplication and ensure consistency.
 *
 * Shared Screens:
 * - VideoRecord, VideoPreview, VideoPlayer (video recording/playback)
 * - Chat (messaging)
 * - Notifications (push notifications list)
 * - Settings (app settings)
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VideoRecordScreen, VideoPreviewScreen, VideoPlayerScreen } from '@/screens/video';
import { ChatScreen } from '@/screens/ChatScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

/**
 * Shared Navigator - use this in JobSeekerNavigator, EmployerNavigator, AdminNavigator
 * instead of duplicating screen definitions
 */
export function SharedNavigator() {
  return (
    <>
      {/* Video Screens */}
      <Stack.Screen
        name="VideoRecord"
        component={VideoRecordScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="VideoPreview"
        component={VideoPreviewScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Chat Screen */}
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Notifications Screen */}
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />

      {/* Settings Screen */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </>
  );
}

/**
 * Usage Example:
 *
 * export function JobSeekerNavigator() {
 *   return (
 *     <Stack.Navigator>
 *       <Stack.Screen name="Tabs" component={JobSeekerTabs} />
 *
 *       // JobSeeker-specific screens
 *       <Stack.Screen name="Feed" component={VacancyFeedScreen} />
 *       <Stack.Screen name="VacancyDetail" component={VacancyDetailScreen} />
 *
 *       // Shared screens (no duplication!)
 *       {SharedNavigator()}
 *     </Stack.Navigator>
 *   );
 * }
 */
