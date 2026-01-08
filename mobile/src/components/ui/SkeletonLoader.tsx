// src/components/ui/SkeletonLoader.tsx
// Professional skeleton loading components
// Replaces ActivityIndicator with smooth, content-aware placeholders

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Base Skeleton component with shimmer animation
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = SIZES.radiusSmall,
  style,
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton for text lines
export const SkeletonText: React.FC<{ lines?: number; lastLineWidth?: string }> = ({
  lines = 3,
  lastLineWidth = '60%',
}) => {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={14}
          style={styles.textLine}
        />
      ))}
    </View>
  );
};

// Skeleton for avatar/profile image
export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 48 }) => {
  return <Skeleton width={size} height={size} borderRadius={size / 2} />;
};

// Skeleton for Equipment Card
export const SkeletonEquipmentCard: React.FC = () => {
  const cardWidth = (SCREEN_WIDTH - SIZES.screenPadding * 3) / 2;

  return (
    <View style={[styles.equipmentCard, { width: cardWidth }]}>
      <Skeleton
        width="100%"
        height={140}
        borderRadius={0}
        style={styles.equipmentImage}
      />
      <View style={styles.equipmentContent}>
        <Skeleton width="80%" height={14} style={styles.mb8} />
        <Skeleton width="50%" height={12} style={styles.mb12} />
        <View style={styles.row}>
          <Skeleton width="40%" height={16} />
          <Skeleton width={50} height={16} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for Equipment Grid (2 columns)
export const SkeletonEquipmentGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonEquipmentCard key={index} />
      ))}
    </View>
  );
};

// Skeleton for Category Card
export const SkeletonCategoryCard: React.FC = () => {
  return (
    <View style={styles.categoryCard}>
      <Skeleton width={70} height={70} borderRadius={35} />
      <Skeleton width={60} height={12} style={styles.mt8} />
    </View>
  );
};

// Skeleton for Category List (horizontal)
export const SkeletonCategoryList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.categoryList}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCategoryCard key={index} />
      ))}
    </View>
  );
};

// Skeleton for Booking Card
export const SkeletonBookingCard: React.FC = () => {
  return (
    <View style={styles.bookingCard}>
      <View style={styles.row}>
        <Skeleton width={80} height={80} borderRadius={SIZES.radius} />
        <View style={styles.bookingContent}>
          <Skeleton width="70%" height={16} style={styles.mb8} />
          <Skeleton width="50%" height={12} style={styles.mb8} />
          <Skeleton width={80} height={24} borderRadius={SIZES.radiusPill} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for Booking List
export const SkeletonBookingList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBookingCard key={index} />
      ))}
    </View>
  );
};

// Skeleton for Profile Menu Item
export const SkeletonMenuItem: React.FC = () => {
  return (
    <View style={styles.menuItem}>
      <Skeleton width={24} height={24} borderRadius={12} />
      <Skeleton width="60%" height={16} style={styles.ml12} />
      <View style={styles.flex1} />
      <Skeleton width={20} height={20} />
    </View>
  );
};

// Skeleton for Profile Screen
export const SkeletonProfileScreen: React.FC = () => {
  return (
    <View style={styles.profileContainer}>
      {/* Header */}
      <View style={styles.profileHeader}>
        <SkeletonAvatar size={80} />
        <Skeleton width={150} height={20} style={styles.mt12} />
        <Skeleton width={200} height={14} style={styles.mt8} />
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Skeleton width={100} height={12} style={styles.mb12} />
        <SkeletonMenuItem />
        <SkeletonMenuItem />
        <SkeletonMenuItem />
      </View>
    </View>
  );
};

