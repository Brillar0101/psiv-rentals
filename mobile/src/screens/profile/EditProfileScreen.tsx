// src/screens/profile/EditProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const US_STATES = [
  { label: 'Alabama', value: 'AL' },
  { label: 'Alaska', value: 'AK' },
  { label: 'Arizona', value: 'AZ' },
  { label: 'Arkansas', value: 'AR' },
  { label: 'California', value: 'CA' },
  { label: 'Colorado', value: 'CO' },
  { label: 'Connecticut', value: 'CT' },
  { label: 'Delaware', value: 'DE' },
  { label: 'Florida', value: 'FL' },
  { label: 'Georgia', value: 'GA' },
  { label: 'Hawaii', value: 'HI' },
  { label: 'Idaho', value: 'ID' },
  { label: 'Illinois', value: 'IL' },
  { label: 'Indiana', value: 'IN' },
  { label: 'Iowa', value: 'IA' },
  { label: 'Kansas', value: 'KS' },
  { label: 'Kentucky', value: 'KY' },
  { label: 'Louisiana', value: 'LA' },
  { label: 'Maine', value: 'ME' },
  { label: 'Maryland', value: 'MD' },
  { label: 'Massachusetts', value: 'MA' },
  { label: 'Michigan', value: 'MI' },
  { label: 'Minnesota', value: 'MN' },
  { label: 'Mississippi', value: 'MS' },
  { label: 'Missouri', value: 'MO' },
  { label: 'Montana', value: 'MT' },
  { label: 'Nebraska', value: 'NE' },
  { label: 'Nevada', value: 'NV' },
  { label: 'New Hampshire', value: 'NH' },
  { label: 'New Jersey', value: 'NJ' },
  { label: 'New Mexico', value: 'NM' },
  { label: 'New York', value: 'NY' },
  { label: 'North Carolina', value: 'NC' },
  { label: 'North Dakota', value: 'ND' },
  { label: 'Ohio', value: 'OH' },
  { label: 'Oklahoma', value: 'OK' },
  { label: 'Oregon', value: 'OR' },
  { label: 'Pennsylvania', value: 'PA' },
  { label: 'Rhode Island', value: 'RI' },
  { label: 'South Carolina', value: 'SC' },
  { label: 'South Dakota', value: 'SD' },
  { label: 'Tennessee', value: 'TN' },
  { label: 'Texas', value: 'TX' },
  { label: 'Utah', value: 'UT' },
  { label: 'Vermont', value: 'VT' },
  { label: 'Virginia', value: 'VA' },
  { label: 'Washington', value: 'WA' },
  { label: 'West Virginia', value: 'WV' },
  { label: 'Wisconsin', value: 'WI' },
  { label: 'Wyoming', value: 'WY' },
];

