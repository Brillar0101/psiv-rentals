// src/screens/profile/ActiveBookingsScreen.tsx
// Active Bookings Screen - Shows current/upcoming bookings

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { bookingAPI } from '../../services/api';

export default function ActiveBookingsScreen() {
  const navigation = useNavigation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      if (response.success) {
        // Filter only active bookings (pending, confirmed, ongoing)
        const activeBookings = response.data.filter((booking: any) => 
          ['pending', 'confirmed', 'ongoing'].includes(booking.status)
        );
        setBookings(activeBookings);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.success;
      case 'ongoing': return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Payment Pending';
      case 'confirmed': return 'Confirmed';
      case 'ongoing': return 'In Progress';
      default: return status;
    }
  };

  const renderBookingCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {/* Navigate to booking details */}}
    >
      <Image
        source={{ uri: item.equipment?.images?.[0] || 'https://via.placeholder.com/400' }}
        style={styles.image}
      />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.equipmentName} numberOfLines={1}>
            {item.equipment?.name || 'Equipment'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Start</Text>
            <Text style={styles.dateValue}>{new Date(item.start_date).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.dateArrow}>→</Text>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>End</Text>
            <Text style={styles.dateValue}>{new Date(item.end_date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.price}>${item.total_amount}</Text>
          </View>
          <TouchableOpacity style={styles.detailsBtn}>
            <Text style={styles.detailsBtnText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Bookings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingCard}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No Active Bookings</Text>
            <Text style={styles.emptySubtitle}>You don't have any active bookings at the moment</Text>
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Home' } as never)}
            >
              <Text style={styles.browseBtnText}>Browse Equipment</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white, ...SHADOWS.small },
  backIcon: { fontSize: 28, color: COLORS.text },
  headerTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SIZES.paddingHorizontal },
  card: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, marginBottom: SIZES.md, overflow: 'hidden', ...SHADOWS.card },
  image: { width: '100%', height: 180, backgroundColor: COLORS.background },
  cardContent: { padding: SIZES.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  equipmentName: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, flex: 1, marginRight: SIZES.sm },
  statusBadge: { paddingHorizontal: SIZES.sm, paddingVertical: 4, borderRadius: SIZES.radiusPill },
  statusText: { fontSize: SIZES.caption, fontWeight: FONT_WEIGHTS.semiBold },
  dateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, padding: SIZES.md, borderRadius: SIZES.radius, marginBottom: SIZES.md },
  dateItem: { flex: 1 },
  dateLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  dateValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  dateArrow: { fontSize: 20, color: COLORS.textSecondary, marginHorizontal: SIZES.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: {},
  priceLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  price: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  detailsBtn: { backgroundColor: COLORS.primaryAlpha, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusPill },
  detailsBtnText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.primary },
  empty: { alignItems: 'center', paddingVertical: SIZES.xxl * 2 },
  emptyIcon: { fontSize: 80, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.xl, textAlign: 'center', paddingHorizontal: SIZES.xl },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill },
  browseBtnText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.white },
});
