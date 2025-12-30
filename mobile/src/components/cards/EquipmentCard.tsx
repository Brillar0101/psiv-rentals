// src/components/cards/EquipmentCard.tsx
// Equipment listing card - adapted from Food Delivery UI

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONT_WEIGHTS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.screenPadding * 3) / 2;

interface EquipmentCardProps {
  id: string;
  name: string;
  brand?: string;
  dailyRate: number;
  image?: string;
  available: boolean;
  rating?: number;
  onPress: () => void;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  name,
  brand,
  dailyRate,
  image,
  available,
  rating,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
        
        {/* Availability badge */}
        {!available && (
          <View style={styles.unavailableBadge}>
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        
        {brand && (
          <Text style={styles.brand} numberOfLines={1}>
            {brand}
          </Text>
        )}

        {/* Price and rating */}
        <View style={styles.footer}>
          <Text style={styles.price}>${dailyRate}/day</Text>
          {rating && (
            <View style={styles.rating}>
              <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.md,
    ...SHADOWS.card,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  unavailableBadge: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSmall,
  },
  unavailableText: {
    color: COLORS.white,
    fontSize: SIZES.tiny,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  details: {
    padding: SIZES.sm,
  },
  name: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  brand: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xs,
  },
  price: {
    fontSize: SIZES.bodySmall,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
});
