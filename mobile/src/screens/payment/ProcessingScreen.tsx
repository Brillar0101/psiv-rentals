// src/screens/payment/ProcessingScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';

export default function ProcessingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.title}>Processing Payment...</Text>
      <Text style={styles.subtitle}>Please wait</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  title: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginTop: SIZES.lg, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
