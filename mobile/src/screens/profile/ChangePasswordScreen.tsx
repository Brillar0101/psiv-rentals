// src/screens/profile/ChangePasswordScreen.tsx
// Change Password Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    if (formData.newPassword.length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirmation do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await api.put('/auth/change-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });
      if (response.data.success) {
        Alert.alert('Success', 'Your password has been changed successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.securityIcon}>
              <Text style={styles.securityIconText}>🔒</Text>
            </View>
            <Text style={styles.securityTitle}>Update Your Password</Text>
            <Text style={styles.securitySubtitle}>Choose a strong password to keep your account secure</Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.input} value={formData.currentPassword} onChangeText={(text) => setFormData({ ...formData, currentPassword: text })} placeholder="Enter current password" placeholderTextColor={COLORS.textLight} secureTextEntry={!showCurrentPassword} autoCapitalize="none" />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Text style={styles.eyeIconText}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.input} value={formData.newPassword} onChangeText={(text) => setFormData({ ...formData, newPassword: text })} placeholder="Enter new password" placeholderTextColor={COLORS.textLight} secureTextEntry={!showNewPassword} autoCapitalize="none" />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Text style={styles.eyeIconText}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Must be at least 6 characters</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.input} value={formData.confirmPassword} onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })} placeholder="Confirm new password" placeholderTextColor={COLORS.textLight} secureTextEntry={!showConfirmPassword} autoCapitalize="none" />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Password Tips:</Text>
            <View style={styles.tipRow}><Text style={styles.tipIcon}>✓</Text><Text style={styles.tipText}>Use at least 8 characters</Text></View>
            <View style={styles.tipRow}><Text style={styles.tipIcon}>✓</Text><Text style={styles.tipText}>Mix uppercase and lowercase letters</Text></View>
            <View style={styles.tipRow}><Text style={styles.tipIcon}>✓</Text><Text style={styles.tipText}>Include numbers and symbols</Text></View>
            <View style={styles.tipRow}><Text style={styles.tipIcon}>✓</Text><Text style={styles.tipText}>Avoid common words or patterns</Text></View>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={loading ? 'Updating...' : 'Update Password'} onPress={handleChangePassword} disabled={loading} fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white, ...SHADOWS.small },
  backIcon: { fontSize: 28, color: COLORS.text },
  headerTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  content: { padding: SIZES.paddingHorizontal },
  iconContainer: { alignItems: 'center', marginVertical: SIZES.xl },
  securityIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryAlpha, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  securityIconText: { fontSize: 40 },
  securityTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  securitySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SIZES.lg },
  form: { marginTop: SIZES.lg },
  inputGroup: { marginBottom: SIZES.lg },
  label: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.sm },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  input: { flex: 1, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, fontSize: SIZES.body, color: COLORS.text },
  eyeIcon: { paddingHorizontal: SIZES.md },
  eyeIconText: { fontSize: 20 },
  hint: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: SIZES.xs },
  tipsCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginTop: SIZES.lg, ...SHADOWS.card },
  tipsTitle: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  tipIcon: { fontSize: 16, color: COLORS.success, marginRight: SIZES.sm, width: 20 },
  tipText: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary, flex: 1 },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
