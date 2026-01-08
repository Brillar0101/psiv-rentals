// src/components/ui/AlertModal.tsx
// Custom styled alert modal to replace native Alert.alert()
// Matches the app's UI design with Rubik font

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Icon, IconName } from './Icon';

// Types
type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  type?: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  icon?: IconName;
}

interface AlertContextType {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}

// Alert type configurations
const ALERT_CONFIG: Record<AlertType, { icon: IconName; color: string; bgColor: string }> = {
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
  confirm: {
    icon: 'help-circle',
    color: COLORS.primary,
    bgColor: COLORS.primaryAlpha,
  },
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Alert Modal Component
const AlertModalContent: React.FC<{
  visible: boolean;
  config: AlertConfig | null;
  onHide: () => void;
}> = ({ visible, config, onHide }) => {
  if (!config) return null;

  const alertType = config.type || 'info';
  const { icon: defaultIcon, color, bgColor } = ALERT_CONFIG[alertType];
  const displayIcon = config.icon || defaultIcon;

  const buttons = config.buttons || [{ text: 'OK', style: 'default' }];

  const handleButtonPress = (button: AlertButton) => {
    onHide();
    // Small delay to let modal close animation start
    setTimeout(() => {
      button.onPress?.();
    }, 100);
  };

  const getButtonStyle = (button: AlertButton, index: number) => {
    const isLast = index === buttons.length - 1;
    const baseStyle = [styles.button];

    if (button.style === 'destructive') {
      baseStyle.push(styles.destructiveButton);
    } else if (button.style === 'cancel') {
      baseStyle.push(styles.cancelButton);
    } else if (isLast && buttons.length > 1) {
      baseStyle.push(styles.primaryButton);
    } else {
      baseStyle.push(styles.defaultButton);
    }

    return baseStyle;
  };

  const getButtonTextStyle = (button: AlertButton, index: number) => {
    const isLast = index === buttons.length - 1;

    if (button.style === 'destructive') {
      return [styles.buttonText, styles.destructiveButtonText];
    } else if (button.style === 'cancel') {
      return [styles.buttonText, styles.cancelButtonText];
    } else if (isLast && buttons.length > 1) {
      return [styles.buttonText, styles.primaryButtonText];
    }
    return [styles.buttonText, styles.defaultButtonText];
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onHide}
    >
      <TouchableWithoutFeedback onPress={onHide}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                <Icon name={displayIcon} size={32} color={color} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{config.title}</Text>

              {/* Message */}
              <Text style={styles.message}>{config.message}</Text>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={getButtonStyle(button, index)}
                    onPress={() => handleButtonPress(button)}
                    activeOpacity={0.8}
                  >
                    <Text style={getButtonTextStyle(button, index)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Alert Provider
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  const showAlert = useCallback((newConfig: AlertConfig) => {
    setConfig(newConfig);
    setVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setVisible(false);
    setTimeout(() => setConfig(null), 300);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertModalContent visible={visible} config={config} onHide={hideAlert} />
    </AlertContext.Provider>
  );
};

// Custom hook to use alert
export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Convenience functions to create alert configs
export const alert = {
  success: (title: string, message: string, buttons?: AlertButton[]): AlertConfig => ({
    type: 'success',
    title,
    message,
    buttons,
  }),
  error: (title: string, message: string, buttons?: AlertButton[]): AlertConfig => ({
    type: 'error',
    title,
    message,
    buttons,
  }),
  warning: (title: string, message: string, buttons?: AlertButton[]): AlertConfig => ({
    type: 'warning',
    title,
    message,
    buttons,
  }),
  info: (title: string, message: string, buttons?: AlertButton[]): AlertConfig => ({
    type: 'info',
    title,
    message,
    buttons,
  }),
  confirm: (title: string, message: string, buttons?: AlertButton[]): AlertConfig => ({
    type: 'confirm',
    title,
    message,
    buttons,
  }),
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.paddingHorizontal,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXL,
    padding: SIZES.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: SIZES.sm,
  },
  button: {
    flex: 1,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  defaultButton: {
    backgroundColor: COLORS.background,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.body,
  },
  primaryButtonText: {
    color: COLORS.white,
  },
  defaultButtonText: {
    color: COLORS.text,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
  },
  destructiveButtonText: {
    color: COLORS.white,
  },
});

export default AlertModalContent;
