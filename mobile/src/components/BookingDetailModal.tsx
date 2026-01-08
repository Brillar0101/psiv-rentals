// src/components/BookingDetailModal.tsx
// Modal to show booking details and actions

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../constants/theme';
import { bookingAPI } from '../services/api';

interface BookingDetailModalProps {
  visible: boolean;
  booking: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function BookingDetailModal({ visible, booking, onClose, onRefresh }: BookingDetailModalProps) {
  if (!booking) return null;

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await bookingAPI.cancelBooking(booking.id);
              if (response.success) {
                Alert.alert('Success', 'Booking cancelled successfully');
                onRefresh();
                onClose();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const handleRetryPayment = () => {
    Alert.alert(
      'Retry Payment',
      'This feature will redirect you to complete payment',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // TODO: Navigate to payment screen with booking ID
            console.log('Navigate to payment:', booking.id);
            onClose();
          },
        },
      ]
    );
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Booking Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Status */}
            <View style={[styles.statusBanner, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                {booking.status.toUpperCase()}
              </Text>
            </View>

            {/* Equipment */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Equipment</Text>
              <Text style={styles.equipmentName}>{booking.equipment_name || 'Equipment'}</Text>
            </View>

            {/* Dates */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rental Period</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>Start</Text>
                  <Text style={styles.dateValue}>
                    {new Date(booking.start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.dateArrow}>→</Text>
                <View style={styles.dateBox}>
                  <Text style={styles.dateLabel}>End</Text>
                  <Text style={styles.dateValue}>
                    {new Date(booking.end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Breakdown</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>${booking.subtotal || booking.total_amount}</Text>
              </View>
              {booking.damage_deposit > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Damage Deposit</Text>
                  <Text style={styles.priceValue}>${booking.damage_deposit}</Text>
                </View>
              )}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>${booking.total_amount}</Text>
              </View>
            </View>

            {/* Booking Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Booking ID</Text>
                <Text style={styles.infoValue}>#{booking.id.slice(0, 8)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>
                  {new Date(booking.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            {booking.status === 'pending' && (
              <TouchableOpacity style={styles.retryButton} onPress={handleRetryPayment}>
                <Text style={styles.retryButtonText}>Retry Payment</Text>
              </TouchableOpacity>
            )}
            {(booking.status === 'pending' || booking.status === 'confirmed') && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelBooking}>
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
            {booking.status === 'cancelled' && (
              <TouchableOpacity style={styles.closeButtonFull} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.white, borderTopLeftRadius: SIZES.radiusXL, borderTopRightRadius: SIZES.radiusXL, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  closeButton: { fontSize: 28, color: COLORS.textSecondary },
  content: { padding: SIZES.lg },
  statusBanner: { padding: SIZES.md, borderRadius: SIZES.radiusLarge, marginBottom: SIZES.lg, alignItems: 'center' },
  statusText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold },
  section: { marginBottom: SIZES.xl },
  sectionTitle: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.textSecondary, marginBottom: SIZES.sm, textTransform: 'uppercase' },
  equipmentName: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateBox: { flex: 1, backgroundColor: COLORS.background, padding: SIZES.md, borderRadius: SIZES.radiusLarge },
  dateLabel: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  dateValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
  dateArrow: { fontSize: SIZES.h3, color: COLORS.textLight, marginHorizontal: SIZES.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  priceLabel: { fontSize: SIZES.body, color: COLORS.textSecondary },
  priceValue: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.medium, color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SIZES.sm, marginTop: SIZES.sm },
  totalLabel: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  totalValue: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.xs },
  infoLabel: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.medium, color: COLORS.text },
  actions: { padding: SIZES.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  retryButton: { backgroundColor: COLORS.primary, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill, marginBottom: SIZES.sm },
  retryButtonText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.white, textAlign: 'center' },
  cancelButton: { backgroundColor: COLORS.errorLight, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill },
  cancelButtonText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.error, textAlign: 'center' },
  closeButtonFull: { backgroundColor: COLORS.background, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill },
  closeButtonText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, textAlign: 'center' },
});
