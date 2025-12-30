// src/screens/auth/LoginScreen.tsx
// Login Screen - Email/password login with social options

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.login(email.trim(), password);
      
      if (response.success) {
        await login(response.data.user, response.data.token);
        // Navigation will happen automatically via RootNavigator
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'Invalid email or password'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎬</Text>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Login to continue renting equipment</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={
              <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword' as never)}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            fullWidth
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Login */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Google')}
          >
            <Text style={styles.socialEmoji}>🔍</Text>
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Apple')}
          >
            <Text style={styles.socialEmoji}>🍎</Text>
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup' as never)}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: SIZES.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SIZES.xxl,
    marginBottom: SIZES.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SIZES.md,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: SIZES.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.lg,
  },
  forgotPasswordText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  eyeIcon: {
    fontSize: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SIZES.md,
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: SIZES.sm,
  },
  socialEmoji: {
    fontSize: 20,
  },
  socialText: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});
