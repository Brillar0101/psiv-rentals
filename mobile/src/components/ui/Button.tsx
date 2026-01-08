// src/components/ui/Button.tsx
// Professional Button component with Rubik font and icon support
// FIXED: Proper fontFamily usage

import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
  View,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONTS } from '../../constants/theme';
import { Icon, IconName } from './Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: IconName;
  rightIcon?: IconName;
  iconSize?: number;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  iconSize,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // Variant styles
  const variantStyles: Record<string, { bg: string; text: string; border?: string }> = {
    primary: {
      bg: COLORS.primary,
      text: COLORS.white,
    },
    secondary: {
      bg: COLORS.secondary,
      text: COLORS.white,
    },
    outline: {
      bg: 'transparent',
      text: COLORS.primary,
      border: COLORS.primary,
    },
    ghost: {
      bg: 'transparent',
      text: COLORS.primary,
    },
    danger: {
      bg: COLORS.error,
      text: COLORS.white,
    },
    success: {
      bg: COLORS.success,
      text: COLORS.white,
    },
  };

  // Size styles
  const sizeStyles: Record<string, { height: number; px: number; fontSize: number; iconSize: number }> = {
    small: {
      height: SIZES.buttonHeightSmall,
      px: SIZES.md,
      fontSize: SIZES.bodySmall,
      iconSize: 16,
    },
    medium: {
      height: SIZES.buttonHeight,
      px: SIZES.lg,
      fontSize: SIZES.body,
      iconSize: 20,
    },
    large: {
      height: SIZES.buttonHeightLarge,
      px: SIZES.xl,
      fontSize: SIZES.h4,
      iconSize: 24,
    },
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];
  const currentIconSize = iconSize || currentSize.iconSize;

  const buttonStyle: ViewStyle = {
    height: currentSize.height,
    paddingHorizontal: currentSize.px,
    backgroundColor: currentVariant.bg,
    borderWidth: currentVariant.border ? 2 : 0,
    borderColor: currentVariant.border,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const textColor = currentVariant.text;

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          buttonStyle,
          variant === 'primary' && !disabled && SHADOWS.button,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <View style={styles.content}>
            {leftIcon && (
              <Icon
                name={leftIcon}
                size={currentIconSize}
                color={textColor}
                style={styles.leftIcon}
              />
            )}
            <Text
              style={[
                styles.text,
                { fontSize: currentSize.fontSize, color: textColor },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {rightIcon && (
              <Icon
                name={rightIcon}
                size={currentIconSize}
                color={textColor}
                style={styles.rightIcon}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Icon-only Button
interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  color = COLORS.text,
  backgroundColor = COLORS.white,
  disabled = false,
  style,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor,
            opacity: disabled ? 0.5 : 1,
          },
          SHADOWS.small,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Icon name={icon} size={size * 0.5} color={color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

// Floating Action Button
interface FABProps {
  icon?: IconName;
  onPress: () => void;
  position?: 'bottomRight' | 'bottomLeft' | 'bottomCenter';
  extended?: boolean;
  label?: string;
}

export const FAB: React.FC<FABProps> = ({
  icon = 'plus',
  onPress,
  position = 'bottomRight',
  extended = false,
  label,
}) => {
  const positionStyles: Record<string, ViewStyle> = {
    bottomRight: { right: SIZES.paddingHorizontal, bottom: SIZES.tabBarHeight + SIZES.md },
    bottomLeft: { left: SIZES.paddingHorizontal, bottom: SIZES.tabBarHeight + SIZES.md },
    bottomCenter: { alignSelf: 'center', bottom: SIZES.tabBarHeight + SIZES.md },
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        positionStyles[position],
        extended && styles.fabExtended,
        SHADOWS.large,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon name={icon} size={24} color={COLORS.white} />
      {extended && label && (
        <Text style={styles.fabLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.semiBold,
    letterSpacing: 0.3,
  },
  leftIcon: {
    marginRight: SIZES.sm,
  },
  rightIcon: {
    marginLeft: SIZES.sm,
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fabExtended: {
    width: 'auto',
    paddingHorizontal: SIZES.lg,
  },
  fabLabel: {
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    fontSize: SIZES.body,
    marginLeft: SIZES.sm,
  },
});

export default Button;