const COUNTRIES = [
  { label: 'United States', value: 'USA' },
  { label: 'Canada', value: 'CA' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Other', value: 'OTHER' },
];

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'USA',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zip_code: user.zip_code || '',
          country: user.country || 'USA',
        });
      }
    } catch (error) {
      console.error('Load profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.full_name || !formData.email) {
      Alert.alert('Missing Information', 'Name and email are required');
      return;
    }
    
    Keyboard.dismiss();
    setSaving(true);
    try {
      const response = await api.put('/auth/profile', formData);
      if (response.data.success) {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          const updatedUser = { ...user, ...formData };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.content}>
              <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{formData.full_name.charAt(0).toUpperCase() || '?'}</Text>
                </View>
                <TouchableOpacity style={styles.changePhotoBtn}><Text style={styles.changePhotoText}>Change Photo</Text></TouchableOpacity>
              </View>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput style={styles.input} value={formData.full_name} onChangeText={(text) => setFormData({ ...formData, full_name: text })} placeholder="John Doe" placeholderTextColor={COLORS.textLight} />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput style={styles.input} value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} placeholder="john@example.com" placeholderTextColor={COLORS.textLight} keyboardType="email-address" autoCapitalize="none" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput style={styles.input} value={formData.phone} onChangeText={(text) => setFormData({ ...formData, phone: text })} placeholder="(555) 123-4567" placeholderTextColor={COLORS.textLight} keyboardType="phone-pad" />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Country</Text>
                  <TouchableOpacity style={styles.dropdown} onPress={() => { Keyboard.dismiss(); setShowCountryDropdown(!showCountryDropdown); setShowStateDropdown(false); }}>
                    <Text style={styles.dropdownText}>{COUNTRIES.find(c => c.value === formData.country)?.label || 'Select Country'}</Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>
                  {showCountryDropdown && (
                    <View style={styles.dropdownMenu}>
                      {COUNTRIES.map((country) => (
                        <TouchableOpacity key={country.value} style={styles.dropdownItem} onPress={() => { setFormData({ ...formData, country: country.value, state: country.value !== 'USA' ? '' : formData.state }); setShowCountryDropdown(false); }}>
                          <Text style={styles.dropdownItemText}>{country.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Street Address</Text>
                  <TextInput style={styles.input} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} placeholder="123 Main St" placeholderTextColor={COLORS.textLight} />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: SIZES.sm }]}>
                    <Text style={styles.label}>City</Text>
                    <TextInput style={styles.input} value={formData.city} onChangeText={(text) => setFormData({ ...formData, city: text })} placeholder="San Francisco" placeholderTextColor={COLORS.textLight} />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: SIZES.sm }]}>
                    <Text style={styles.label}>State</Text>
                    {formData.country === 'USA' ? (
                      <>
                        <TouchableOpacity style={styles.dropdown} onPress={() => { Keyboard.dismiss(); setShowStateDropdown(!showStateDropdown); setShowCountryDropdown(false); }}>
                          <Text style={styles.dropdownText}>{formData.state || 'Select State'}</Text>
                          <Text style={styles.dropdownArrow}>▼</Text>
                        </TouchableOpacity>
                        {showStateDropdown && (
                          <ScrollView style={styles.dropdownMenu} nestedScrollEnabled>
                            {US_STATES.map((state) => (
                              <TouchableOpacity key={state.value} style={styles.dropdownItem} onPress={() => { setFormData({ ...formData, state: state.value }); setShowStateDropdown(false); }}>
                                <Text style={styles.dropdownItemText}>{state.label} ({state.value})</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </>
                    ) : (
                      <TextInput style={styles.input} value={formData.state} onChangeText={(text) => setFormData({ ...formData, state: text })} placeholder="State/Province" placeholderTextColor={COLORS.textLight} maxLength={20} />
                    )}
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ZIP Code</Text>
                  <TextInput style={styles.input} value={formData.zip_code} onChangeText={(text) => setFormData({ ...formData, zip_code: text })} placeholder="94102" placeholderTextColor={COLORS.textLight} keyboardType="number-pad" maxLength={10} returnKeyType="done" onSubmitEditing={Keyboard.dismiss} />
                </View>
              </View>
              <View style={{ height: 100 }} />
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Button title={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} disabled={saving} fullWidth />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white, ...SHADOWS.small },
  backIcon: { fontSize: 28, color: COLORS.text },
  headerTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: SIZES.paddingHorizontal },
  avatarSection: { alignItems: 'center', marginVertical: SIZES.xl },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  avatarText: { fontSize: 40, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  changePhotoBtn: { paddingVertical: SIZES.sm },
  changePhotoText: { fontSize: SIZES.body, color: COLORS.primary, fontWeight: FONT_WEIGHTS.semiBold },
  form: { marginTop: SIZES.md },
  inputGroup: { marginBottom: SIZES.lg },
  label: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.sm },
  input: { backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, fontSize: SIZES.body, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  row: { flexDirection: 'row' },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: SIZES.radius, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  dropdownText: { fontSize: SIZES.body, color: COLORS.text, flex: 1 },
  dropdownArrow: { fontSize: 12, color: COLORS.textSecondary, marginLeft: SIZES.sm },
  dropdownMenu: { position: 'absolute', top: 70, left: 0, right: 0, backgroundColor: COLORS.white, borderRadius: SIZES.radius, maxHeight: 200, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.large, zIndex: 1000 },
  dropdownItem: { paddingVertical: SIZES.md, paddingHorizontal: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText: { fontSize: SIZES.body, color: COLORS.text },
  footer: { backgroundColor: COLORS.white, paddingHorizontal: SIZES.paddingHorizontal, paddingVertical: SIZES.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.large },
});
