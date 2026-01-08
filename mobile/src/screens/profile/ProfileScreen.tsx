// src/screens/profile/ProfileScreen.tsx
// Profile Screen with Professional Icons and Rubik Font
// FIXED: Proper fontFamily usage throughout

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Icon, IconName } from '../../components/ui/Icon';
import { AvatarImage } from '../../components/ui/ImageWithFallback';
import { useAlert } from '../../components/ui/AlertModal';

interface MenuItem {
  icon: IconName;
  title: string;
  screen: string;
  available: boolean;
  color?: string;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const userData = JSON.parse(userJson);
        // Ensure full_name is set (handles both old and new data formats)
        if (!userData.full_name && (userData.first_name || userData.last_name)) {
          userData.full_name = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        }
        setUser(userData);
      }
    } catch (error) {
      console.error('Load user error:', error);
    }
  };

  const handleLogout = async () => {
    showAlert({
      type: 'confirm',
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
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
      ],
    });
  };

  const menuSections: MenuSection[] = [
    {
      section: 'Account',
      items: [
        { icon: 'user', title: 'Edit Profile', screen: 'EditProfile', available: true },
        { icon: 'lock', title: 'Change Password', screen: 'ChangePassword', available: true },
      ],
    },
    {
      section: 'Bookings',
      items: [
        { icon: 'calendar', title: 'Active Bookings', screen: 'ActiveBookings', available: true },
        { icon: 'clipboard', title: 'Past Bookings', screen: 'PastBookings', available: true },
        { icon: 'heart', title: 'Favorites', screen: 'Favorites', available: true },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: 'help-circle', title: 'Help Center', screen: 'HelpCenter', available: true },
        { icon: 'phone', title: 'Contact Support', screen: 'ContactSupport', available: true },
        { icon: 'star', title: 'Rate App', screen: 'RateApp', available: true },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <AvatarImage
              source={user?.profile_image_url}
              name={user?.full_name || user?.email}
              size={80}
            />
            <Text style={styles.name}>{user?.full_name || 'User'}</Text>
            <Text style={styles.email}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Menu Sections */}
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
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <Icon 
                        name={item.icon} 
                        size={20} 
                        color={item.color || COLORS.primary} 
                      />
                    </View>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Icon name="log-out" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  header: { 
    backgroundColor: COLORS.primary, 
    paddingTop: 60, 
    paddingBottom: SIZES.xl, 
    borderBottomLeftRadius: SIZES.radiusXL, 
    borderBottomRightRadius: SIZES.radiusXL 
  },
  profileSection: { 
    alignItems: 'center' 
  },
  name: { 
    fontFamily: FONTS.bold,
    fontSize: SIZES.h2, 
    color: COLORS.white, 
    marginTop: SIZES.md,
    marginBottom: SIZES.xs 
  },
  email: { 
    fontFamily: FONTS.regular,
    fontSize: SIZES.body, 
    color: COLORS.white, 
    opacity: 0.9 
  },
  content: { 
    padding: SIZES.paddingHorizontal 
  },
  section: { 
    marginTop: SIZES.lg, 
    marginBottom: SIZES.md 
  },
  sectionTitle: { 
    fontFamily: FONTS.bold,
    fontSize: SIZES.caption, 
    color: COLORS.textSecondary, 
    marginBottom: SIZES.sm, 
    textTransform: 'uppercase', 
    letterSpacing: 1 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: COLORS.white, 
    paddingVertical: SIZES.md, 
    paddingHorizontal: SIZES.md, 
    borderRadius: SIZES.radius, 
    marginBottom: SIZES.xs, 
    ...SHADOWS.small 
  },
  menuItemLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  menuTitle: { 
    fontFamily: FONTS.medium,
    fontSize: SIZES.body, 
    color: COLORS.text 
  },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: COLORS.errorLight, 
    paddingVertical: SIZES.md, 
    borderRadius: SIZES.radius, 
    marginTop: SIZES.xl, 
    marginBottom: SIZES.lg,
    gap: SIZES.sm,
  },
  logoutText: { 
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.body, 
    color: COLORS.error 
  },
  version: { 
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption, 
    color: COLORS.textSecondary, 
    textAlign: 'center', 
    marginBottom: SIZES.xl 
  },
});
