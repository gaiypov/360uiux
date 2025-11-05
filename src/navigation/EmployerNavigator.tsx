/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Employer Navigation
 */

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BlurView } from '@react-native-community/blur';
import { colors, sizes } from '@/constants';
import { CreateVacancyScreen } from '@/screens/employer/CreateVacancyScreen';
import { CandidatesScreen } from '@/screens/employer/CandidatesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screens
function VacanciesListScreen() {
  return <View style={styles.placeholder} />;
}

function AnalyticsScreen() {
  return <View style={styles.placeholder} />;
}

function EmployerProfileScreen() {
  return <View style={styles.placeholder} />;
}

function EmployerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.ultraViolet,
        tabBarInactiveTintColor: colors.liquidSilver,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              style={styles.blurView}
              blurType="dark"
              blurAmount={12}
              reducedTransparencyFallbackColor={colors.graphiteGray}
            />
          ) : (
            <View style={styles.androidBackground} />
          )
        ),
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
        name="Profile"
        component={EmployerProfileScreen}
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

export function EmployerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Tabs" component={EmployerTabs} />
      <Stack.Screen name="CreateVacancy" component={CreateVacancyScreen} />
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
    backgroundColor: colors.graphiteGray,
  },
  placeholder: {
    flex: 1,
    backgroundColor: colors.primaryBlack,
  },
});
