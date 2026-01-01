// src/screens/profile/ProfileScreen.tsx
// Profile Screen - User profile with settings and logout

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: '👤', title: 'Edit Profile', screen: 'EditProfile', available: true },
        { icon: '🔒', title: 'Change Password', screen: 'ChangePassword', available: false },
      ],
    },
    {
      section: 'Bookings',
      items: [
        { icon: '📅', title: 'Active Bookings', screen: 'MyBookingsActive', available: false },
        { icon: '📋', title: 'Past Bookings', screen: 'MyBookingsPast', available: false },
        { icon: '❤️', title: 'Favorites', screen: 'Favorites', available: false },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: '❓', title: 'Help Center', screen: 'HelpCenter', available: true },
        { icon: '📞', title: 'Contact Support', screen: 'ContactSupport', available: false },
        { icon: '⭐', title: 'Rate App', screen: 'RateApp', available: false },
      ],
    },
    {
      section: 'Settings',
      items: [
        { icon: '⚙️', title: 'Settings', screen: 'Settings', available: false },
        { icon: '🔔', title: 'Notifications', screen: 'NotificationSettings', available: false },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name?.[0]?.toUpperCase() || '?'}
              {user?.last_name?.[0]?.toUpperCase() || ''}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.first_name} {user?.last_name}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {user?.phone && <Text style={styles.userPhone}>📱 {user.phone}</Text>}
          </View>
        </View>

        {menuItems.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex !== section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    if (item.available) {
                      navigation.navigate(item.screen as never);
                    } else {
                      Alert.alert('Coming Soon', `${item.title} will be available soon!`);
                    }
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>PSIV Rentals v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  headerTitle: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  userCard: { backgroundColor: COLORS.white, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.md, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, flexDirection: 'row', alignItems: 'center', ...SHADOWS.card },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  avatarText: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  userInfo: { flex: 1 },
  userName: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  userEmail: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  userPhone: { fontSize: SIZES.bodySmall, color: COLORS.textSecondary },
  section: { marginTop: SIZES.lg },
  sectionTitle: { fontSize: SIZES.caption, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.textSecondary, marginBottom: SIZES.sm, marginLeft: SIZES.paddingHorizontal, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: COLORS.white, marginHorizontal: SIZES.paddingHorizontal, borderRadius: SIZES.radiusLarge, ...SHADOWS.small },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.md },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon: { fontSize: 24, marginRight: SIZES.md },
  menuTitle: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.medium, color: COLORS.text },
  menuArrow: { fontSize: 24, color: COLORS.textLight },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.errorLight, marginHorizontal: SIZES.paddingHorizontal, marginTop: SIZES.xl, padding: SIZES.md, borderRadius: SIZES.radiusLarge },
  logoutIcon: { fontSize: 20, marginRight: SIZES.sm },
  logoutText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.error },
  version: { fontSize: SIZES.caption, color: COLORS.textLight, textAlign: 'center', marginTop: SIZES.xl },
});
