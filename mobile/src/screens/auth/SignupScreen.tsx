// src/screens/auth/SignupScreen.tsx
// Signup Screen - User registration

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

export default function SignupScreen() {
  const navigation = useNavigation();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    let valid = true;
    const newErrors: any = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
      valid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.signup({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
      });

      if (response.success) {
        Alert.alert(
          'Success!',
          'Account created successfully. Please login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.response?.data?.error || 'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start renting equipment</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="First Name"
                placeholder="John"
                value={formData.first_name}
                onChangeText={(text) => updateField('first_name', text)}
                error={errors.first_name}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChangeText={(text) => updateField('last_name', text)}
                error={errors.last_name}
              />
            </View>
          </View>

          <Input
            label="Email"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone (Optional)"
            placeholder="+1 234 567 8900"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            keyboardType="phone-pad"
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={<Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            error={errors.confirmPassword}
            secureTextEntry={!showPassword}
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            fullWidth
            style={styles.signupButton}
          />
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.footerLink}>Login</Text>
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
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl,
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
  row: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  halfInput: {
    flex: 1,
  },
  eyeIcon: {
    fontSize: 20,
  },
  signupButton: {
    marginTop: SIZES.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.md,
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
