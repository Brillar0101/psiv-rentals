// src/screens/booking/BookingSummaryScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function BookingSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { equipmentId, startDate, endDate, pricing } = route.params as any;

  console.log('Booking Summary - Pricing:', pricing); // Debug log

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Booking Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rental Period</Text>
          <Text style={styles.dateText}>{startDate} → {endDate}</Text>
          <Text style={styles.daysText}>{pricing?.total_days || 0} days</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Daily Rate × {pricing?.total_days || 0}</Text>
            <Text style={styles.priceValue}>${pricing?.subtotal || 0}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Damage Deposit</Text>
            <Text style={styles.priceValue}>${pricing?.damage_deposit || 0}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>${pricing?.tax || 0}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${pricing?.total_amount || 0}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Proceed to Payment" 
          onPress={() => navigation.navigate('PaymentMethod' as never, { 
            bookingData: { equipmentId, startDate, endDate, pricing } 
          } as never)} 
          fullWidth 
        />
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
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.md, ...SHADOWS.card },
  sectionTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  dateText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  daysText: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  priceLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  priceValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  totalRow: { marginTop: SIZES.md, paddingTop: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  totalValue: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
