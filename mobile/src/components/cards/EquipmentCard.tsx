// src/components/cards/EquipmentCard.tsx
// Equipment listing card with Professional Icons and Rubik Font
// FIXED: Proper fontFamily usage throughout

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../constants/theme';
import { Icon } from '../ui/Icon';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { RatingBadge } from '../ui/StatusBadge';

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
  onPress?: () => void;
  featured?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  id,
  name,
  brand,
  dailyRate,
  image,
  available,
  rating,
  onPress,
  featured = false,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      (navigation as any).navigate('EquipmentDetail', { id });
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <ImageWithFallback
          source={image}
          style={styles.image}
          fallbackIcon="camera"
          fallbackIconSize={32}
          borderRadius={0}
        />
        
        {/* Unavailable Badge */}
        {!available && (
          <View style={styles.unavailableBadge}>
            <Icon name="x" size={10} color={COLORS.white} />
            <Text style={styles.unavailableText}>Unavailable</Text>
          </View>
        )}

        {/* Featured Badge */}
        {featured && available && (
          <View style={styles.featuredBadge}>
            <Icon name="star" size={10} color={COLORS.white} />
            <Text style={styles.featuredText}>Featured</Text>
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
          <RatingBadge 
            rating={rating || 0} 
            showCount={false}
            size="small"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Horizontal Equipment Card (for lists)
interface EquipmentCardHorizontalProps extends EquipmentCardProps {
  days?: number;
  onRemove?: () => void;
}

export const EquipmentCardHorizontal: React.FC<EquipmentCardHorizontalProps> = ({
  id,
  name,
  brand,
  dailyRate,
  image,
  available,
  rating,
  days,
  onPress,
  onRemove,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      (navigation as any).navigate('EquipmentDetail', { id });
    }
  };

  return (
    <TouchableOpacity
      style={styles.horizontalContainer}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <ImageWithFallback
        source={image}
        style={styles.horizontalImage}
        fallbackIcon="camera"
        fallbackIconSize={24}
        borderRadius={SIZES.radius}
      />

      <View style={styles.horizontalDetails}>
        <Text style={styles.horizontalName} numberOfLines={2}>{name}</Text>
        {brand && <Text style={styles.horizontalBrand}>{brand}</Text>}
        <View style={styles.horizontalFooter}>
          <Text style={styles.horizontalPrice}>${dailyRate}/day</Text>
          {days && <Text style={styles.daysText}>× {days} days</Text>}
        </View>
      </View>

      {onRemove && (
        <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
          <Icon name="trash-2" size={18} color={COLORS.error} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: COLORS.backgroundDark,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  unavailableBadge: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: COLORS.error,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unavailableText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    fontSize: SIZES.tiny,
  },
  featuredBadge: {
    position: 'absolute',
    top: SIZES.sm,
    right: SIZES.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    fontSize: SIZES.tiny,
  },
  details: {
    padding: SIZES.sm,
  },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.bodySmall,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    minHeight: 36,
  },
  brand: {
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.bold,
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
  },
  // Horizontal styles
  horizontalContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLarge,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.card,
  },
  horizontalImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.backgroundDark,
  },
  horizontalDetails: {
    flex: 1,
    marginLeft: SIZES.md,
    justifyContent: 'center',
  },
  horizontalName: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.body,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  horizontalBrand: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  horizontalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  horizontalPrice: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
  },
  daysText: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EquipmentCard;
