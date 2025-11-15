/**
 * 360° РАБОТА - ULTRA EDITION
 * Employer Navigation
 * ✅ P0-5 FIX: Type-safe navigation with TypeScript
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { colors, sizes } from '@/constants';
import { CreateVacancyScreen } from '@/screens/employer/CreateVacancyScreen';
import { CreateVacancyScreenV2 } from '@/screens/employer/CreateVacancyScreenV2';
import { CandidatesScreen } from '@/screens/employer/CandidatesScreen';
import { AnalyticsScreen } from '@/screens/employer/AnalyticsScreen';
import { MassMailingScreen } from '@/screens/employer/MassMailingScreen';
import { AutomationScreen } from '@/screens/employer/AutomationScreen';
import { ABTestingScreen } from '@/screens/employer/ABTestingScreen';
import { DetailedAnalyticsScreen } from '@/screens/DetailedAnalyticsScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { ChatScreen } from '@/screens/ChatScreen';
import { WalletScreen, TopUpModal } from '@/screens/wallet';
import { VideoRecordScreen, VideoPlayerScreen } from '@/screens/video';
import { EmployerTabParamList, EmployerStackParamList } from './types';

const Tab = createBottomTabNavigator<EmployerTabParamList>();
const Stack = createNativeStackNavigator<EmployerStackParamList>();

// Placeholder screens
function VacanciesListScreen() {
  return <View style={styles.placeholder} />;
}

function EmployerProfileScreen() {
  return <View style={styles.placeholder} />;
}

function EmployerTabs() {
  return (
    <Tab.Navigator
      // ✅ P1-II-3 FIX: Lazy load tabs for better initial performance
      lazy={true}
      // ✅ P1-II-3 FIX: Detach inactive screens to free memory
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.platinumSilver,
        tabBarInactiveTintColor: colors.chromeSilver,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              style={styles.blurView}
              blurType="dark"
              blurAmount={12}
              reducedTransparencyFallbackColor={colors.graphiteBlack}
            />
          ) : (
            <View style={styles.androidBackground} />
          )
        ),
        // ✅ P1-II-3 FIX: Freeze inactive tabs to prevent unnecessary updates
        freezeOnBlur: true,
      }}
    >
      <Tab.Screen
        name="Vacancies"
        component={VacanciesListScreen}
        options={{
          title: 'ВАКАНСИИ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'briefcase' : 'briefcase-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Candidates"
        component={CandidatesScreen}
        options={{
          title: 'КАНДИДАТЫ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'account-group' : 'account-group-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'АНАЛИТИКА',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'chart-line' : 'chart-line'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'УВЕДОМЛЕНИЯ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'bell' : 'bell-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'НАСТРОЙКИ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'cog' : 'cog-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function EmployerNavigator() {
  return (
    <Stack.Navigator
      // ✅ P1-II-3 FIX: Detach inactive screens to save memory
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        // ✅ P1-II-3 FIX: Freeze screens when not focused (-20% re-renders)
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen name="Tabs" component={EmployerTabs} />
      <Stack.Screen name="CreateVacancy" component={CreateVacancyScreen} />
      <Stack.Screen name="CreateVacancyV2" component={CreateVacancyScreenV2} />
      <Stack.Screen name="VideoRecord" component={VideoRecordScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <Stack.Screen name="MassMailing" component={MassMailingScreen} />
      <Stack.Screen name="Automation" component={AutomationScreen} />
      <Stack.Screen name="ABTesting" component={ABTestingScreen} />
      <Stack.Screen name="DetailedAnalytics" component={DetailedAnalyticsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen
        name="TopUpModal"
        component={TopUpModal}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.graphiteBlack,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
});
