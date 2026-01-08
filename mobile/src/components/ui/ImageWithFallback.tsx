// src/components/ui/ImageWithFallback.tsx
// Professional image component with loading states, fallbacks, and error handling
// Replaces emoji placeholders with proper image handling

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import { Icon, IconName } from './Icon';

interface ImageWithFallbackProps {
  source: string | null | undefined;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  fallbackIcon?: IconName;
  fallbackIconSize?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  showLoader?: boolean;
  borderRadius?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  source,
  style,
  containerStyle,
  fallbackIcon = 'image',
  fallbackIconSize = 40,
  resizeMode = 'cover',
  showLoader = true,
  borderRadius = 0,
  onLoad,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const shimmerValue = useRef(new Animated.Value(0)).current;

  // Shimmer animation for loading state
  useEffect(() => {
    if (loading && showLoader) {
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
    }
  }, [loading, showLoader]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  const shimmerOpacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  // No source or error - show fallback
  if (!source || error) {
    return (
      <View
        style={[
          styles.fallbackContainer,
          { borderRadius },
          containerStyle,
          style,
        ]}
      >
        <Icon
          name={fallbackIcon}
          size={fallbackIconSize}
          color={COLORS.textLight}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderRadius }, containerStyle]}>
      {/* Loading skeleton */}
      {loading && showLoader && (
        <Animated.View
          style={[
            styles.skeleton,
            { borderRadius, opacity: shimmerOpacity },
            style,
          ]}
        />
      )}

      {/* Actual image */}
      <Image
        source={{ uri: source }}
        style={[
          styles.image,
          { borderRadius, opacity: loading ? 0 : 1 },
          style,
        ]}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
      />
    </View>
  );
};

// Equipment Image with specific defaults
interface EquipmentImageProps {
  source: string | null | undefined;
  size?: 'small' | 'medium' | 'large' | 'full';
  style?: ImageStyle;
}

export const EquipmentImage: React.FC<EquipmentImageProps> = ({
  source,
  size = 'medium',
  style,
}) => {
  const sizeStyles = {
    small: { width: 60, height: 60, iconSize: 24, radius: SIZES.radius },
    medium: { width: 120, height: 120, iconSize: 32, radius: SIZES.radiusLarge },
    large: { width: 200, height: 200, iconSize: 48, radius: SIZES.radiusLarge },
    full: { width: '100%' as any, height: 300, iconSize: 64, radius: 0 },
  };

  const currentSize = sizeStyles[size];

  return (
    <ImageWithFallback
      source={source}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        ...style,
      }}
      fallbackIcon="camera"
      fallbackIconSize={currentSize.iconSize}
      borderRadius={currentSize.radius}
    />
  );
};

// Avatar Image with specific defaults
interface AvatarImageProps {
  source?: string | null;
  size?: number;
  name?: string;
  variant?: 'primary' | 'light'; // 'primary' = primary bg + white text, 'light' = white bg + primary text
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  source,
  size = 48,
  name,
  variant = 'light', // Default to light for visibility on primary backgrounds
}) => {
  const [error, setError] = useState(false);

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const bgColor = variant === 'light' ? COLORS.white : COLORS.primary;
  const textColor = variant === 'light' ? COLORS.primary : COLORS.white;

  if (!source || error) {
    return (
      <View
        style={[
          styles.avatarFallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
          },
        ]}
      >
        {name ? (
          <Animated.Text
            style={[
              styles.avatarText,
              { fontSize: size * 0.4, color: textColor },
            ]}
          >
            {getInitials(name)}
          </Animated.Text>
        ) : (
          <Icon name="user" size={size * 0.5} color={textColor} />
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: source }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
      }}
      onError={() => setError(true)}
    />
  );
};

// Category Image/Icon
interface CategoryImageProps {
  icon?: string;
  categoryName: string;
  size?: number;
}

export const CategoryImage: React.FC<CategoryImageProps> = ({
  icon,
  categoryName,
  size = 70,
}) => {
  // Map category names to icons
  const getCategoryIcon = (name: string): IconName => {
    const normalized = name.toLowerCase();
    if (normalized.includes('camera')) return 'camera';
    if (normalized.includes('lens')) return 'aperture';
    if (normalized.includes('audio')) return 'headphones';
    if (normalized.includes('light')) return 'sun';
    if (normalized.includes('accessory')) return 'package';
    if (normalized.includes('drone')) return 'navigation';
    if (normalized.includes('tripod')) return 'maximize';
    if (normalized.includes('stabilizer')) return 'move';
    if (normalized.includes('monitor')) return 'monitor';
    if (normalized.includes('storage')) return 'hard-drive';
    return 'box';
  };

  return (
    <View
      style={[
        styles.categoryContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Icon
        name={getCategoryIcon(categoryName)}
        size={size * 0.45}
        color={COLORS.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundDark,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skeleton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.skeleton,
  },
  fallbackContainer: {
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallback: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  categoryContainer: {
    backgroundColor: COLORS.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageWithFallback;
