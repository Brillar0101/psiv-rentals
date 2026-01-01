// src/screens/profile/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);

  // Reload user data whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Load user error:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.reset({ index: 0, routes: [{ name: 'Auth' as never }] });
        },
      },
    ]);
  };

  const menuSections = [
    {
      section: 'Account',
      items: [
        { icon: '👤', title: 'Edit Profile', screen: 'EditProfile', available: true },
        { icon: '🔒', title: 'Change Password', screen: 'ChangePassword', available: true },
      ],
    },
    {
      section: 'Bookings',
      items: [
        { icon: '📅', title: 'Active Bookings', screen: 'ActiveBookings', available: true },
        { icon: '📋', title: 'Past Bookings', screen: 'PastBookings', available: true },
        { icon: '❤️', title: 'Favorites', screen: 'Favorites', available: true },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: '❓', title: 'Help Center', screen: 'HelpCenter', available: true },
        { icon: '📞', title: 'Contact Support', screen: 'ContactSupport', available: true },
        { icon: '⭐', title: 'Rate App', screen: 'RateApp', available: true },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.name}>{user?.full_name || 'User'}</Text>
            <Text style={styles.email}>{user?.email || ''}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.section}</Text>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.menuItem}
                  onPress={() => {
                    if (item.available) {
                      navigation.navigate(item.screen as never);
                    } else {
                      Alert.alert('Coming Soon', `${item.title} feature is coming soon!`);
                    }
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.menuArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 60, paddingBottom: SIZES.xl, borderBottomLeftRadius: SIZES.radiusLarge, borderBottomRightRadius: SIZES.radiusLarge },
  profileSection: { alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  avatarText: { fontSize: 32, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  name: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white, marginBottom: SIZES.xs },
  email: { fontSize: SIZES.body, color: COLORS.white, opacity: 0.9 },
  content: { padding: SIZES.paddingHorizontal },
  section: { marginTop: SIZES.lg, marginBottom: SIZES.md },
  sectionTitle: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.bold, color: COLORS.textSecondary, marginBottom: SIZES.sm, textTransform: 'uppercase', letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, paddingVertical: SIZES.md, paddingHorizontal: SIZES.md, borderRadius: SIZES.radius, marginBottom: SIZES.xs, ...SHADOWS.small },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 24, marginRight: SIZES.md },
  menuTitle: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.medium, color: COLORS.text },
  menuArrow: { fontSize: 20, color: COLORS.textSecondary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.errorLight, paddingVertical: SIZES.md, borderRadius: SIZES.radius, marginTop: SIZES.xl, marginBottom: SIZES.lg },
  logoutIcon: { fontSize: 20, marginRight: SIZES.sm },
  logoutText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.error },
  version: { fontSize: SIZES.caption, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SIZES.xl },
});
