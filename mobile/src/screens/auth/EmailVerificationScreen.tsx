// src/screens/auth/EmailVerificationScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function EmailVerificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📧</Text>
      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>We've sent a verification link to your email</Text>
      <Button title="Open Email App" onPress={() => {}} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, padding: SIZES.paddingHorizontal, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 80, marginBottom: SIZES.lg },
  title: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.xl },
});
