// src/constants/theme.ts
// Professional Design System - Rubik Font + Orange Theme

import { Platform, TextStyle } from 'react-native';

export const COLORS = {
  // Primary - Orange theme (Professional PSIV brand)
  primary: '#FF6B35',
  primaryLight: '#FF8C61',
  primaryDark: '#E85A2A',
  primaryAlpha: 'rgba(255, 107, 53, 0.1)',
  primaryAlpha20: 'rgba(255, 107, 53, 0.2)',
  
  // Secondary
  secondary: '#2D3748',
  secondaryLight: '#4A5568',
  secondaryAlpha: 'rgba(45, 55, 72, 0.1)',
  
  // Accent
  accent: '#FFB800',
  accentLight: '#FFD666',
  accentAlpha: 'rgba(255, 184, 0, 0.1)',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  successAlpha: 'rgba(16, 185, 129, 0.1)',
  
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorAlpha: 'rgba(239, 68, 68, 0.1)',
  
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningAlpha: 'rgba(245, 158, 11, 0.1)',
  
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoAlpha: 'rgba(59, 130, 246, 0.1)',
  
  // Neutrals (Clean, modern palette)
  white: '#FFFFFF',
  black: '#000000',
  background: '#F9FAFB',
  backgroundDark: '#F3F4F6',
  surface: '#FFFFFF',
  
  // Text hierarchy
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textDisabled: '#D1D5DB',
  
  // Borders
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  borderLight: '#F3F4F6',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  
  // Skeleton loading
  skeleton: '#E5E7EB',
  skeletonHighlight: '#F3F4F6',
};

// Rubik font family - These match the loaded font names from @expo-google-fonts/rubik
export const FONTS = {
  regular: 'Rubik_400Regular',
  medium: 'Rubik_500Medium',
  semiBold: 'Rubik_600SemiBold',
  bold: 'Rubik_700Bold',
};

// Keep for backwards compatibility
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Typography presets - USE THESE for consistent text styling
export const TYPOGRAPHY = {
  h1: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.text,
  } as TextStyle,
  h2: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text,
  } as TextStyle,
  h3: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: COLORS.text,
  } as TextStyle,
  h4: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: COLORS.text,
  } as TextStyle,
  body: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text,
  } as TextStyle,
  bodyMedium: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.text,
  } as TextStyle,
  bodySemiBold: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.text,
  } as TextStyle,
  bodySmall: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.textSecondary,
  } as TextStyle,
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textSecondary,
  } as TextStyle,
  captionMedium: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textSecondary,
  } as TextStyle,
  button: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    color: COLORS.white,
  } as TextStyle,
  buttonSmall: {
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    color: COLORS.white,
  } as TextStyle,
};

export const SIZES = {
  // Spacing (8px grid system)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Padding (commonly used values)
  padding: 16,
  paddingHorizontal: 20,
  paddingVertical: 16,
  
  // Font sizes (Type scale)
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,
  
  // Icon sizes
  iconTiny: 12,
  iconSmall: 16,
  iconMedium: 20,
  icon: 24,
  iconLarge: 32,
  iconXL: 48,
  iconXXL: 64,
  
  // Border radius (modern, consistent)
  radiusSmall: 8,
  radius: 12,
  radiusLarge: 16,
  radiusXL: 24,
  radiusPill: 999,
  
  // Component sizes
  buttonHeight: 56,
  buttonHeightSmall: 40,
  buttonHeightLarge: 64,
  inputHeight: 56,
  cardHeight: 240,
  tabBarHeight: 80,
  headerHeight: 60,
  avatarSize: 40,
  avatarSizeLarge: 80,
  avatarSizeSmall: 32,
  
  // Screen dimensions
  screenPadding: 20,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const ANIMATIONS = {
  fast: 150,
  medium: 300,
  slow: 500,
  verySlow: 1000,
};

// Status configurations
export const STATUS_CONFIG = {
  confirmed: {
    color: COLORS.success,
    bgColor: COLORS.successLight,
    icon: 'check-circle',
    label: 'Confirmed',
  },
  pending: {
    color: COLORS.warning,
    bgColor: COLORS.warningLight,
    icon: 'clock',
    label: 'Pending',
  },
  cancelled: {
    color: COLORS.error,
    bgColor: COLORS.errorLight,
    icon: 'x-circle',
    label: 'Cancelled',
  },
  completed: {
    color: COLORS.textSecondary,
    bgColor: COLORS.backgroundDark,
    icon: 'check',
    label: 'Completed',
  },
};

export const LAYOUT = {
  window: {
    width: 0,
    height: 0,
  },
  isSmallDevice: false,
};
