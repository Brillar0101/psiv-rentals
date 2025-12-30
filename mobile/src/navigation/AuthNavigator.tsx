// src/navigation/AuthNavigator.tsx
// Auth Navigator - Handles all authentication screens

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SocialLoginScreen from '../screens/auth/SocialLoginScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import TermsScreen from '../screens/auth/TermsScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SocialLogin" component={SocialLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  );
}
