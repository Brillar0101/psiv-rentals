// src/components/ui/Input.tsx
// Professional Input component with Rubik font and icon support
// UPDATED: Feather icons, better focus states, improved accessibility

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Icon, IconName } from './Icon';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  disabled?: boolean;
  required?: boolean;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  required = false,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderColor, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderColor, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const animatedBorderColor = borderColor.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.primary],
  });

  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return COLORS.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? COLORS.error : animatedBorderColor,
            borderWidth: isFocused || error ? 2 : 1,
          },
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIcon}>
            <Icon
              name={leftIcon}
              size={20}
              color={isFocused ? COLORS.primary : COLORS.textSecondary}
            />
          </View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            disabled && styles.inputDisabled,
            style,
          ]}
          placeholderTextColor={COLORS.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            <Icon
              name={rightIcon}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Error or Hint */}
      {error ? (
        <View style={styles.errorRow}>
          <Icon name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
};

// Search Input variant
interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onClear,
  ...props
}) => {
  return (
    <Input
      leftIcon="search"
      rightIcon={value && value.length > 0 ? 'x' : undefined}
      onRightIconPress={onClear}
      placeholder="Search..."
      returnKeyType="search"
      autoCapitalize="none"
      autoCorrect={false}
      value={value}
      {...props}
    />
  );
};

// Password Input variant
interface PasswordInputProps extends Omit<InputProps, 'rightIcon' | 'secureTextEntry'> {}

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      secureTextEntry={!showPassword}
      rightIcon={showPassword ? 'eye-off' : 'eye'}
      onRightIconPress={() => setShowPassword(!showPassword)}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
};

// TextArea variant
interface TextAreaProps extends InputProps {
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  rows = 4,
  maxLength,
  showCount = true,
  value,
  ...props
}) => {
  const minHeight = rows * 24 + SIZES.md * 2;

  return (
    <View>
      <Input
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        maxLength={maxLength}
        value={value}
        style={{
          minHeight,
          paddingTop: SIZES.md,
        }}
        {...props}
      />
      {showCount && maxLength && (
        <Text style={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

// Form Field with label and input combined
interface FormFieldProps extends InputProps {
  labelStyle?: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  labelStyle,
  ...props
}) => {
  return (
    <View style={styles.formField}>
      {label && (
        <Text style={[styles.formLabel, labelStyle]}>{label}</Text>
      )}
      <Input {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  label: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
    fontFamily: FONTS.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: SIZES.inputHeight,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.md,
    ...SHADOWS.small,
  },
  inputContainerDisabled: {
    backgroundColor: COLORS.backgroundDark,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    paddingVertical: SIZES.md,
  },
  inputWithLeftIcon: {
    paddingLeft: SIZES.xs,
  },
  inputWithRightIcon: {
    paddingRight: SIZES.xs,
  },
  inputDisabled: {
    color: COLORS.textSecondary,
  },
  leftIcon: {
    marginRight: SIZES.sm,
  },
  rightIcon: {
    marginLeft: SIZES.sm,
    padding: SIZES.xs,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.xs,
    gap: 4,
  },
  error: {
    fontSize: SIZES.caption,
    color: COLORS.error,
    fontFamily: FONTS.medium,
  },
  hint: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  charCount: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SIZES.xs,
  },
  formField: {
    marginBottom: SIZES.lg,
  },
  formLabel: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
});

export default Input;
