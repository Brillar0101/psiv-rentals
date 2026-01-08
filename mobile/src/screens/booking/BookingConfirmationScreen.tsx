// src/screens/booking/BookingConfirmationScreen.tsx
// Booking Confirmation Screen - Shows order success with delivery info

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

interface BookingData {
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    days: number;
    dailyRate: number;
    startDate: string;
    image: string;
  }>;
  total: number;
  promoCode?: string;
  promoDiscount?: number;
  creditsUsed?: number;
  creditToWallet?: number;
  deliveryDate: string;
  paymentMethod: string;
}

export default function BookingConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const bookingData = (route.params as any)?.bookingData as BookingData;

  // Animation values
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations together (parallel instead of sequence)
    Animated.parallel([
      Animated.spring(checkmarkScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFirstRentalDate = () => {
    if (!bookingData?.items?.[0]?.startDate) return '';
    return formatDate(bookingData.items[0].startDate);
  };

  const getDeliveryDate = () => {
    if (!bookingData?.deliveryDate) return '';
    return formatDate(bookingData.deliveryDate);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <View style={styles.successSection}>
          <Animated.View
            style={[
              styles.checkmarkCircle,
              { transform: [{ scale: checkmarkScale }] },
            ]}
          >
            <Icon name="check" size={48} color={COLORS.white} />
          </Animated.View>

          <Animated.View style={{ opacity: contentOpacity }}>
            <Text style={styles.successTitle}>Order Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your rental has been successfully booked
            </Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.contentContainer, { opacity: contentOpacity }]}>
          {/* Delivery Info Card */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryHeader}>
              <View style={styles.deliveryIconContainer}>
                <Icon name="truck" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deliveryTitle}>Delivery Information</Text>
                <Text style={styles.deliverySubtitle}>
                  Equipment will be delivered to you
                </Text>
              </View>
            </View>

            <View style={styles.deliveryDetails}>
              <View style={styles.deliveryRow}>
                <Icon name="calendar" size={18} color={COLORS.textSecondary} />
                <View style={{ marginLeft: SIZES.sm, flex: 1 }}>
                  <Text style={styles.deliveryLabel}>Delivery Date</Text>
                  <Text style={styles.deliveryValue}>{getDeliveryDate()}</Text>
                </View>
              </View>

              <View style={styles.deliveryRow}>
                <Icon name="clock" size={18} color={COLORS.textSecondary} />
                <View style={{ marginLeft: SIZES.sm, flex: 1 }}>
                  <Text style={styles.deliveryLabel}>Rental Starts</Text>
                  <Text style={styles.deliveryValue}>{getFirstRentalDate()}</Text>
                </View>
              </View>

              <View style={[styles.deliveryRow, styles.notificationRow]}>
                <Icon name="bell" size={18} color={COLORS.info} />
                <Text style={styles.notificationText}>
                  You'll receive a notification reminder one day before delivery!
                </Text>
              </View>
            </View>
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Order Summary</Text>

            {bookingData?.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity}x - {item.days} days
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${(item.dailyRate * item.quantity * item.days).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            {bookingData?.promoCode && (
              <View style={styles.discountRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="tag" size={16} color={COLORS.success} />
                  <Text style={styles.discountLabel}> Promo: {bookingData.promoCode}</Text>
                </View>
                <Text style={styles.discountValue}>
                  -${bookingData.promoDiscount?.toFixed(2)}
                </Text>
              </View>
            )}

            {bookingData?.creditsUsed && bookingData.creditsUsed > 0 && (
              <View style={styles.discountRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="credit-card" size={16} color={COLORS.success} />
                  <Text style={styles.discountLabel}> Credits Used</Text>
                </View>
                <Text style={styles.discountValue}>
                  -${bookingData.creditsUsed.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>${bookingData?.total?.toFixed(2) || '0.00'}</Text>
            </View>

            {bookingData?.paymentMethod && (
              <View style={styles.paymentMethodRow}>
                <Icon name="check-circle" size={16} color={COLORS.success} />
                <Text style={styles.paymentMethodText}>
                  Paid with {bookingData.paymentMethod}
                </Text>
              </View>
            )}
          </View>

          {/* Wallet Credit Added */}
          {bookingData?.creditToWallet && bookingData.creditToWallet > 0 && (
            <View style={styles.walletCard}>
              <View style={styles.walletIconContainer}>
                <Icon name="gift" size={24} color={COLORS.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.walletTitle}>Bonus Credit Added!</Text>
                <Text style={styles.walletAmount}>
                  ${bookingData.creditToWallet.toFixed(2)} has been added to your wallet
                </Text>
              </View>
            </View>
          )}

          {/* What's Next */}
          <View style={styles.nextStepsCard}>
            <Text style={styles.cardTitle}>What's Next?</Text>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Confirmation Email</Text>
                <Text style={styles.stepDescription}>
                  Check your email for booking details
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Delivery Day</Text>
                <Text style={styles.stepDescription}>
                  Equipment arrives the day before your rental starts
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>Return</Text>
                <Text style={styles.stepDescription}>
                  Return equipment on the last day of your rental
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <Button
          title="My Bookings"
          onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Bookings' } as never)}
          variant="outline"
          style={styles.secondaryBtn}
        />
        <Button
          title="Back to Home"
          onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Home' } as never)}
          style={styles.primaryBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
    paddingTop: 80,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...SHADOWS.medium,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  successTitle: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  successSubtitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  contentContainer: {
    padding: SIZES.paddingHorizontal,
    paddingTop: SIZES.lg,
  },
  deliveryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.card,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  deliveryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  deliveryTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  deliverySubtitle: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  deliveryDetails: {
    gap: SIZES.md,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryLabel: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  deliveryValue: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  notificationRow: {
    backgroundColor: COLORS.infoLight,
    padding: SIZES.sm,
    borderRadius: SIZES.radius,
  },
  notificationText: {
    flex: 1,
    marginLeft: SIZES.sm,
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.info,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.card,
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  itemName: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  itemDetails: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  itemPrice: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.md,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  discountLabel: {
    fontSize: SIZES.body,
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  discountValue: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.success,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: SIZES.h4,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.sm,
    gap: SIZES.xs,
  },
  paymentMethodText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.success,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  walletIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  walletTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.success,
  },
  walletAmount: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  nextStepsCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.lg,
    marginBottom: SIZES.md,
    ...SHADOWS.card,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  stepNumberText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  stepTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: SIZES.md,
    paddingBottom: 34,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
  },
  secondaryBtn: {
    flex: 1,
    maxWidth: 180,
  },
  primaryBtn: {
    flex: 1,
    maxWidth: 180,
  },
});
