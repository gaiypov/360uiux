/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Main App Component
 */

import React, { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Toast } from './src/components/ui';
import { useToastStore } from './src/stores';

// Ignore specific warnings (optional)
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

function App(): React.JSX.Element {
  const { visible, type, message, hideToast } = useToastStore();

  useEffect(() => {
    // Initialize app - можно добавить логику инициализации
    console.log('360° РАБОТА - Revolut Ultra Edition');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <Toast
        visible={visible}
        type={type}
        message={message}
        onHide={hideToast}
      />
    </GestureHandlerRootView>
  );
}

export default App;
