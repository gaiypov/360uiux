/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Root Navigator
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { PhoneInputScreen, SMSVerificationScreen, RegistrationScreen } from '@/screens/auth';
import { JobSeekerNavigator } from './JobSeekerNavigator';
import { EmployerNavigator } from './EmployerNavigator';
import { useAuthStore } from '@/stores/authStore';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // В реальном приложении здесь проверка AsyncStorage
    // на наличие токена и флага "onboarding completed"
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {!isAuthenticated ? (
          <>
            {showOnboarding && (
              <Stack.Screen name="Onboarding">
                {() => (
                  <OnboardingScreen
                    onGetStarted={() => setShowOnboarding(false)}
                  />
                )}
              </Stack.Screen>
            )}
            <Stack.Screen name="PhoneInput" component={PhoneInputScreen} />
            <Stack.Screen name="SMSVerification" component={SMSVerificationScreen} />
            <Stack.Screen name="Registration" component={RegistrationScreen} />
          </>
        ) : (
          <Stack.Screen
            name="MainApp"
            component={
              user?.role === 'employer' ? EmployerNavigator : JobSeekerNavigator
            }
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
