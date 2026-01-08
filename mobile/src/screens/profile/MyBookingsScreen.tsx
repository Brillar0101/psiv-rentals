// src/screens/profile/MyBookingsScreen.tsx
// My Bookings Screen - Shows active and past bookings with detail modal

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { bookingAPI } from '../../services/api';
import BookingDetailModal from '../../components/BookingDetailModal';
import { Icon, IconName } from '../../components/ui/Icon';

export default function MyBookingsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      if (response.success) {
        const now = new Date();
        const filtered = response.data.filter((booking: any) => {
          const endDate = new Date(booking.end_date);
          if (activeTab === 'active') {
            return endDate >= now && booking.status !== 'cancelled';
          } else {
            return endDate < now || booking.status === 'cancelled';
          }
        });
        setBookings(filtered);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleBookingPress = (booking: any) => {
    setSelectedBooking(booking);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      case 'completed': return COLORS.textSecondary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string): IconName => {
    switch (status) {
      case 'confirmed': return 'check-circle';
      case 'pending': return 'clock';
      case 'cancelled': return 'x-circle';
      case 'completed': return 'check';
      default: return 'clipboard';
    }
  };

  const renderBooking = (booking: any) => (
    <TouchableOpacity
      key={booking.id}
      style={styles.bookingCard}
      onPress={() => handleBookingPress(booking)}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.equipmentName} numberOfLines={2}>{booking.equipment_name || 'Equipment'}</Text>
          <Text style={styles.bookingDates}>
            {new Date(booking.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })} - {new Date(booking.end_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
          <Icon name={getStatusIcon(booking.status)} size={12} color={getStatusColor(booking.status)} style={{ marginRight: 4 }} />
          <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
            {booking.status}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Amount</Text>
          <Text style={styles.detailValue}>${booking.total_amount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Booking ID</Text>
          <Text style={styles.detailValueSmall}>#{booking.id.slice(0, 8)}</Text>
        </View>
      </View>

      {/* Tap to view indicator */}
      <View style={styles.tapIndicator}>
        <Text style={styles.tapIndicatorText}>Tap to view details →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        >
          {bookings.length > 0 ? (
            bookings.map(renderBooking)
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIconContainer}>
                <Icon name={activeTab === 'active' ? 'calendar' : 'clipboard'} size={64} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'active' ? 'No Active Bookings' : 'No Past Bookings'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'active' 
                  ? 'Book your first equipment to get started!' 
                  : 'Your completed bookings will appear here'}
              </Text>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => navigation.navigate('Home' as never)}
              >
                <Text style={styles.browseButtonText}>Browse Equipment</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Booking Detail Modal */}
      <BookingDetailModal
        visible={modalVisible}
        booking={selectedBooking}
        onClose={handleModalClose}
        onRefresh={loadBookings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  headerTitle: { fontSize: SIZES.h2, fontFamily: FONTS.bold, color: COLORS.text },
  tabs: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingBottom: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: SIZES.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: SIZES.body, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: SIZES.paddingHorizontal },
  bookingCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.md, marginTop: SIZES.md, ...SHADOWS.card },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.md },
  bookingInfo: { flex: 1, marginRight: SIZES.sm },
  equipmentName: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  bookingDates: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: SIZES.radiusPill, flexShrink: 0 },
  statusText: { fontSize: 11, fontFamily: FONTS.semiBold, textTransform: 'capitalize' },
  bookingDetails: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.xs },
  detailLabel: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  detailValue: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text },
  detailValueSmall: { fontSize: SIZES.bodySmall, fontFamily: FONTS.medium, color: COLORS.textSecondary },
  tapIndicator: { marginTop: SIZES.sm, alignItems: 'center' },
  tapIndicatorText: { fontSize: SIZES.caption, color: COLORS.primary, fontFamily: FONTS.medium },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.xxl * 2 },
  emptyIconContainer: { marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.xl },
  browseButton: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill },
  browseButtonText: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.white },
});
