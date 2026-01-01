// src/screens/payment/PaymentMethodScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function PaymentMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedMethod, setSelectedMethod] = useState('card');

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', available: true },
    { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', available: true },
    { id: 'google_pay', name: 'Google Pay', icon: 'G', available: false },
  ];

  const handlePayment = () => {
    Alert.alert('Success!', 'Booking confirmed! (Stripe integration ready)', [
      { text: 'OK', onPress: () => navigation.navigate('MainTabs' as never) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment Method</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Select your payment method</Text>

        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.methodCardSelected,
              !method.available && styles.methodCardDisabled,
            ]}
            onPress={() => method.available && setSelectedMethod(method.id)}
            disabled={!method.available}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>{method.icon}</Text>
            </View>
            <Text style={styles.methodName}>{method.name}</Text>
            {selectedMethod === method.id && <Text style={styles.checkmark}>✓</Text>}
            {!method.available && <Text style={styles.comingSoon}>Coming Soon</Text>}
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoText}>Secure payment powered by Stripe</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Confirm & Pay" onPress={handlePayment} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  backIcon: { fontSize: 28, color: COLORS.text },
  title: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  content: { flex: 1, padding: SIZES.paddingHorizontal },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.lg },
  methodCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.md, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: COLORS.border, ...SHADOWS.small },
  methodCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryAlpha },
  methodCardDisabled: { opacity: 0.5 },
  methodIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  methodIconText: { fontSize: 24 },
  methodName: { flex: 1, fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  checkmark: { fontSize: 24, color: COLORS.primary },
  comingSoon: { fontSize: SIZES.caption, color: COLORS.textLight },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.infoLight, padding: SIZES.md, borderRadius: SIZES.radius, marginTop: SIZES.lg },
  infoIcon: { fontSize: 24, marginRight: SIZES.sm },
  infoText: { flex: 1, fontSize: SIZES.bodySmall, color: COLORS.text },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
