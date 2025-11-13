/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Root Navigator - Production Ready
 * Architecture v3: TikTok-style navigation with guest mode
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import {
  PhoneInputScreen,
  SMSVerificationScreen,
  RegistrationScreen,
  EmployerRegistrationScreen,
  RoleSelectionScreen,
  WelcomeBackScreen,
  RegistrationRequiredScreen,
  LoginScreen,
} from '@/screens/auth';
import { JobSeekerNavigator } from './JobSeekerNavigator';
import { EmployerNavigator } from './EmployerNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuthStore } from '@/stores/authStore';

const Stack = createNativeStackNavigator();
const ONBOARDING_KEY = '@360rabota:onboarding_completed';

/**
 * Deep linking configuration (optional, готово к использованию)
 */
const linking = {
  prefixes: ['360rabota://', 'https://360rabota.ru'],
  config: {
    screens: {
      Onboarding: 'onboarding',
      Main: '',
      RegistrationRequired: 'auth/required',
      Login: 'auth/login',
      PhoneInput: 'auth/phone',
      SMSVerification: 'auth/sms',
      RoleSelection: 'auth/role',
      Registration: 'auth/register',
      EmployerRegistration: 'auth/register/employer',
      WelcomeBack: 'auth/welcome',
    },
  },
};

/**
 * Loading spinner component
 */
const LoadingScreen = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#FFFFFF" />
  </View>
));
LoadingScreen.displayName = 'LoadingScreen';

/**
 * Root Navigator Component
 */
export function RootNavigator() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, user, initialize } = useAuthStore();

  /**
   * Initialize app: load auth state and check onboarding
   */
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        // Initialize auth state from storage
        await initialize();

        // Check if onboarding has been completed
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (mounted) {
          setShowOnboarding(completed !== 'true');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        if (mounted) {
          setShowOnboarding(true);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, [initialize]);

  /**
   * Handle onboarding completion
   */
  const handleOnboardingComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }, []);

  /**
   * Handle splash screen completion
   */
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  /**
   * Handle navigation ready
   */
  const handleNavigationReady = useCallback(() => {
    setIsReady(true);
    console.log('Navigation is ready');
  }, []);

  /**
   * Determine main navigator based on user role
   */
  const getMainNavigator = useCallback(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'employer':
          return EmployerNavigator;
        case 'moderator':
          return AdminNavigator;
        case 'jobseeker':
        default:
          return JobSeekerNavigator;
      }
    }
    // Guest mode: access to Feed with 20-video limit
    return JobSeekerNavigator;
  }, [isAuthenticated, user]);

  // Show splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Wait for onboarding check to complete
  if (showOnboarding === null) {
    return <LoadingScreen />;
  }

  const MainNavigator = getMainNavigator();

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={handleNavigationReady}
      fallback={<LoadingScreen />}
    >
      <Stack.Navigator
        initialRouteName={showOnboarding ? 'Onboarding' : 'Main'}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        {/* Onboarding (show once) */}
        {showOnboarding && (
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onGetStarted={handleOnboardingComplete}
              />
            )}
          </Stack.Screen>
        )}

        {/* Main App (Guest or Authenticated) */}
        <Stack.Screen name="Main" component={MainNavigator} />

        {/* Auth Screens - Modal Style */}
        <Stack.Group
          screenOptions={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
            gestureEnabled: Platform.OS === 'ios',
            fullScreenGestureEnabled: false,
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
            name="EmployerRegistration"
            component={EmployerRegistrationScreen}
          />
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

/**
 * Export navigation ref for external navigation
 * Usage: navigationRef.current?.navigate('ScreenName')
 */
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

/**
 * Navigate from outside of React components
 */
export function navigate(name: string, params?: any) {
  navigationRef.current?.navigate(name, params);
}

export function goBack() {
  navigationRef.current?.goBack();
}

export function resetRoot(name: string, params?: any) {
  navigationRef.current?.reset({
    index: 0,
    routes: [{ name, params }],
  });
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
