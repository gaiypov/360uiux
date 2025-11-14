/**
 * 360° РАБОТА - ULTRA EDITION
 * Admin Navigation - Revolut Style
 * Architecture v4: Added VideoPlayer from SharedNavigator for video moderation
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { colors, sizes } from '@/constants';
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminEmployersScreen,
  AdminVacanciesScreen,
  AdminReportsScreen,
  AdminSettingsScreen,
  AdminTransactionsScreen,
  AdminInvoicesScreen,
  AdminPricingScreen,
} from '@/screens/admin';
import { VideoPlayerScreen } from '@/screens/video';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminTabs() {
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
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'ДАШБОРД',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'view-dashboard' : 'view-dashboard-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          title: 'ПОЛЬЗОВАТЕЛИ',
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
        name="AdminEmployers"
        component={AdminEmployersScreen}
        options={{
          title: 'КОМПАНИИ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'office-building' : 'office-building-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="AdminVacancies"
        component={AdminVacanciesScreen}
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
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          title: 'ЖАЛОБЫ',
          tabBarIcon: ({ focused, color, size }) => (
            <Icon
              name={focused ? 'flag' : 'flag-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarBadge: undefined, // Can be set dynamically for pending complaints
        }}
      />
      <Tab.Screen
        name="AdminSettings"
        component={AdminSettingsScreen}
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

export function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AdminTransactions" component={AdminTransactionsScreen} />
      <Stack.Screen name="AdminInvoices" component={AdminInvoicesScreen} />
      <Stack.Screen name="AdminPricing" component={AdminPricingScreen} />

      {/* VideoPlayer for video moderation */}
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
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
    fontSize: 10,
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
});
