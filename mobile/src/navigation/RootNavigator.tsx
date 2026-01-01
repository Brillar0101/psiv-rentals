// mobile/src/navigation/RootNavigator.tsx
// Fixed version with auth state listener

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, AppState } from 'react-native';
import { COLORS } from '../constants/theme';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    // Listen for app state changes (when app comes to foreground)
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAuth();
      }
    });

    // Check auth every 2 seconds (lightweight check)
    const interval = setInterval(() => {
      checkAuthSilent();
    }, 2000);

    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');
      
      console.log('Auth check:', { hasToken: !!token, hasUser: !!userJson });
      
      // Both token AND user data must exist
      if (token && userJson) {
        const user = JSON.parse(userJson);
        if (user && user.email) {
          console.log('User authenticated:', user.email);
          setIsAuthenticated(true);
        } else {
          console.log('User data corrupted, clearing...');
          await AsyncStorage.multiRemove(['token', 'user']);
          setIsAuthenticated(false);
        }
      } else {
        console.log('No auth data found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await AsyncStorage.multiRemove(['token', 'user']);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Silent check (doesn't show loading)
  const checkAuthSilent = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userJson = await AsyncStorage.getItem('user');
      
      if (token && userJson) {
        const user = JSON.parse(userJson);
        if (user && user.email && !isAuthenticated) {
          console.log('Auth detected, switching to Main...');
          setIsAuthenticated(true);
        }
      } else if (isAuthenticated) {
        console.log('Auth removed, switching to Login...');
        setIsAuthenticated(false);
      }
    } catch (error) {
      // Silent failure
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
