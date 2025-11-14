/**
 * 360° РАБОТА - ULTRA EDITION
 * Job Seeker Navigation (Tab + Stack)
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { colors, sizes } from '@/constants';
import { VacancyFeedScreen } from '@/screens/jobseeker/VacancyFeedScreen';
import { MainFeedScreen } from '@/screens/MainFeedScreen';
import { SearchScreen } from '@/screens/jobseeker/SearchScreen';
import { ApplicationsScreen } from '@/screens/jobseeker/ApplicationsScreen';
import { ApplicationScreen } from '@/screens/jobseeker/ApplicationScreen';
import { ProfileScreen } from '@/screens/jobseeker/ProfileScreen';
import { FavoritesScreen } from '@/screens/jobseeker/FavoritesScreen';
import { VacancyDetailScreen } from '@/screens/jobseeker/VacancyDetailScreen';
import { CompanyDetailScreen } from '@/screens/jobseeker/CompanyDetailScreen';
import { CreateResumeScreen } from '@/screens/jobseeker/CreateResumeScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { ChatScreen } from '@/screens/ChatScreen';
import { VideoRecordScreen, VideoPreviewScreen, VideoPlayerScreen } from '@/screens/video';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator
function JobSeekerTabs() {
  return (
    <Tab.Navigator
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
      }}
    >
      <Tab.Screen
        name="Home"
        component={MainFeedScreen}
        options={{
          title: 'ДОМОЙ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'ПОИСК',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'magnify' : 'magnify'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'ИЗБРАННОЕ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{
          title: 'ОТКЛИКИ',
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
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'ПРОФИЛЬ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'account' : 'account-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main Stack Navigator with Tabs
export function JobSeekerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={JobSeekerTabs} />
      <Stack.Screen name="Feed" component={VacancyFeedScreen} />
      <Stack.Screen name="VacancyDetail" component={VacancyDetailScreen} />
      <Stack.Screen name="CompanyDetail" component={CompanyDetailScreen} />
      <Stack.Screen name="Application" component={ApplicationScreen} />
      <Stack.Screen name="CreateResume" component={CreateResumeScreen} />
      <Stack.Screen name="VideoRecord" component={VideoRecordScreen} />
      <Stack.Screen name="VideoPreview" component={VideoPreviewScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
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
