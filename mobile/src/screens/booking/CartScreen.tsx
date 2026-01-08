// src/screens/booking/CartScreen.tsx
// Modern Cart Screen with Promo Codes and Credits

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { useAlert } from '../../components/ui/AlertModal';
import { useCartStore } from '../../store/cartStore';
import { promoAPI, bookingAPI } from '../../services/api';

export default function CartScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<any>(null);

  // Credits state
  const [creditBalance, setCreditBalance] = useState(0);
  const [useCredits, setUseCredits] = useState(false);
  const [creditsLoading, setCreditsLoading] = useState(true);

  // Checkout state
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load credits when screen focuses
  useFocusEffect(
    React.useCallback(() => {
      loadCredits();
    }, [])
  );

  const loadCredits = async () => {
    try {
      setCreditsLoading(true);
      const response = await promoAPI.getCredits();
      if (response.success) {
        setCreditBalance(response.data.balance || 0);
      }
    } catch (error) {
      console.error('Load credits error:', error);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleRemoveItem = (id: string) => {
    showAlert({
      type: 'confirm',
      title: 'Remove Item',
      message: 'Remove this item from cart?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeItem(id),
        },
      ],
    });
  };

  const handleUpdateQuantity = (id: string, increment: boolean) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const newQuantity = item.quantity + (increment ? 1 : -1);
      const success = updateQuantity(id, newQuantity);

      if (!success && increment) {
        showAlert({
          type: 'warning',
          title: 'Stock Limit',
          message: `Only ${item.maxQuantity} available in stock.`,
        });
      }
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      showAlert({
        type: 'info',
        title: 'Enter Code',
        message: 'Please enter a promo code',
      });
      return;
    }

    setPromoLoading(true);
    try {
      const response = await promoAPI.validateCode(promoCode.trim(), subtotal + tax);

      if (response.success) {
        setAppliedPromo(response.data);
        showAlert({
          type: 'success',
          title: 'Promo Applied!',
          message: response.data.credit_to_wallet > 0
            ? `$${response.data.discount_amount.toFixed(2)} off your order! $${response.data.credit_to_wallet.toFixed(2)} will be added to your wallet.`
            : `$${response.data.discount_amount.toFixed(2)} discount applied!`,
        });
      } else {
        showAlert({
          type: 'error',
          title: 'Invalid Code',
          message: response.error || 'This promo code is not valid',
        });
      }
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to validate promo code',
      });
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
  };

  // Handle checkout (zero-payment or redirect to payment)
  const handleCheckout = async () => {
    // If total is $0 (fully covered by promo/credits), complete order directly
    if (total === 0) {
      setCheckoutLoading(true);
      try {
        // Create bookings for each item in cart
        const bookingPromises = items.map(async (item) => {
          const startDate = new Date(item.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + item.days - 1);

          // Calculate item total (rental amount for this item)
          const itemTotal = item.dailyRate * item.quantity * item.days;

          return bookingAPI.createBooking({
            equipment_id: item.equipmentId,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            total_amount: 0, // $0 since covered by credits/promo
            damage_deposit: 0, // No deposit charged upfront
            payment_status: 'paid', // Mark as paid since covered by credits/promo
          });
        });

        const results = await Promise.all(bookingPromises);
        const allSuccessful = results.every(r => r.success);

        if (allSuccessful) {
          // Apply promo code if used (this records usage and adds remaining to wallet)
          if (appliedPromo?.code) {
            await promoAPI.applyCode(appliedPromo.code, subtotal + tax);
          }

          // Use credits if selected
          if (creditsToUse > 0) {
            await promoAPI.useCredits(creditsToUse);
          }

          // Save items before clearing cart for confirmation screen
          const bookedItems = [...items];
          const firstItem = bookedItems[0];
          const deliveryDate = new Date(firstItem.startDate);
          deliveryDate.setDate(deliveryDate.getDate() - 1);

          // Clear cart
          clearCart();

          // Navigate to confirmation with booking details
          (navigation as any).navigate('BookingConfirmation', {
            bookingData: {
              items: bookedItems,
              total: 0,
              promoCode: appliedPromo?.code,
              promoDiscount,
              creditsUsed: creditsToUse,
              creditToWallet: appliedPromo?.credit_to_wallet || 0,
              deliveryDate: deliveryDate.toISOString(),
              paymentMethod: 'Credits/Promo',
            },
          });
        } else {
          showAlert({
            type: 'error',
            title: 'Booking Failed',
            message: 'Failed to create booking. Please try again.',
          });
        }
      } catch (error: any) {
        console.error('Checkout error:', error);
        console.error('Error response:', error.response?.data);
        const errorMessage = error.response?.data?.error || error.message || 'Something went wrong. Please try again.';
        showAlert({
          type: 'error',
          title: 'Checkout Error',
          message: errorMessage,
        });
      } finally {
        setCheckoutLoading(false);
      }
    } else {
      // Navigate to payment method for normal checkout
      navigation.navigate('PaymentMethod' as never, {
        bookingData: {
          items,
          promoCode: appliedPromo?.code,
          promoDiscount,
          creditsUsed: creditsToUse,
          creditToWallet: appliedPromo?.credit_to_wallet || 0,
          total,
        }
      } as never);
    }
  };

  // Calculate totals
  const subtotal = getTotalPrice();
  const tax = subtotal * 0.08;
  const promoDiscount = appliedPromo?.discount_amount || 0;
  const creditsToUse = useCredits ? Math.min(creditBalance, subtotal + tax - promoDiscount) : 0;
  const total = Math.max(0, subtotal + tax - promoDiscount - creditsToUse);

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>0</Text>
          </View>
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Icon name="shopping-cart" size={80} color={COLORS.textLight} />
          </View>
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
          <Icon name="arrow-left" size={28} color={COLORS.text} />
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
                  <Icon name="trash-2" size={16} color={COLORS.error} />
                </TouchableOpacity>

                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleUpdateQuantity(item.id, false)}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
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

        {/* Promo Code Section */}
        <View style={styles.promoSection}>
          {appliedPromo ? (
            <View style={styles.appliedPromoCard}>
              <View style={styles.appliedPromoInfo}>
                <Icon name="check-circle" size={20} color={COLORS.success} />
                <View style={{ marginLeft: SIZES.sm, flex: 1 }}>
                  <Text style={styles.appliedPromoCode}>{appliedPromo.code}</Text>
                  <Text style={styles.appliedPromoDiscount}>
                    -${appliedPromo.discount_amount.toFixed(2)} off
                    {appliedPromo.credit_to_wallet > 0 &&
                      ` + $${appliedPromo.credit_to_wallet.toFixed(2)} to wallet`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleRemovePromo}>
                <Icon name="x" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoInputRow}>
              <View style={styles.promoInput}>
                <Icon name="tag" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.promoTextInput}
                  placeholder="Enter promo code"
                  placeholderTextColor={COLORS.textLight}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  autoCapitalize="characters"
                />
              </View>
              <TouchableOpacity
                style={[styles.applyBtn, promoLoading && styles.applyBtnDisabled]}
                onPress={handleApplyPromo}
                disabled={promoLoading}
              >
                {promoLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.applyText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Credits Section */}
        {creditBalance > 0 && (
          <View style={styles.creditsSection}>
            <TouchableOpacity
              style={styles.creditsCard}
              onPress={() => setUseCredits(!useCredits)}
              activeOpacity={0.7}
            >
              <View style={styles.creditsLeft}>
                <View style={[styles.checkbox, useCredits && styles.checkboxChecked]}>
                  {useCredits && <Icon name="check" size={14} color={COLORS.white} />}
                </View>
                <View style={{ marginLeft: SIZES.sm }}>
                  <Text style={styles.creditsLabel}>Use Wallet Credits</Text>
                  <Text style={styles.creditsBalance}>
                    Available: ${creditBalance.toFixed(2)}
                  </Text>
                </View>
              </View>
              {useCredits && (
                <Text style={styles.creditsApplied}>-${creditsToUse.toFixed(2)}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

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

          {promoDiscount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Promo Discount</Text>
              <Text style={styles.discountValue}>-${promoDiscount.toFixed(2)}</Text>
            </View>
          )}

          {creditsToUse > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Credits Applied</Text>
              <Text style={styles.discountValue}>-${creditsToUse.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={styles.deliveryFree}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          {appliedPromo?.credit_to_wallet > 0 && (
            <View style={styles.walletNote}>
              <Icon name="gift" size={16} color={COLORS.success} />
              <Text style={styles.walletNoteText}>
                ${appliedPromo.credit_to_wallet.toFixed(2)} will be added to your wallet after checkout!
              </Text>
            </View>
          )}
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
          title={checkoutLoading ? "Processing..." : (total === 0 ? "Complete Order" : "Proceed to Checkout")}
          onPress={handleCheckout}
          disabled={checkoutLoading}
          style={styles.checkoutBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  headerTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  badge: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: SIZES.caption, fontFamily: FONTS.bold, color: COLORS.white },
  itemsSection: { padding: SIZES.paddingHorizontal },
  itemCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.md, marginBottom: SIZES.md, flexDirection: 'row', ...SHADOWS.card },
  itemImage: { width: 80, height: 80, borderRadius: SIZES.radius, backgroundColor: COLORS.background },
  itemDetails: { flex: 1, marginLeft: SIZES.md, justifyContent: 'center' },
  itemName: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: SIZES.xs },
  itemDays: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  itemPrice: { fontSize: SIZES.bodySmall, fontFamily: FONTS.medium, color: COLORS.primary },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  removeBtn: { padding: SIZES.xs },
  quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: SIZES.radiusPill, padding: 4 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text },
  qtyText: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text, marginHorizontal: SIZES.sm },
  itemTotal: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text },

  // Promo Section
  promoSection: { paddingHorizontal: SIZES.paddingHorizontal, marginBottom: SIZES.md },
  promoInputRow: { flexDirection: 'row', gap: SIZES.sm },
  promoInput: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: SIZES.md, ...SHADOWS.small },
  promoTextInput: { flex: 1, fontSize: SIZES.body, color: COLORS.text, paddingVertical: SIZES.md, marginLeft: SIZES.sm },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radius, paddingHorizontal: SIZES.lg, justifyContent: 'center', minWidth: 80, alignItems: 'center' },
  applyBtnDisabled: { opacity: 0.7 },
  applyText: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.white },

  // Applied Promo
  appliedPromoCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.successLight, borderRadius: SIZES.radius, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.success },
  appliedPromoInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  appliedPromoCode: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.success },
  appliedPromoDiscount: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary },

  // Credits Section
  creditsSection: { paddingHorizontal: SIZES.paddingHorizontal, marginBottom: SIZES.md },
  creditsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: SIZES.radius, padding: SIZES.md, ...SHADOWS.small },
  creditsLeft: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  creditsLabel: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text },
  creditsBalance: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  creditsApplied: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.success },

  // Summary
  summaryCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.md, ...SHADOWS.card },
  summaryTitle: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  summaryLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  summaryValue: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text },
  discountValue: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.success },
  deliveryFree: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.success },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SIZES.md },
  totalRow: { marginBottom: 0 },
  totalLabel: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text },
  totalValue: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.primary },
  walletNote: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.successLight, padding: SIZES.sm, borderRadius: SIZES.radius, marginTop: SIZES.md, gap: SIZES.xs },
  walletNoteText: { flex: 1, fontSize: SIZES.bodySmall, color: COLORS.success },

  // Footer
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large, flexDirection: 'row', alignItems: 'center', gap: SIZES.md },
  footerInfo: { flex: 1 },
  footerTotal: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  footerItems: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  checkoutBtn: { flex: 1 },

  // Empty State
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.paddingHorizontal },
  emptyIconContainer: { marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.md },
});
