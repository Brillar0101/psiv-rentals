// src/screens/payment/CardDetailsScreen.tsx
// Modern Card Details Input with Segment UI design

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon, IconName } from '../../components/ui/Icon';

export default function CardDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\//g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4));
    } else {
      setExpiryDate(cleaned);
    }
  };

  const handlePayment = () => {
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      Alert.alert('Missing Information', 'Please fill in all card details');
      return;
    }

    // Navigate to Stripe payment for actual processing
    navigation.navigate('StripePayment' as never, { bookingData: route.params } as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <View style={styles.cardChip}>
            <Icon name="credit-card" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.cardNumberPreview}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.cardLabel}>CARD HOLDER</Text>
              <Text style={styles.cardValue}>
                {cardHolder || 'YOUR NAME'}
              </Text>
            </View>
            <View>
              <Text style={styles.cardLabel}>EXPIRES</Text>
              <Text style={styles.cardValue}>
                {expiryDate || 'MM/YY'}
              </Text>
            </View>
          </View>
          <View style={styles.cardPattern} />
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Card Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={COLORS.textLight}
                value={cardNumber}
                onChangeText={formatCardNumber}
                keyboardType="numeric"
                maxLength={19}
              />
              <Icon name="credit-card" size={20} color={COLORS.textSecondary} style={{ marginLeft: SIZES.sm }} />
            </View>
          </View>

          {/* Card Holder */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Card Holder Name</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={COLORS.textLight}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
              <Icon name="user" size={20} color={COLORS.textSecondary} style={{ marginLeft: SIZES.sm }} />
            </View>
          </View>

          {/* Expiry & CVV */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: SIZES.sm }]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={COLORS.textLight}
                  value={expiryDate}
                  onChangeText={formatExpiryDate}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Icon name="calendar" size={20} color={COLORS.textSecondary} style={{ marginLeft: SIZES.sm }} />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: SIZES.sm }]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor={COLORS.textLight}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                <Icon name="lock" size={20} color={COLORS.textSecondary} style={{ marginLeft: SIZES.sm }} />
              </View>
            </View>
          </View>

          {/* Save Card */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSaveCard(!saveCard)}
          >
            <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
              {saveCard && <Icon name="check" size={14} color={COLORS.white} />}
            </View>
            <Text style={styles.checkboxLabel}>Save card for future payments</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Icon name="info" size={20} color={COLORS.info} style={{ marginRight: SIZES.sm }} />
          <Text style={styles.infoText}>
            Your card details are encrypted and secure. We use Stripe for payment processing.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <Button
          title="Pay Now"
          onPress={handlePayment}
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
  cardPreview: { backgroundColor: COLORS.primary, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.lg, padding: SIZES.xl, borderRadius: SIZES.radiusLarge, minHeight: 200, ...SHADOWS.large, overflow: 'hidden' },
  cardPattern: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardChip: { width: 50, height: 40, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: SIZES.radius, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.lg },
  cardNumberPreview: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.white, letterSpacing: 2, marginBottom: SIZES.xl },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontSize: SIZES.caption, color: 'rgba(255,255,255,0.7)', marginBottom: SIZES.xs },
  cardValue: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.white },
  formSection: { padding: SIZES.paddingHorizontal, marginTop: SIZES.lg },
  inputGroup: { marginBottom: SIZES.lg },
  inputLabel: { fontSize: SIZES.bodySmall, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: SIZES.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: SIZES.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  input: { flex: 1, fontSize: SIZES.body, color: COLORS.text, paddingVertical: SIZES.md },
  row: { flexDirection: 'row' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: SIZES.sm },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.sm },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxLabel: { fontSize: SIZES.bodySmall, color: COLORS.text },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.infoLight, padding: SIZES.md, marginHorizontal: SIZES.paddingHorizontal, borderRadius: SIZES.radius, marginTop: SIZES.lg },
  infoText: { flex: 1, fontSize: SIZES.caption, color: COLORS.textSecondary, lineHeight: 18 },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
