// src/screens/profile/PastBookingsScreen.tsx
// Past Bookings Screen - Shows completed/cancelled bookings

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

export default function PastBookingsScreen() {
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
        // Filter only past bookings (completed, cancelled)
        const pastBookings = response.data.filter((booking: any) => 
          ['completed', 'cancelled'].includes(booking.status)
        );
        setBookings(pastBookings);
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
      case 'completed': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
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
            <Text style={styles.dateLabel}>Rented</Text>
            <Text style={styles.dateValue}>{new Date(item.start_date).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.dateArrow}>→</Text>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Returned</Text>
            <Text style={styles.dateValue}>{new Date(item.end_date).toLocaleDateString()}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Paid</Text>
            <Text style={styles.price}>${item.total_amount}</Text>
          </View>
          {item.status === 'completed' && (
            <TouchableOpacity style={styles.rateBtn}>
              <Text style={styles.rateBtnText}>⭐ Rate</Text>
            </TouchableOpacity>
          )}
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
          <Text style={styles.headerTitle}>Past Bookings</Text>
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
        <Text style={styles.headerTitle}>Past Bookings</Text>
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
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Past Bookings</Text>
            <Text style={styles.emptySubtitle}>Your booking history will appear here</Text>
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
  image: { width: '100%', height: 180, backgroundColor: COLORS.background, opacity: 0.8 },
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
  price: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  rateBtn: { backgroundColor: COLORS.warningLight, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusPill },
  rateBtnText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.warning },
  empty: { alignItems: 'center', paddingVertical: SIZES.xxl * 2 },
  emptyIcon: { fontSize: 80, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SIZES.xl },
});
