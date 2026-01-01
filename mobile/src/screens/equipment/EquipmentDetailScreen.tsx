// src/screens/equipment/EquipmentDetailScreen.tsx
// Equipment Detail Screen - Full product page with booking

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { equipmentAPI } from '../../services/api';

const { width } = Dimensions.get('window');

export default function EquipmentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params as any;

  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadEquipment();
  }, [id]);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getById(id);
      if (response.success) {
        setEquipment(response.data);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!equipment) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Equipment not found</Text>
      </View>
    );
  }

  const images = equipment.images && equipment.images.length > 0 
    ? equipment.images 
    : ['https://via.placeholder.com/400x300?text=No+Image'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>♡</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {/* Horizontal Scrollable Images */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {images.map((imageUrl: string, index: number) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => navigation.navigate('EquipmentGallery' as never, { 
                  images, 
                  initialIndex: index 
                } as never)}
              >
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Image pagination dots */}
          {images.length > 1 && (
            <View style={styles.pagination}>
              {images.map((_: any, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Image counter badge */}
          {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}

          {/* View all images button */}
          {images.length > 1 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('EquipmentGallery' as never, { 
                images, 
                initialIndex: currentImageIndex 
              } as never)}
            >
              <Text style={styles.viewAllText}>📷 View All ({images.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Brand */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{equipment.name}</Text>
                {equipment.brand && (
                  <Text style={styles.brand}>{equipment.brand} {equipment.model}</Text>
                )}
              </View>
              
              {/* Availability badge */}
              <View style={[
                styles.availabilityBadge,
                equipment.quantity_available > 0 ? styles.availableBadge : styles.unavailableBadge
              ]}>
                <Text style={styles.availabilityText}>
                  {equipment.quantity_available > 0 ? '✓ Available' : '✕ Unavailable'}
                </Text>
              </View>
            </View>

            {/* Rating */}
            {equipment.average_rating > 0 && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStars}>⭐ {equipment.average_rating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({equipment.total_bookings || 0} rentals)</Text>
              </View>
            )}
          </View>

          {/* Pricing */}
          <View style={styles.pricingSection}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Daily Rate</Text>
                <Text style={styles.price}>${equipment.daily_rate}</Text>
              </View>
              {equipment.weekly_rate && (
                <View>
                  <Text style={styles.priceLabel}>Weekly Rate</Text>
                  <Text style={styles.price}>${equipment.weekly_rate}</Text>
                </View>
              )}
            </View>
            <Text style={styles.depositText}>
              + ${equipment.damage_deposit} security deposit
            </Text>
          </View>

          {/* Description */}
          {equipment.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{equipment.description}</Text>
            </View>
          )}

          {/* Specifications */}
          {equipment.specifications && Object.keys(equipment.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(equipment.specifications).map(([key, value]: any) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specLabel}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📦</Text>
              <Text style={styles.infoLabel}>Condition</Text>
              <Text style={styles.infoValue}>{equipment.condition}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>💰</Text>
              <Text style={styles.infoLabel}>Value</Text>
              <Text style={styles.infoValue}>${equipment.replacement_value}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>📋</Text>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{equipment.category_name || 'N/A'}</Text>
            </View>
          </View>

          {/* Bottom spacing */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>From</Text>
          <Text style={styles.footerPriceValue}>${equipment.daily_rate}/day</Text>
        </View>
        <Button
          title="Book Now"
          onPress={() => navigation.navigate('DateSelection' as never, { equipmentId: id } as never)}
          disabled={equipment.quantity_available === 0}
          style={styles.bookButton}
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.paddingHorizontal,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  favoriteIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  paginationDotActive: {
    opacity: 1,
  },
  viewAllButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusPill,
    ...SHADOWS.small,
  },
  viewAllText: {
    fontSize: SIZES.caption,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  imageCounter: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusPill,
  },
  imageCounterText: {
    fontSize: SIZES.caption,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.white,
  },
  content: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radiusXL,
    borderTopRightRadius: SIZES.radiusXL,
    marginTop: -20,
    paddingTop: SIZES.lg,
    paddingHorizontal: SIZES.paddingHorizontal,
  },
  titleSection: {
    marginBottom: SIZES.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  brand: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  availabilityBadge: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusPill,
  },
  availableBadge: {
    backgroundColor: COLORS.successLight,
  },
  unavailableBadge: {
    backgroundColor: COLORS.errorLight,
  },
  availabilityText: {
    fontSize: SIZES.caption,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  ratingStars: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  ratingCount: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  pricingSection: {
    backgroundColor: COLORS.primaryAlpha,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.lg,
  },
  priceRow: {
    flexDirection: 'row',
    gap: SIZES.xl,
    marginBottom: SIZES.xs,
  },
  priceLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  price: {
    fontSize: SIZES.h3,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  depositText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  description: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  specLabel: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  specValue: {
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  quickInfo: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: SIZES.xs,
  },
  infoLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  infoValue: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
  },
  footerPrice: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  footerPriceValue: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  bookButton: {
    flex: 1,
  },
});
