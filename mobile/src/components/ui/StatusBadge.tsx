// src/components/ui/StatusBadge.tsx
// Professional status badge component with icons and Rubik font
// FIXED: Proper fontFamily usage

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Icon, IconName } from './Icon';

type StatusType = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'available' | 'unavailable' | 'featured' | 'new';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showLabel?: boolean;
  style?: any;
}

// Extended status configuration
const STATUS_STYLES: Record<StatusType, { 
  icon: IconName; 
  color: string; 
  bgColor: string; 
  label: string 
}> = {
  confirmed: {
    icon: 'check-circle',
    color: COLORS.success,
    bgColor: COLORS.successLight,
    label: 'Confirmed',
  },
  pending: {
    icon: 'clock',
    color: COLORS.warning,
    bgColor: COLORS.warningLight,
    label: 'Pending',
  },
  cancelled: {
    icon: 'x-circle',
    color: COLORS.error,
    bgColor: COLORS.errorLight,
    label: 'Cancelled',
  },
  completed: {
    icon: 'check',
    color: COLORS.textSecondary,
    bgColor: COLORS.backgroundDark,
    label: 'Completed',
  },
  available: {
    icon: 'check',
    color: COLORS.success,
    bgColor: COLORS.successLight,
    label: 'Available',
  },
  unavailable: {
    icon: 'x',
    color: COLORS.error,
    bgColor: COLORS.errorLight,
    label: 'Unavailable',
  },
  featured: {
    icon: 'star',
    color: COLORS.accent,
    bgColor: 'rgba(255, 184, 0, 0.15)',
    label: 'Featured',
  },
  new: {
    icon: 'zap',
    color: COLORS.info,
    bgColor: COLORS.infoLight,
    label: 'New',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  showIcon = true,
  showLabel = true,
  style,
}) => {
  const config = STATUS_STYLES[status];
  
  if (!config) return null;

  const sizeStyles = {
    small: {
      paddingHorizontal: SIZES.sm,
      paddingVertical: 2,
      iconSize: 10,
      fontSize: SIZES.tiny,
      gap: 3,
    },
    medium: {
      paddingHorizontal: SIZES.sm + 2,
      paddingVertical: 4,
      iconSize: 12,
      fontSize: SIZES.caption,
      gap: 4,
    },
    large: {
      paddingHorizontal: SIZES.md,
      paddingVertical: 6,
      iconSize: 14,
      fontSize: SIZES.bodySmall,
      gap: 6,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          gap: currentSize.gap,
        },
        style,
      ]}
    >
      {showIcon && (
        <Icon
          name={config.icon}
          size={currentSize.iconSize}
          color={config.color}
        />
      )}
      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: config.color,
              fontSize: currentSize.fontSize,
            },
          ]}
        >
          {config.label}
        </Text>
      )}
    </View>
  );
};

// Dot indicator (minimal status)
interface StatusDotProps {
  status: StatusType;
  size?: number;
  pulse?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 8,
  pulse = false,
}) => {
  const config = STATUS_STYLES[status];
  
  if (!config) return null;

  return (
    <View style={styles.dotContainer}>
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: config.color,
          },
        ]}
      />
      {pulse && (
        <View
          style={[
            styles.pulse,
            {
              width: size + 8,
              height: size + 8,
              borderRadius: (size + 8) / 2,
              backgroundColor: config.color,
            },
          ]}
        />
      )}
    </View>
  );
};

// Availability Badge (special case)
interface AvailabilityBadgeProps {
  available: boolean;
  quantity?: number;
  size?: 'small' | 'medium' | 'large';
}

export const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  available,
  quantity,
  size = 'medium',
}) => {
  const status = available ? 'available' : 'unavailable';
  const config = STATUS_STYLES[status];

  const sizeStyles = {
    small: { fontSize: SIZES.tiny, padding: 4, iconSize: 10 },
    medium: { fontSize: SIZES.caption, padding: 6, iconSize: 12 },
    large: { fontSize: SIZES.bodySmall, padding: 8, iconSize: 14 },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        styles.availabilityBadge,
        {
          backgroundColor: config.bgColor,
          paddingHorizontal: currentSize.padding * 1.5,
          paddingVertical: currentSize.padding,
        },
      ]}
    >
      <Icon
        name={config.icon}
        size={currentSize.iconSize}
        color={config.color}
      />
      <Text
        style={[
          styles.availabilityText,
          {
            color: config.color,
            fontSize: currentSize.fontSize,
          },
        ]}
      >
        {available
          ? quantity !== undefined
            ? `${quantity} Available`
            : 'Available'
          : 'Unavailable'}
      </Text>
    </View>
  );
};

// Rating Badge
interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  reviewCount,
  size = 'medium',
  showCount = true,
}) => {
  const sizeStyles = {
    small: { fontSize: SIZES.tiny, iconSize: 10, gap: 2 },
    medium: { fontSize: SIZES.caption, iconSize: 12, gap: 4 },
    large: { fontSize: SIZES.bodySmall, iconSize: 14, gap: 4 },
  };

  const currentSize = sizeStyles[size];

  if (rating <= 0) {
    return (
      <View style={[styles.ratingBadge, { gap: currentSize.gap }]}>
        <Icon name="star" size={currentSize.iconSize} color={COLORS.textLight} />
        <Text style={[styles.ratingText, { fontSize: currentSize.fontSize, color: COLORS.textLight }]}>
          No reviews
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.ratingBadge, { gap: currentSize.gap }]}>
      <Icon name="star" size={currentSize.iconSize} color={COLORS.accent} />
      <Text style={[styles.ratingText, { fontSize: currentSize.fontSize }]}>
        {rating.toFixed(1)}
      </Text>
      {showCount && reviewCount !== undefined && (
        <Text style={[styles.reviewCount, { fontSize: currentSize.fontSize }]}>
          ({reviewCount})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radiusPill,
  },
  label: {
    fontFamily: FONTS.semiBold,
  },
  dotContainer: {
    position: 'relative',
  },
  dot: {
    zIndex: 2,
  },
  pulse: {
    position: 'absolute',
    top: -4,
    left: -4,
    opacity: 0.3,
    zIndex: 1,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radiusPill,
    gap: 4,
  },
  availabilityText: {
    fontFamily: FONTS.semiBold,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  reviewCount: {
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});

export default StatusBadge;
