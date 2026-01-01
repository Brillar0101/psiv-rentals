// src/screens/booking/CartScreen.tsx
// Modern Cart Screen with Segment UI design pattern

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen() {
  const navigation = useNavigation();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const handleRemoveItem = (id: string) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeItem(id),
      },
    ]);
  };

  const handleUpdateQuantity = (id: string, increment: boolean) => {
    const item = items.find(i => i.id === id);
    if (item) {
      updateQuantity(id, item.quantity + (increment ? 1 : -1));
    }
  };

  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0</Text>
          </View>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add equipment to get started</Text>
          <Button
            title="Browse Equipment"
            onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Home' } as never)}
            style={{ marginTop: SIZES.xl }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{items.length}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cart Items */}
        <View style={styles.itemsSection}>
          {items.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDays}>{item.days} days rental</Text>
                <Text style={styles.itemPrice}>${item.dailyRate}/day</Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Text style={styles.removeIcon}>🗑️</Text>
                </TouchableOpacity>

                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQuantity(item.id, false)}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQuantity(item.id, true)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemTotal}>
                  ${(item.dailyRate * item.quantity * item.days).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Promo Code */}
        <View style={styles.promoSection}>
          <View style={styles.promoInput}>
            <Text style={styles.promoIcon}>🎟️</Text>
            <Text style={styles.promoPlaceholder}>Enter promo code</Text>
          </View>
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </View>

        {/* Price Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (8%)</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.deliveryFree}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
          <Text style={styles.footerItems}>{items.length} items</Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('PaymentMethod' as never, {
            bookingData: { items }
          } as never)}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  backIcon: { fontSize: 28, color: COLORS.text },
  headerTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  badge: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: SIZES.caption, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  itemsSection: { padding: SIZES.paddingHorizontal },
  itemCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.md, marginBottom: SIZES.md, flexDirection: 'row', ...SHADOWS.card },
  itemImage: { width: 80, height: 80, borderRadius: SIZES.radius, backgroundColor: COLORS.background },
  itemDetails: { flex: 1, marginLeft: SIZES.md, justifyContent: 'center' },
  itemName: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.xs },
  itemDays: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  itemPrice: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.medium, color: COLORS.primary },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  removeBtn: { padding: SIZES.xs },
  removeIcon: { fontSize: 16 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: SIZES.radiusPill, padding: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  qtyText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginHorizontal: SIZES.sm },
  itemTotal: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  promoSection: { flexDirection: 'row', paddingHorizontal: SIZES.paddingHorizontal, marginBottom: SIZES.md, gap: SIZES.sm },
  promoInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.md, ...SHADOWS.small },
  promoIcon: { fontSize: 20, marginRight: SIZES.sm },
  promoPlaceholder: { fontSize: SIZES.body, color: COLORS.textLight },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingHorizontal: SIZES.lg, justifyContent: 'center' },
  applyText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.white },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.md, ...SHADOWS.card },
  summaryTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  summaryLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  summaryValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  deliveryFree: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.success },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.md },
  totalRow: { marginBottom: 0 },
  totalLabel: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  totalValue: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large, flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  footerInfo: { flex: 1 },
  footerTotal: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  footerItems: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  checkoutBtn: { flex: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.paddingHorizontal },
  emptyIcon: { fontSize: 80, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.md },
});
