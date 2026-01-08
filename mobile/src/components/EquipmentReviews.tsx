// mobile/src/components/EquipmentReviews.tsx
// Display equipment reviews

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import { Icon } from './ui/Icon';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  user: {
    full_name: string;
    email: string;
  } | null;
}

interface EquipmentReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function EquipmentReviews({
  reviews,
  averageRating,
  totalReviews,
}: EquipmentReviewsProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <View key={i} style={styles.starIconWrapper}>
        <Icon name="star" size={16} color={i < rating ? COLORS.warning : COLORS.border} />
      </View>
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Icon name="star" size={60} color={COLORS.warning} />
        </View>
        <Text style={styles.emptyTitle}>No reviews yet</Text>
        <Text style={styles.emptySubtitle}>Be the first to review this product!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Rating Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingNumber}>{averageRating.toFixed(1)}</Text>
          <View style={styles.starsRow}>{renderStars(Math.round(averageRating))}</View>
        </View>
        <Text style={styles.totalText}>
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </Text>
      </View>

      {/* Reviews List */}
      <View style={styles.reviewsList}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.userInfo}>
                {review.user ? (
                  <>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitials(review.user.full_name)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{review.user.full_name}</Text>
                      <Text style={styles.userHandle}>
                        @{review.user.email.split('@')[0]}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>?</Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>Anonymous</Text>
                      <Text style={styles.userHandle}>@anonymous</Text>
                    </View>
                  </>
                )}
              </View>
              <TouchableOpacity style={styles.commentBtn}>
                <Icon name="message-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.starsRow}>{renderStars(review.rating)}</View>
              <Text style={styles.ratingText}>({review.rating})</Text>
            </View>

            {review.review_text && (
              <Text style={styles.reviewText}>{review.review_text}</Text>
            )}

            <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SIZES.lg },
  summaryCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginBottom: SIZES.lg, ...SHADOWS.card },
  ratingBadge: { alignItems: 'center' },
  ratingNumber: { fontSize: 36, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: 4 },
  starsRow: { flexDirection: 'row' },
  starIconWrapper: { marginHorizontal: 1 },
  totalText: { fontSize: SIZES.body, color: COLORS.textSecondary },
  reviewsList: {},
  sectionTitle: { fontSize: SIZES.h4, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  reviewCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.md, marginBottom: SIZES.sm, ...SHADOWS.small },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.sm },
  avatarText: { fontSize: 14, fontFamily: FONTS.bold, color: COLORS.white },
  userName: { fontSize: SIZES.body, fontFamily: FONTS.semiBold, color: COLORS.text },
  userHandle: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  commentBtn: { padding: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  ratingText: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginLeft: 4 },
  reviewText: { fontSize: SIZES.body, color: COLORS.text, lineHeight: 20, marginBottom: SIZES.sm },
  reviewDate: { fontSize: SIZES.caption, color: COLORS.textLight },
  emptyContainer: { alignItems: 'center', paddingVertical: SIZES.xxl },
  emptyIconContainer: { marginBottom: SIZES.md },
  emptyTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
