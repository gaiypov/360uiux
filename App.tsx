/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Main App Component - Production Ready
 */

import React, { useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { LogBox, Platform, StatusBar, View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Toast } from './src/components/ui';
import { useToastStore } from './src/stores';

// Ignore specific non-critical warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Animated: `useNativeDriver`',
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
 * Main App Component
 */
function AppContent(): React.JSX.Element {
  const { visible, type, message, hideToast } = useToastStore();

  useEffect(() => {
    // Initialize app
    console.log('360° РАБОТА - Revolut Ultra Edition - Starting...');

    // Configure Status Bar
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
    StatusBar.setBarStyle('light-content');

    return () => {
      console.log('360° РАБОТА - Cleaning up...');
    };
  }, []);

  return (
    <>
      {/* Status Bar Configuration */}
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={Platform.OS === 'android'}
      />

      {/* Main Navigation */}
      <RootNavigator />

      {/* Global Toast Notifications */}
      <Toast
        visible={visible}
        type={type}
        message={message}
        onHide={hideToast}
      />
    </>
  );
}

/**
 * App Root with all providers
 */
function App(): React.JSX.Element {
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

export default App;
