// App.tsx
// Main entry point for PSIV Rentals Mobile App

import React from 'react';
import { StatusBar } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <RootNavigator />
    </QueryClientProvider>
  );
}
