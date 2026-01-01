// src/screens/booking/AddToCartConfirmScreen.tsx
// Add to Cart Confirmation Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useCartStore } from '../../store/cartStore';
import { equipmentAPI } from '../../services/api';

export default function AddToCartConfirmScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { equipmentId, startDate, endDate, pricing } = route.params as any;
  const { addItem } = useCartStore();
  
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getEquipmentById(equipmentId);
      if (response.success) {
        setEquipment(response.data);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!equipment) return;

    // Add to cart
    addItem({
      id: Date.now().toString(),
      equipmentId: equipment.id,
      name: equipment.name,
      image: equipment.images?.[0] || 'https://via.placeholder.com/400',
      dailyRate: equipment.daily_rate,
      quantity: 1,
      startDate,
      endDate,
      days: pricing.total_days || 1,
    });

    // Show success message
    Alert.alert(
      'Added to Cart! 🛒',
      `${equipment.name} has been added to your cart.`,
      [
        {
          text: 'Continue Shopping',
          onPress: () => navigation.navigate('Home' as never),
        },
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('MainTabs' as never, { screen: 'Cart' } as never),
        },
      ]
    );
  };

  if (loading || !equipment) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  const totalDays = pricing?.total_days || 1;
  const dailyRate = equipment.daily_rate || 0;
  const subtotal = dailyRate * totalDays;
  const deposit = equipment.damage_deposit || 0;
  const tax = subtotal * 0.08;
  const total = subtotal + deposit + tax;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review & Add to Cart</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Equipment Card */}
        <View style={styles.equipmentCard}>
          <Image
            source={{ uri: equipment.images?.[0] || 'https://via.placeholder.com/400' }}
            style={styles.equipmentImage}
          />
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{equipment.name}</Text>
            <Text style={styles.equipmentRate}>${dailyRate}/day</Text>
          </View>
        </View>

        {/* Rental Period */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rental Period</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>From</Text>
              <Text style={styles.dateValue}>{startDate}</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>To</Text>
              <Text style={styles.dateValue}>{endDate}</Text>
            </View>
          </View>
          <View style={styles.daysBox}>
            <Text style={styles.daysText}>{totalDays} days rental</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Breakdown</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Daily Rate × {totalDays}</Text>
            <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Damage Deposit</Text>
            <Text style={styles.priceValue}>${deposit.toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (8%)</Text>
            <Text style={styles.priceValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            You can add more items to your cart before checkout
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.footer}>
        <Button
          title="Add to Cart 🛒"
          onPress={handleAddToCart}
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
  headerTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  equipmentCard: { backgroundColor: COLORS.white, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.md, borderRadius: SIZES.radiusLarge, padding: SIZES.md, flexDirection: 'row', ...SHADOWS.card },
  equipmentImage: { width: 80, height: 80, borderRadius: SIZES.radius, backgroundColor: COLORS.background },
  equipmentInfo: { flex: 1, marginLeft: SIZES.md, justifyContent: 'center' },
  equipmentName: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  equipmentRate: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  card: { backgroundColor: COLORS.white, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.md, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, ...SHADOWS.card },
  cardTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SIZES.md },
  dateBox: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.md, borderRadius: SIZES.radius },
  dateLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  dateValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  arrowIcon: { fontSize: 24, marginHorizontal: SIZES.sm, color: COLORS.textSecondary },
  daysBox: { backgroundColor: COLORS.primaryAlpha, padding: SIZES.md, borderRadius: SIZES.radius, alignItems: 'center' },
  daysText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  priceLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  priceValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.md },
  totalRow: { marginBottom: 0 },
  totalLabel: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  totalValue: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.infoLight, padding: SIZES.md, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.md, borderRadius: SIZES.radius },
  infoIcon: { fontSize: 24, marginRight: SIZES.sm },
  infoText: { flex: 1, fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
