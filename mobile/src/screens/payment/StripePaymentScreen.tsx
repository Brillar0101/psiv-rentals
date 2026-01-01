// src/screens/payment/StripePaymentScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { paymentAPI } from '../../services/api';

export default function StripePaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as any;
  const { confirmPayment } = useStripe();

  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Safely extract booking data - handle double nesting!
  const bookingData = params?.bookingData?.bookingData || params?.bookingData || {};
  const pricing = bookingData?.pricing || {};
  
  // Extract values with fallbacks
  const totalDays = pricing?.total_days || pricing?.totalDays || 0;
  const subtotal = pricing?.subtotal || 0;
  const damageDeposit = pricing?.damage_deposit || pricing?.damageDeposit || 0;
  const tax = pricing?.tax || 0;
  const totalAmount = pricing?.total_amount || pricing?.totalAmount || 0;

  console.log('StripePayment - Full params:', params);
  console.log('StripePayment - bookingData:', bookingData);
  console.log('StripePayment - pricing:', pricing);
  console.log('StripePayment - totalAmount:', totalAmount);

  useEffect(() => {
    if (totalAmount > 0) {
      createPaymentIntent();
    } else {
      Alert.alert('Error', 'Invalid payment amount. Please try again.');
      navigation.goBack();
    }
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.createPaymentIntent({
        amount: totalAmount,
        bookingId: 'temp-booking-id',
        equipmentId: bookingData.equipmentId || '',
      });

      console.log('Payment intent response:', response);

      if (response.success) {
        setClientSecret(response.data.clientSecret);
      } else {
        Alert.alert('Error', 'Failed to initialize payment');
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      Alert.alert('Error', error.message || 'Failed to initialize payment. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!clientSecret) {
      Alert.alert('Error', 'Payment not initialized');
      return;
    }

    if (!cardComplete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        // Payment succeeded!
        Alert.alert(
          'Payment Successful! 🎉',
          'Your booking is confirmed.',
          [
            {
              text: 'View Bookings',
              onPress: () => {
                navigation.navigate('MainTabs' as never, { screen: 'Bookings' } as never);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rental Period</Text>
            <Text style={styles.summaryValue}>{totalDays} days</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rental Amount</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Damage Deposit</Text>
            <Text style={styles.summaryValue}>${damageDeposit.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Card Input */}
        {loading && !clientSecret ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Initializing payment...</Text>
          </View>
        ) : (
          <View style={styles.cardInputCard}>
            <Text style={styles.cardInputTitle}>Card Details</Text>
            
            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: COLORS.white,
                textColor: COLORS.text,
                borderRadius: SIZES.radius,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />

            <View style={styles.testCardInfo}>
              <Text style={styles.testCardTitle}>💡 Test Card</Text>
              <Text style={styles.testCardText}>4242 4242 4242 4242</Text>
              <Text style={styles.testCardText}>Any future date • Any CVC</Text>
            </View>
          </View>
        )}

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Your payment is secure and encrypted by Stripe
          </Text>
        </View>
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.footer}>
        <Button
          title={`Pay $${totalAmount.toFixed(2)}`}
          onPress={handlePayment}
          loading={loading}
          disabled={!cardComplete || !clientSecret}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  headerTitle: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  content: { flex: 1, padding: SIZES.paddingHorizontal },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginTop: SIZES.md, ...SHADOWS.card },
  summaryTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  summaryLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  summaryValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  totalRow: { marginTop: SIZES.md, paddingTop: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  totalValue: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  loadingCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.xxl, marginTop: SIZES.md, alignItems: 'center', ...SHADOWS.card },
  loadingText: { fontSize: SIZES.body, color: COLORS.textSecondary, marginTop: SIZES.md },
  cardInputCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginTop: SIZES.md, ...SHADOWS.card },
  cardInputTitle: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  cardField: { width: '100%', height: 50, marginVertical: SIZES.md },
  testCardInfo: { backgroundColor: COLORS.infoLight, padding: SIZES.md, borderRadius: SIZES.radius, marginTop: SIZES.md },
  testCardTitle: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.xs },
  testCardText: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  securityInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SIZES.md, borderRadius: SIZES.radius, marginTop: SIZES.md },
  securityIcon: { fontSize: 24, marginRight: SIZES.sm },
  securityText: { flex: 1, fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
