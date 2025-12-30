// src/components/ui/Button.tsx
// Professional Button component with San Francisco font

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, SIZES, SHADOWS, FONT_WEIGHTS } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
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
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...(variant !== 'ghost' && SHADOWS.small),
    };

    // Variant styles
    if (variant === 'primary') {
      baseStyle.backgroundColor = COLORS.primary;
    } else if (variant === 'secondary') {
      baseStyle.backgroundColor = COLORS.secondary;
    } else if (variant === 'outline') {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 2;
      baseStyle.borderColor = COLORS.primary;
    } else if (variant === 'ghost') {
      baseStyle.backgroundColor = 'transparent';
    }

    // Size styles
    if (size === 'small') {
      baseStyle.height = SIZES.buttonHeightSmall;
      baseStyle.paddingHorizontal = SIZES.md;
    } else if (size === 'large') {
      baseStyle.height = SIZES.buttonHeightLarge;
      baseStyle.paddingHorizontal = SIZES.xl;
    }

    // Full width
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Disabled style
    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.text,
    };

    if (variant === 'outline' || variant === 'ghost') {
      baseTextStyle.color = COLORS.primary;
    }

    if (size === 'small') {
      baseTextStyle.fontSize = SIZES.bodySmall;
    } else if (size === 'large') {
      baseTextStyle.fontSize = SIZES.h4;
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  text: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: FONT_WEIGHTS.semiBold,
    letterSpacing: 0.3,
  },
});
