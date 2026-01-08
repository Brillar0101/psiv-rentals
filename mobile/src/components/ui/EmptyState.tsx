// src/components/ui/EmptyState.tsx
// Professional empty state component with icons and Rubik font
// FIXED: Proper fontFamily usage

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Icon, IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  subtitle,
  actionLabel,
  onAction,
  compact = false,
}) => {
  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Icon Container */}
      <View style={[styles.iconContainer, compact && styles.iconContainerCompact]}>
        <Icon
          name={icon}
          size={compact ? 32 : 48}
          color={COLORS.textLight}
        />
      </View>

      {/* Title */}
      <Text style={[styles.title, compact && styles.titleCompact]}>
        {title}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
          {subtitle}
        </Text>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Preset empty states for common use cases
export const EmptyCart: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon="shopping-cart"
    title="Your cart is empty"
    subtitle="Add equipment to get started"
    actionLabel={onBrowse ? "Browse Equipment" : undefined}
    onAction={onBrowse}
  />
);

export const EmptyBookings: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon="calendar"
    title="No bookings yet"
    subtitle="Your rental history will appear here"
    actionLabel={onBrowse ? "Browse Equipment" : undefined}
    onAction={onBrowse}
  />
);

export const EmptyFavorites: React.FC<{ onBrowse?: () => void }> = ({ onBrowse }) => (
  <EmptyState
    icon="heart"
    title="No favorites yet"
    subtitle="Save equipment you love for quick access"
    actionLabel={onBrowse ? "Explore Equipment" : undefined}
    onAction={onBrowse}
  />
);

export const EmptySearch: React.FC<{ query?: string }> = ({ query }) => (
  <EmptyState
    icon="search"
    title="No results found"
    subtitle={query ? `No equipment matches "${query}"` : "Try a different search term"}
  />
);

export const EmptyCategory: React.FC<{ categoryName?: string }> = ({ categoryName }) => (
  <EmptyState
    icon="package"
    title="No Equipment"
    subtitle={categoryName 
      ? `No equipment available in ${categoryName}` 
      : "No equipment available in this category"
    }
  />
);

export const EmptyReviews: React.FC<{ onAddReview?: () => void }> = ({ onAddReview }) => (
  <EmptyState
    icon="star"
    title="No reviews yet"
    subtitle="Be the first to review this product!"
    actionLabel={onAddReview ? "Write a Review" : undefined}
    onAction={onAddReview}
  />
);

export const EmptyNotifications: React.FC = () => (
  <EmptyState
    icon="bell"
    title="No notifications"
    subtitle="You're all caught up!"
  />
);

export const EmptyMessages: React.FC = () => (
  <EmptyState
    icon="message-circle"
    title="No messages"
    subtitle="Start a conversation with support"
  />
);

export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon="wifi-off"
    title="Connection Error"
    subtitle="Please check your internet connection"
    actionLabel={onRetry ? "Try Again" : undefined}
    onAction={onRetry}
  />
);

export const GenericError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon="alert-circle"
    title="Something went wrong"
    subtitle="Please try again later"
    actionLabel={onRetry ? "Retry" : undefined}
    onAction={onRetry}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xxl,
    minHeight: 300,
  },
  containerCompact: {
    minHeight: 200,
    padding: SIZES.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  iconContainerCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: SIZES.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  titleCompact: {
    fontSize: SIZES.h4,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  subtitleCompact: {
    fontSize: SIZES.bodySmall,
    maxWidth: 240,
  },
  actionButton: {
    marginTop: SIZES.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusPill,
  },
  actionText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.body,
    color: COLORS.white,
  },
});

export default EmptyState;
