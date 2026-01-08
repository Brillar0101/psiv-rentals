// src/screens/payment/PaymentFailedScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function PaymentFailedScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>❌</Text>
      <Text style={styles.title}>Payment Failed</Text>
      <Text style={styles.subtitle}>Please try again</Text>
      <Button title="Try Again" onPress={() => navigation.goBack()} style={{ marginTop: SIZES.xl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  emoji: { fontSize: 80, marginBottom: SIZES.lg },
  title: { fontSize: SIZES.h2, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
