// App.tsx
// Main entry point for PSIV Rentals Mobile App
// Features animated intro splash screen

import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_600SemiBold,
  Rubik_700Bold,
} from '@expo-google-fonts/rubik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';
import { ToastProvider } from './src/components/ui/Toast';
import { AlertProvider } from './src/components/ui/AlertModal';
import AnimatedSplash from './src/components/AnimatedSplash';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Key to track if user has seen the intro
const INTRO_SEEN_KEY = 'psiv_intro_seen';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  // Load Rubik fonts
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_600SemiBold,
    Rubik_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Check if user has seen the intro before
        const hasSeenIntro = await AsyncStorage.getItem(INTRO_SEEN_KEY);
        setShowIntro(hasSeenIntro !== 'true');
      } catch (e) {
        console.warn('Error loading app resources:', e);
        setShowIntro(false);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleIntroComplete = async () => {
    try {
      // Mark intro as seen
      await AsyncStorage.setItem(INTRO_SEEN_KEY, 'true');
    } catch (e) {
      console.warn('Error saving intro state:', e);
    }
    setShowIntro(false);
  };

  // Don't render until fonts are loaded and we know if we should show intro
  if (!appIsReady || !fontsLoaded || showIntro === null) {
    return null;
  }

  // Show animated intro on first launch
  if (showIntro) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <AnimatedSplash onAnimationComplete={handleIntroComplete} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AlertProvider>
            <View style={styles.container}>
              <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
              <RootNavigator />
            </View>
          </AlertProvider>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
