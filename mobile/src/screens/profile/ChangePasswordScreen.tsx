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
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
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
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.securityIcon}>
              <Icon name="lock" size={40} color={COLORS.primary} />
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
                  <Icon name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.input} value={formData.newPassword} onChangeText={(text) => setFormData({ ...formData, newPassword: text })} placeholder="Enter new password" placeholderTextColor={COLORS.textLight} secureTextEntry={!showNewPassword} autoCapitalize="none" />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Icon name={showNewPassword ? 'eye' : 'eye-off'} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>Must be at least 6 characters</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput style={styles.input} value={formData.confirmPassword} onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })} placeholder="Confirm new password" placeholderTextColor={COLORS.textLight} secureTextEntry={!showConfirmPassword} autoCapitalize="none" />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Icon name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Password Tips:</Text>
            <View style={styles.tipRow}><Icon name="check" size={16} color={COLORS.success} /><Text style={styles.tipText}>Use at least 8 characters</Text></View>
            <View style={styles.tipRow}><Icon name="check" size={16} color={COLORS.success} /><Text style={styles.tipText}>Mix uppercase and lowercase letters</Text></View>
            <View style={styles.tipRow}><Icon name="check" size={16} color={COLORS.success} /><Text style={styles.tipText}>Include numbers and symbols</Text></View>
            <View style={styles.tipRow}><Icon name="check" size={16} color={COLORS.success} /><Text style={styles.tipText}>Avoid common words or patterns</Text></View>
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
  headerTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  content: { padding: SIZES.paddingHorizontal },
  iconContainer: { alignItems: 'center', marginVertical: SIZES.xl },
  securityIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryAlpha, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md } as any,
  securityTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  securitySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SIZES.lg },
  form: { marginTop: SIZES.lg },
  inputGroup: { marginBottom: SIZES.lg },
  label: { fontSize: SIZES.bodySmall, fontFamily: FONTS.semiBold, color: COLORS.text, marginBottom: SIZES.sm },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  input: { flex: 1, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, fontSize: SIZES.body, color: COLORS.text },
  eyeIcon: { paddingHorizontal: SIZES.md },
  hint: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginTop: SIZES.xs },
  tipsCard: { backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, marginTop: SIZES.lg, ...SHADOWS.card },
  tipsTitle: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.md },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm, gap: SIZES.sm },
  tipText: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary, flex: 1 },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
