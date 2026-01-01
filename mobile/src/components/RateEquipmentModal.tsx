// mobile/src/components/RateEquipmentModal.tsx
// Beautiful rating modal like the design

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../constants/theme';
import { Button } from './ui/Button';
import api from '../services/api';

interface RateEquipmentModalProps {
  visible: boolean;
  onClose: () => void;
  equipmentId: string;
  equipmentName: string;
  onSubmitSuccess?: () => void;
}

export default function RateEquipmentModal({
  visible,
  onClose,
  equipmentId,
  equipmentName,
  onSubmitSuccess,
}: RateEquipmentModalProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please select a star rating');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/reviews', {
        equipment_id: equipmentId,
        rating,
        review_text: reviewText.trim() || null,
        is_anonymous: isAnonymous,
      });

      if (response.data.success) {
        Alert.alert('Thank you! 🎉', 'Your review has been submitted');
        onSubmitSuccess?.();
        handleClose();
      }
    } catch (error: any) {
      console.error('Submit review error:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReviewText('');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>⭐</Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Rate Our Product</Text>
            <Text style={styles.subtitle}>Provide us with feedback for the product.</Text>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingLabel}>Your Rating</Text>
                <View style={styles.infoIcon}>
                  <Text style={styles.infoIconText}>ℹ️</Text>
                </View>
              </View>

              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starButton}
                    onPress={() => setRating(star)}
                  >
                    <Text style={styles.starIcon}>
                      {star <= rating ? '⭐' : '☆'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Product Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.productNameBox}>
                <Text style={styles.productName}>{equipmentName}</Text>
              </View>
            </View>

            {/* Review Text */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Review (Optional)</Text>
              <TextInput
                style={styles.textArea}
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Placeholder text..."
                placeholderTextColor={COLORS.textLight}
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>{reviewText.length}/200</Text>
            </View>

            {/* Anonymous Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
                {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Remain anonymous</Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  container: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.lg, paddingBottom: 0 },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 28 },
  closeBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  closeIcon: { fontSize: 24, color: COLORS.textSecondary },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, paddingHorizontal: SIZES.lg, marginTop: SIZES.md },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, paddingHorizontal: SIZES.lg, marginTop: 4, marginBottom: SIZES.xl },
  ratingSection: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  ratingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  ratingLabel: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  infoIcon: { marginLeft: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  infoIconText: { fontSize: 12 },
  starsContainer: { flexDirection: 'row', gap: 12 },
  starButton: { width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  starIcon: { fontSize: 32 },
  inputGroup: { paddingHorizontal: SIZES.lg, marginBottom: SIZES.lg },
  label: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  required: { color: '#5B5FEF' },
  productNameBox: { backgroundColor: COLORS.background, borderRadius: 12, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border },
  productName: { fontSize: 16, color: COLORS.text },
  textArea: { backgroundColor: COLORS.background, borderRadius: 12, padding: SIZES.md, borderWidth: 1, borderColor: COLORS.border, height: 120, textAlignVertical: 'top', fontSize: 14, color: COLORS.text },
  charCount: { fontSize: 12, color: COLORS.textSecondary, textAlign: 'right', marginTop: 4 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SIZES.lg, marginBottom: SIZES.xl },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  checkboxChecked: { backgroundColor: '#5B5FEF', borderColor: '#5B5FEF' },
  checkmark: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 16, color: COLORS.text },
  buttonsRow: { flexDirection: 'row', paddingHorizontal: SIZES.lg, gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  submitBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#5B5FEF', justifyContent: 'center', alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
