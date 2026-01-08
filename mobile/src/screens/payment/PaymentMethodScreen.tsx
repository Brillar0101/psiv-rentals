// src/screens/payment/PaymentMethodScreen-Modern.tsx
// Modern Payment Method Selection with Segment UI design pattern

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon, IconName } from '../../components/ui/Icon';

export default function PaymentMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedMethod, setSelectedMethod] = useState('card');

  const paymentMethods: { id: string; name: string; description: string; iconName: IconName; available: boolean }[] = [
    {
      id: 'card',
      name: 'Credit / Debit Card',
      description: 'Visa, Mastercard, Amex',
      iconName: 'credit-card',
      available: true,
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      description: 'Fast & secure payment',
      iconName: 'smartphone',
      available: true,
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      description: 'Pay with Google',
      iconName: 'smartphone',
      available: false,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay via PayPal account',
      iconName: 'dollar-sign',
      available: false,
    },
  ];

  const handleContinue = () => {
    if (selectedMethod === 'card') {
      navigation.navigate('CardDetails' as never, { bookingData: route.params } as never);
    } else if (selectedMethod === 'apple_pay') {
      navigation.navigate('StripePayment' as never, { bookingData: route.params } as never);
    } else {
      // Coming soon
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Icon name="credit-card" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.illustrationText}>Choose your payment method</Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.methodsSection}>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardSelected,
                !method.available && styles.methodCardDisabled,
              ]}
              onPress={() => method.available && setSelectedMethod(method.id)}
              disabled={!method.available}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View style={[
                  styles.methodIcon,
                  selectedMethod === method.id && styles.methodIconSelected
                ]}>
                  <Icon name={method.iconName} size={24} color={selectedMethod === method.id ? COLORS.white : COLORS.primary} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </View>

              <View style={styles.methodRight}>
                {!method.available && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Soon</Text>
                  </View>
                )}
                {method.available && (
                  <View style={[
                    styles.radioOuter,
                    selectedMethod === method.id && styles.radioOuterSelected
                  ]}>
                    {selectedMethod === method.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Icon name="lock" size={32} color={COLORS.success} style={{ marginRight: SIZES.md }} />
          <View style={styles.securityText}>
            <Text style={styles.securityTitle}>Secure Payment</Text>
            <Text style={styles.securitySubtitle}>
              Your payment information is encrypted and secure
            </Text>
          </View>
        </View>

        {/* Accepted Cards */}
        <View style={styles.acceptedCards}>
          <Text style={styles.acceptedTitle}>We Accept</Text>
          <View style={styles.cardLogos}>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>VISA</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>MC</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>AMEX</Text>
            </View>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>DISC</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Continue to Payment"
          onPress={handleContinue}
          disabled={!selectedMethod}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  headerTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  illustrationContainer: { alignItems: 'center', paddingVertical: SIZES.xl },
  illustration: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primaryAlpha, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  illustrationText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  methodsSection: { paddingHorizontal: SIZES.paddingHorizontal },
  methodCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderColor: 'transparent', ...SHADOWS.card },
  methodCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryAlpha },
  methodCardDisabled: { opacity: 0.5 },
  methodLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  methodIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  methodIconSelected: { backgroundColor: COLORS.primary },
  methodInfo: { flex: 1 },
  methodName: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  methodDescription: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  methodRight: {},
  radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  radioOuterSelected: { borderColor: COLORS.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  comingSoonBadge: { backgroundColor: COLORS.infoLight, paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusPill },
  comingSoonText: { fontSize: SIZES.caption, color: COLORS.textSecondary, fontFamily: FONTS.semiBold },
  securityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SIZES.lg, marginHorizontal: SIZES.paddingHorizontal, borderRadius: SIZES.radiusLarge, marginTop: SIZES.md, ...SHADOWS.small },
  securityText: { flex: 1 },
  securityTitle: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  securitySubtitle: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  acceptedCards: { paddingHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.lg },
  acceptedTitle: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary, marginBottom: SIZES.sm, textAlign: 'center' },
  cardLogos: { flexDirection: 'row', justifyContent: 'center', gap: SIZES.sm },
  cardLogo: { width: 56, height: 36, borderRadius: SIZES.radius, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  cardLogoText: { fontSize: SIZES.caption, fontFamily: FONTS.bold, color: COLORS.text },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
