/**
 * 360° РАБОТА - Revolut Ultra Edition
 * Main App Component
 */

import React, { useEffect } from 'react';
import { LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { Toast } from './src/components/ui';
import { useToastStore } from './src/stores';

// Создаем QueryClient для TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 минут - данные считаются свежими
      gcTime: 1000 * 60 * 30,   // 30 минут - сборка мусора
      retry: 2,                  // 2 попытки при ошибке
      refetchOnWindowFocus: false, // Не обновлять при фокусе
      refetchOnReconnect: true,    // Обновить при восстановлении сети
    },
    mutations: {
      retry: 1, // 1 попытка для мутаций
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootNavigator />
        <Toast
          visible={visible}
          type={type}
          message={message}
          onHide={hideToast}
        />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

export default App;
