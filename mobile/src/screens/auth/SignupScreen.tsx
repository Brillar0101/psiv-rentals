// src/screens/auth/SignupScreen.tsx
// Signup Screen - User registration with Terms & Conditions

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Icon } from '../../components/ui/Icon';
import { authAPI } from '../../services/api';

// Checkbox component
interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: React.ReactNode;
  error?: string;
}

const Checkbox = ({ checked, onPress, label, error }: CheckboxProps) => (
  <View style={styles.checkboxContainer}>
    <TouchableOpacity
      style={[
        styles.checkbox,
        checked && styles.checkboxChecked,
        error && styles.checkboxError,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {checked && <Icon name="check" size={14} color={COLORS.white} />}
    </TouchableOpacity>
    <View style={styles.checkboxLabelContainer}>{label}</View>
  </View>
);

// Terms & Conditions content
const TERMS_CONTENT = `
PSIV Rentals - Terms & Conditions

Last Updated: January 2026

1. ACCEPTANCE OF TERMS
By creating an account and using the PSIV Rentals mobile application, you agree to be bound by these Terms & Conditions.

2. RENTAL AGREEMENT
- All equipment rentals are subject to availability
- Rental periods are calculated on a daily basis
- Equipment must be returned in the same condition as received
- Late returns may incur additional charges

3. DAMAGE & LOSS
- You are responsible for all equipment during your rental period
- A damage deposit is required for all rentals
- Lost or stolen equipment must be reported immediately
- You may be charged the full replacement value for lost items

4. CANCELLATION POLICY
- Cancellations made 48+ hours before rental start: Full refund
- Cancellations made 24-48 hours before rental start: 50% refund
- Cancellations made less than 24 hours: No refund

5. PAYMENT
- All prices are in USD
- Payment is due at time of booking
- We accept major credit cards and digital payment methods

6. USER CONDUCT
- You must be 18 years or older to rent equipment
- Provide accurate and truthful information
- Do not share your account credentials
- Report any issues with equipment immediately

7. DATA COLLECTION & PRIVACY
- We collect and process your personal data as described in our Privacy Policy
- Search data may be used to improve our services (with your consent)
- Your data is stored securely and not sold to third parties
- You can request data deletion at any time

8. LIABILITY
- PSIV Rentals is not liable for any indirect or consequential damages
- Our liability is limited to the rental amount paid
- Equipment is provided "as is" for professional use

9. MODIFICATIONS
We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of modified terms.

10. CONTACT
For questions about these terms, contact us at:
Email: legal@psivrentals.com
Phone: (555) 123-4567

By checking "I agree to the Terms & Conditions", you acknowledge that you have read, understood, and agree to be bound by these terms.
`;

export default function SignupScreen() {
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataConsentAccepted, setDataConsentAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    let valid = true;
    const newErrors: any = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
      valid = false;
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
      valid = false;
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms & Conditions';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authAPI.signup({
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim() || undefined,
        terms_accepted: termsAccepted,
        data_collection_consent: dataConsentAccepted,
      });

      if (response.success) {
        Alert.alert(
          'Success!',
          'Account created successfully. Please login.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login' as never) }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Signup Failed',
        error.response?.data?.error || 'Failed to create account'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleTermsPress = () => {
    setShowTermsModal(true);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setErrors({ ...errors, terms: '' });
    setShowTermsModal(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to start renting equipment</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="First Name"
                placeholder="John"
                value={formData.first_name}
                onChangeText={(text) => updateField('first_name', text)}
                error={errors.first_name}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChangeText={(text) => updateField('last_name', text)}
                error={errors.last_name}
              />
            </View>
          </View>

          <Input
            label="Email"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone (Optional)"
            placeholder="+1 234 567 8900"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            keyboardType="phone-pad"
          />

          <Input
            label="Password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={<Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color={COLORS.textSecondary} />}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Input
            label="Confirm Password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            error={errors.confirmPassword}
            secureTextEntry={!showPassword}
          />

          {/* Terms & Conditions Section */}
          <View style={styles.termsSection}>
            <Checkbox
              checked={termsAccepted}
              onPress={() => {
                setTermsAccepted(!termsAccepted);
                setErrors({ ...errors, terms: '' });
              }}
              error={errors.terms}
              label={
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink} onPress={handleTermsPress}>
                    Terms & Conditions
                  </Text>
                  {' '}*
                </Text>
              }
            />
            {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

            <Checkbox
              checked={dataConsentAccepted}
              onPress={() => setDataConsentAccepted(!dataConsentAccepted)}
              label={
                <Text style={styles.termsText}>
                  I consent to the collection and use of my search data to improve services (optional)
                </Text>
              }
            />
            <Text style={styles.dataConsentNote}>
              This helps us understand what equipment our customers are looking for and improve our inventory.
            </Text>
          </View>

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            fullWidth
            style={styles.signupButton}
          />
        </View>

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms & Conditions</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Icon name="x" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.termsContent}>{TERMS_CONTENT}</Text>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title="Decline"
              variant="outline"
              onPress={() => setShowTermsModal(false)}
              style={styles.modalButton}
            />
            <Button
              title="Accept"
              onPress={handleAcceptTerms}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: SIZES.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: SIZES.h1,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: SIZES.lg,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  halfInput: {
    flex: 1,
  },

  // Terms Section
  termsSection: {
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxError: {
    borderColor: COLORS.error,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  termsLink: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.error,
    marginTop: -4,
    marginBottom: SIZES.sm,
    marginLeft: 30,
  },
  dataConsentNote: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    marginLeft: 30,
    marginTop: -4,
    marginBottom: SIZES.sm,
    lineHeight: 18,
  },

  signupButton: {
    marginTop: SIZES.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  footerText: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  modalCloseButton: {
    padding: SIZES.xs,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: SIZES.lg,
  },
  termsContent: {
    fontSize: SIZES.body,
    color: COLORS.text,
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SIZES.paddingHorizontal,
    paddingBottom: Platform.OS === 'ios' ? 34 : SIZES.lg,
    gap: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  modalButton: {
    flex: 1,
  },
});
