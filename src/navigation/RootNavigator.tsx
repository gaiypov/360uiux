/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Root Navigator
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { RoleSelectionScreen } from '@/screens/auth/RoleSelectionScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { JobSeekerNavigator } from './JobSeekerNavigator';
import { useAuthStore } from '@/stores/authStore';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { isAuthenticated } = useAuthStore();

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
            <Stack.Screen name="RoleSelection">
              {() => (
                <RoleSelectionScreen
                  onSelectRole={(role) => {
                    console.log('Selected role:', role);
                    // Navigate to appropriate flow
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLogin={() => {
                    // In real app, call useAuthStore().login()
                    useAuthStore.getState().login('test@example.com', 'password');
                  }}
                  onSignUp={() => console.log('Sign up')}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen
            name="MainApp"
            component={JobSeekerNavigator}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
