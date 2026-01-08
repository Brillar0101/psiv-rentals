// src/components/ui/Toast.tsx
// Professional Toast notification system with Rubik font
// FIXED: Proper fontFamily usage

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Icon, IconName } from './Icon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastConfig {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast configuration by type
const TOAST_CONFIG: Record<ToastType, { icon: IconName; color: string; bgColor: string }> = {
  success: {
    icon: 'check-circle',
    color: COLORS.success,
    bgColor: COLORS.successLight,
  },
  error: {
    icon: 'x-circle',
    color: COLORS.error,
    bgColor: COLORS.errorLight,
  },
  warning: {
    icon: 'alert-triangle',
    color: COLORS.warning,
    bgColor: COLORS.warningLight,
  },
  info: {
    icon: 'info',
    color: COLORS.info,
    bgColor: COLORS.infoLight,
  },
};

// Toast Component
const Toast: React.FC<{
  visible: boolean;
  config: ToastConfig | null;
  onHide: () => void;
}> = ({ visible, config, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible && config) {
      // Show animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, config.duration || 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, config]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!config) return null;

  const { icon, color, bgColor } = TOAST_CONFIG[config.type];

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: insets.top + 10,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, { backgroundColor: COLORS.white }]}
        activeOpacity={0.95}
        onPress={hideToast}
      >
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Icon name={icon} size={20} color={color} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {config.title && (
            <Text style={[styles.title, { color }]}>{config.title}</Text>
          )}
          <Text style={styles.message} numberOfLines={2}>
            {config.message}
          </Text>
        </View>

        {/* Action Button */}
        {config.action && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              config.action?.onPress();
              hideToast();
            }}
          >
            <Text style={[styles.actionText, { color }]}>
              {config.action.label}
            </Text>
          </TouchableOpacity>
        )}

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={hideToast}>
          <Icon name="x" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig | null>(null);

  const showToast = useCallback((newConfig: ToastConfig) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
    // Clear config after animation
    setTimeout(() => setConfig(null), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast visible={visible} config={config} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Convenience functions
export const toast = {
  success: (message: string, title?: string) => ({
    type: 'success' as ToastType,
    message,
    title: title || 'Success',
  }),
  error: (message: string, title?: string) => ({
    type: 'error' as ToastType,
    message,
    title: title || 'Error',
  }),
  warning: (message: string, title?: string) => ({
    type: 'warning' as ToastType,
    message,
    title: title || 'Warning',
  }),
  info: (message: string, title?: string) => ({
    type: 'info' as ToastType,
    message,
    title: title || 'Info',
  }),
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: SIZES.paddingHorizontal,
    right: SIZES.paddingHorizontal,
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: SIZES.radiusLarge,
    ...SHADOWS.large,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.bodySmall,
    marginBottom: 2,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  actionText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.bodySmall,
  },
  closeButton: {
    padding: SIZES.xs,
    marginLeft: SIZES.xs,
  },
});

export default Toast;
