// src/constants/theme.ts
// Professional Design System - San Francisco Font + Orange Theme
// iOS: San Francisco, Android: Roboto (system defaults)

import { Platform } from 'react-native';

export const COLORS = {
  // Primary - Orange theme (Professional PSIV brand)
  primary: '#FF6B35',        // Vibrant orange
  primaryLight: '#FF8C61',   // Light orange
  primaryDark: '#E85A2A',    // Dark orange
  primaryAlpha: 'rgba(255, 107, 53, 0.1)', // 10% opacity
  
  // Secondary
  secondary: '#2D3748',      // Professional dark gray
  secondaryLight: '#4A5568', // Medium gray
  secondaryAlpha: 'rgba(45, 55, 72, 0.1)',
  
  // Accent
  accent: '#FFB800',         // Premium gold
  accentLight: '#FFD666',
  
  // Status colors
  success: '#10B981',        // Green
  successLight: '#D1FAE5',
  error: '#EF4444',          // Red
  errorLight: '#FEE2E2',
  warning: '#F59E0B',        // Amber
  warningLight: '#FEF3C7',
  info: '#3B82F6',           // Blue
  infoLight: '#DBEAFE',
  
  // Neutrals (Clean, modern palette)
  white: '#FFFFFF',
  black: '#000000',
  background: '#F9FAFB',     // Off-white
  backgroundDark: '#F3F4F6', // Light gray
  surface: '#FFFFFF',        // Card backgrounds
  
  // Text hierarchy
  text: '#1F2937',           // Almost black
  textSecondary: '#6B7280',  // Medium gray
  textLight: '#9CA3AF',      // Light gray
  textDisabled: '#D1D5DB',   // Very light gray
  
  // Borders
  border: '#E5E7EB',         // Light border
  borderDark: '#D1D5DB',     // Medium border
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
};

export const FONTS = {
  // San Francisco (iOS) / Roboto (Android)
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
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
  h1: 32,      // Page titles
  h2: 28,      // Section headers
  h3: 24,      // Card titles
  h4: 20,      // Subheadings
  body: 16,    // Body text
  bodySmall: 14, // Secondary text
  caption: 12,   // Labels, captions
  tiny: 10,      // Smallest text
  
  // Icon sizes
  iconSmall: 16,
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const ANIMATIONS = {
  fast: 200,
  medium: 300,
  slow: 500,
  verySlow: 1000,
};

export const LAYOUT = {
  window: {
    width: 0,  // Will be set at runtime
    height: 0, // Will be set at runtime
  },
  isSmallDevice: false, // Will be set at runtime
};
