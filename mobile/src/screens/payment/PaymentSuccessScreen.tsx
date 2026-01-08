// src/screens/payment/PaymentSuccessScreen-Modern.tsx
// Payment Success Screen with Animation

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.checkmarkCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Icon name="check" size={64} color={COLORS.white} />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
          <Text style={styles.title}>Payment Successful!</Text>
          <Text style={styles.subtitle}>Your booking has been confirmed</Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>#BK-{Date.now().toString().slice(-6)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValueHighlight}>$1,418.20</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>•••• 4242</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>

          <View style={styles.nextSteps}>
            <Text style={styles.nextTitle}>What's Next?</Text>
            <View style={styles.stepRow}>
              <Icon name="mail" size={24} color={COLORS.primary} style={{ marginRight: SIZES.md }} />
              <Text style={styles.stepText}>Confirmation email sent</Text>
            </View>
            <View style={styles.stepRow}>
              <Icon name="calendar" size={24} color={COLORS.primary} style={{ marginRight: SIZES.md }} />
              <Text style={styles.stepText}>Pickup details shared 24hrs before</Text>
            </View>
            <View style={styles.stepRow}>
              <Icon name="message-circle" size={24} color={COLORS.primary} style={{ marginRight: SIZES.md }} />
              <Text style={styles.stepText}>Contact support for questions</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <Button title="View Booking" onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Bookings' } as never)} style={{ marginBottom: SIZES.sm }} fullWidth />
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('MainTabs' as never)}>
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.paddingHorizontal },
  checkmarkCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.xl },
  title: { fontSize: SIZES.h2, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm, textAlign: 'center' },
  subtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.xxl, textAlign: 'center' },
  detailsCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, width: '100%', marginBottom: SIZES.xl },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.sm },
  detailLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  detailValue: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text },
  detailValueHighlight: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.primary },
  divider: { height: 1, backgroundColor: COLORS.border },
  nextSteps: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, width: '100%' },
  nextTitle: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.md },
  stepText: { flex: 1, fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  footer: { padding: SIZES.paddingHorizontal, paddingBottom: SIZES.xl },
  secondaryBtn: { paddingVertical: SIZES.md, alignItems: 'center' },
  secondaryBtnText: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.primary },
});
