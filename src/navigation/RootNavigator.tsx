/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Root Navigator - Production Ready
 * Architecture v3: TikTok-style navigation with guest mode + role-based routing
 * Optimized for Expo Dev + EAS Build
 */

import React, { useState, useEffect, useCallback, createRef } from 'react';
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
import { GuestNavigator } from './GuestNavigator';
import { useAuthStore } from '@/stores/authStore';

const Stack = createNativeStackNavigator();
const ONBOARDING_KEY = '@360rabota:onboarding_completed';

/**
 * Global navigation ref for programmatic navigation
 * Use createRef (not useRef) for module-level exports
 */
export const navigationRef = createRef<NavigationContainerRef<any>>();

/**
 * Programmatic navigation helpers
 * Use these from outside React components (e.g., services, utils)
 */
export function navigate(name: string, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    console.warn('Navigation attempted before NavigationContainer is ready');
  }
}

export function goBack() {
  if (navigationRef.current?.canGoBack()) {
    navigationRef.current.goBack();
  } else {
    console.warn('Cannot go back: navigation stack is empty');
  }
}

export function resetRoot(name: string, params?: any) {
  if (navigationRef.current) {
    navigationRef.current.reset({
      index: 0,
      routes: [{ name, params }],
    });
  } else {
    console.warn('Reset attempted before NavigationContainer is ready');
  }
}

/**
 * Deep linking configuration
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
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const { isAuthenticated, user, initialize } = useAuthStore();

  /**
   * Initialize app: load auth state and check onboarding status
   * Runs once on mount
   */
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        console.log('🔄 Initializing app state...');

        // Step 1: Initialize auth state from AsyncStorage
        await initialize();
        console.log('✅ Auth state initialized');

        // Step 2: Check if onboarding has been completed
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        console.log('📱 Onboarding status:', completed === 'true' ? 'Completed' : 'Not completed');

        if (mounted) {
          setShowOnboarding(completed !== 'true');
        }
      } catch (error) {
        console.error('❌ Error initializing app:', error);
        if (mounted) {
          // On error, show onboarding to be safe
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
   * Marks onboarding as done in storage and hides the screen
   */
  const handleOnboardingComplete = useCallback(async () => {
    try {
      console.log('✅ Onboarding completed, saving to storage...');
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('❌ Error saving onboarding state:', error);
      // Still proceed even if storage fails
      setShowOnboarding(false);
    }
  }, []);

  /**
   * Handle custom splash screen completion
   * Transitions from splash to onboarding or main app
   */
  const handleSplashComplete = useCallback(() => {
    console.log('✅ Custom splash screen complete');
    setShowSplash(false);
  }, []);

  /**
   * Handle navigation ready event
   * Fired when NavigationContainer is fully initialized
   */
  const handleNavigationReady = useCallback(() => {
    setIsNavigationReady(true);
    console.log('✅ React Navigation is ready');
  }, []);

  /**
   * Role-based navigator selection
   * Returns the appropriate navigator based on user authentication and role
   *
   * Architecture v4: Uses dedicated GuestNavigator to prevent crashes
   *
   * Guest mode (not authenticated): GuestNavigator (limited access, feed only)
   * JobSeeker: JobSeekerNavigator (full access to feed + applications)
   * Employer: EmployerNavigator (post vacancies, view applicants)
   * Moderator: AdminNavigator (content moderation, analytics)
   */
  const getMainNavigator = useCallback(() => {
    if (isAuthenticated && user) {
      console.log('👤 User role:', user.role);
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
    // Guest mode: limited access via GuestNavigator (prevents crash from accessing auth-only features)
    console.log('👤 Guest mode: Limited feed access via GuestNavigator');
    return GuestNavigator;
  }, [isAuthenticated, user]);

  // Show custom splash screen
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