// Skeleton for Equipment Detail Screen
export const SkeletonEquipmentDetail: React.FC = () => {
  return (
    <View style={styles.detailContainer}>
      {/* Image */}
      <Skeleton width="100%" height={400} borderRadius={0} />

      {/* Content */}
      <View style={styles.detailContent}>
        <Skeleton width="80%" height={28} style={styles.mb8} />
        <Skeleton width="40%" height={16} style={styles.mb16} />

        {/* Price */}
        <View style={styles.priceBox}>
          <Skeleton width="30%" height={24} />
          <Skeleton width="30%" height={24} />
        </View>

        {/* Description */}
        <Skeleton width={120} height={18} style={styles.mt24} />
        <SkeletonText lines={4} />

        {/* Quick Info */}
        <View style={styles.quickInfoRow}>
          <Skeleton width="30%" height={80} borderRadius={SIZES.radius} />
          <Skeleton width="30%" height={80} borderRadius={SIZES.radius} />
          <Skeleton width="30%" height={80} borderRadius={SIZES.radius} />
        </View>
      </View>
    </View>
  );
};

// Skeleton for Cart Item
export const SkeletonCartItem: React.FC = () => {
  return (
    <View style={styles.cartItem}>
      <Skeleton width={80} height={80} borderRadius={SIZES.radius} />
      <View style={styles.cartContent}>
        <Skeleton width="70%" height={16} style={styles.mb8} />
        <Skeleton width="40%" height={12} style={styles.mb8} />
        <Skeleton width="30%" height={14} />
      </View>
      <View style={styles.cartActions}>
        <Skeleton width={24} height={24} />
        <Skeleton width={80} height={32} borderRadius={SIZES.radiusPill} style={styles.mt8} />
        <Skeleton width={60} height={18} style={styles.mt8} />
      </View>
    </View>
  );
};

// Skeleton for Search Results
export const SkeletonSearchResults: React.FC = () => {
  return (
    <View style={styles.searchContainer}>
      <SkeletonEquipmentGrid count={6} />
    </View>
  );
};

// Skeleton for Home Screen
export const SkeletonHomeScreen: React.FC = () => {
  return (
    <View style={styles.homeContainer}>
      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={100} height={20} />
          <Skeleton width={60} height={16} />
        </View>
        <SkeletonCategoryList />
      </View>

      {/* Featured Equipment Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={160} height={20} />
          <Skeleton width={60} height={16} />
        </View>
        <SkeletonEquipmentGrid count={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.skeleton,
  },
  textContainer: {
    gap: 8,
  },
  textLine: {
    marginBottom: 4,
  },
  equipmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  equipmentImage: {
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
  },
  equipmentContent: {
    padding: SIZES.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingHorizontal,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  categoryList: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.paddingHorizontal,
  },
  bookingCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.card,
  },
  bookingContent: {
    flex: 1,
    marginLeft: SIZES.md,
    justifyContent: 'center',
  },
  listContainer: {
    paddingHorizontal: SIZES.paddingHorizontal,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.sm,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: SIZES.radiusLarge,
    borderBottomRightRadius: SIZES.radiusLarge,
  },
  menuSection: {
    padding: SIZES.paddingHorizontal,
    marginTop: SIZES.lg,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  detailContent: {
    padding: SIZES.paddingHorizontal,
    marginTop: -20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXL,
    borderTopRightRadius: SIZES.radiusXL,
    paddingTop: SIZES.lg,
  },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryAlpha,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
  },
  quickInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.card,
  },
  cartContent: {
    flex: 1,
    marginLeft: SIZES.md,
    justifyContent: 'center',
  },
  cartActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  searchContainer: {
    paddingTop: SIZES.md,
  },
  homeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingHorizontal,
    marginBottom: SIZES.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  mb8: {
    marginBottom: 8,
  },
  mb12: {
    marginBottom: 12,
  },
  mb16: {
    marginBottom: 16,
  },
  mt8: {
    marginTop: 8,
  },
  mt12: {
    marginTop: 12,
  },
  mt24: {
    marginTop: 24,
  },
  ml12: {
    marginLeft: 12,
  },
});

export default Skeleton;
