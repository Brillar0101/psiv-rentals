// mobile/src/screens/auth/LoginScreen.tsx
// FINAL FIX - handles nested response properly

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { authAPI } from '../../services/api';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting login...');
      const response = await authAPI.login(email, password);
      console.log('Login response:', response);

      // Response structure: { success, data: { token, user }, message }
      if (response.success && response.data) {
        const { token, user } = response.data;
        
        console.log('Token:', token);
        console.log('User:', user);

        // Save token and user data
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        console.log('Auth data saved successfully!');
        
        // Give AsyncStorage a moment to save
        setTimeout(() => {
          console.log('Navigating to Main...');
          // The RootNavigator will detect auth change and switch screens
        }, 100);

      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Error',
        error.response?.data?.error || error.message || 'Failed to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>🎬</Text>
            <Text style={styles.title}>PSIV Rentals</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textLight}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <Button
              title={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={loading}
              fullWidth
            />

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => navigation.navigate('Signup' as never)}
            >
              <Text style={styles.signupText}>
                Don't have an account?{' '}
                <Text style={styles.signupTextBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: SIZES.paddingHorizontal },
  header: { alignItems: 'center', marginBottom: SIZES.xxl },
  logo: { fontSize: 80, marginBottom: SIZES.md },
  title: { fontSize: SIZES.h1, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
  form: { marginTop: SIZES.xl },
  inputGroup: { marginBottom: SIZES.lg },
  label: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.sm },
  input: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, fontSize: SIZES.body, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  signupLink: { marginTop: SIZES.xl, alignItems: 'center' },
  signupText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  signupTextBold: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },
});
