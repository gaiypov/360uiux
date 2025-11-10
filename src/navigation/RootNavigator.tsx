/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Root Navigator
 * Architecture v3: TikTok-style navigation with guest mode
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import {
  PhoneInputScreen,
  SMSVerificationScreen,
  RegistrationScreen,
  WelcomeBackScreen,
  RegistrationRequiredScreen,
  LoginScreen,
  RoleSelectionScreen,
} from '@/screens/auth';
import { JobSeekerNavigator } from './JobSeekerNavigator';
import { EmployerNavigator } from './EmployerNavigator';
import { useAuthStore } from '@/stores/authStore';

const Stack = createNativeStackNavigator();
const ONBOARDING_KEY = '@360rabota:onboarding_completed';

export function RootNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const { isAuthenticated, user, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize app: load auth state and check onboarding
    const initializeApp = async () => {
      try {
        // Initialize auth state from storage
        await initialize();

        // Check if onboarding has been completed
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setShowOnboarding(completed !== 'true');
      } catch (error) {
        console.error('Error initializing app:', error);
        setShowOnboarding(true);
      }
    };

    initializeApp();
  }, [initialize]);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Wait for onboarding check
  if (showOnboarding === null) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={showOnboarding ? 'Onboarding' : 'Main'}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {/* Onboarding (show once) */}
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              {...props}
              onGetStarted={handleOnboardingComplete}
            />
          )}
        </Stack.Screen>

        {/* Main App (Guest or Authenticated) */}
        <Stack.Screen
          name="Main"
          component={
            isAuthenticated
              ? user?.role === 'employer'
                ? EmployerNavigator
                : JobSeekerNavigator
              : JobSeekerNavigator // Guest mode: access to Feed with 20-video limit
          }
        />

        {/* Auth Screens - Modal Style */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        >
          <Stack.Screen
            name="RegistrationRequired"
            component={RegistrationRequiredScreen}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
          <Stack.Screen
            name="SMSVerification"
            component={SMSVerificationScreen}
          />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="Registration" component={RegistrationScreen} />
          <Stack.Screen
            name="WelcomeBack"
            component={WelcomeBackScreen}
            options={{
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
