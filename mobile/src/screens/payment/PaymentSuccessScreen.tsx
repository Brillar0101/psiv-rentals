// src/screens/payment/PaymentSuccessScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✅</Text>
      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.subtitle}>Your booking is confirmed</Text>
      <Button title="View Booking" onPress={() => navigation.navigate('MainTabs' as never)} style={{ marginTop: SIZES.xl }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  emoji: { fontSize: 80, marginBottom: SIZES.lg },
  title: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
