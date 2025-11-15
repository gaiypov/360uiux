/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Main App Entry Point - Production Ready
 * Optimized for Expo Dev + EAS Build
 */

import React, { useEffect, useState, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { LogBox, Platform, View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Toast } from './src/components/ui';
import { useToastStore } from './src/stores';

// Keep native splash screen visible until app is ready
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Splash screen already hidden or not available */
});

// Ignore specific non-critical warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Animated: `useNativeDriver`',
  'Sending',
]);

/**
 * Error Boundary - Production Safety
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <StatusBar style="light" />
          <Text style={errorStyles.title}>Что-то пошло не так</Text>
          <Text style={errorStyles.message}>
            Приложение столкнулось с ошибкой. Пожалуйста, перезапустите.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={errorStyles.error}>{this.state.error.toString()}</Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App Content Component
 * Handles resource loading and initialization
 */
function AppContent(): React.JSX.Element {
  const { visible, type, message, hideToast } = useToastStore();
  const [appIsReady, setAppIsReady] = useState(false);

  /**
   * Prepare app resources on mount
   * - Load fonts, images, or any async resources
   * - Initialize services
   * - Mark app as ready when complete
   */
  useEffect(() => {
    async function prepare() {
      try {
        console.log('🚀 360° РАБОТА - Revolut Ultra Edition');
        console.log('📱 Initializing Expo Dev Client...');

        // Pre-load fonts (if needed)
        // await Font.loadAsync({ CustomFont: require('./assets/fonts/CustomFont.ttf') });

        // Minimal delay for smooth splash transition
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('✅ App initialization complete');
      } catch (e) {
        console.error('❌ Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  /**
   * Hide native splash screen once app is ready and layout is complete
   */
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
        console.log('✅ Native splash screen hidden');
      } catch (e) {
        console.warn('⚠️ Failed to hide splash screen:', e);
      }
    }
  }, [appIsReady]);

  // Don't render anything until app resources are ready
  if (!appIsReady) {
    return null;
  }

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      {/* Dark status bar with light content */}
      <StatusBar style="light" backgroundColor="transparent" translucent />

      {/* Main Navigation Tree */}
      <RootNavigator />

      {/* Global Toast Notifications */}
      <Toast
        visible={visible}
        type={type}
        message={message}
        onHide={hideToast}
      />
    </View>
  );
}

/**
 * App Root with Provider Stack
 * Order matters: ErrorBoundary → GestureHandler → SafeArea → Content
 */
export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#A8A8B5',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  error: {
    fontSize: 12,
    color: '#FF4757',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
});
