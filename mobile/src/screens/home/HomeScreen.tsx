// src/screens/home/HomeScreen.tsx
// Clean Home Screen with API integration

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { equipmentAPI, categoryAPI } from '../../services/api';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [categories, setCategories] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
      loadData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        const fullName = user.full_name || user.name || 'User';
        const firstName = fullName.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Load user error:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const categoriesResponse = await categoryAPI.getAll();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.slice(0, 6));
      }

      // Load equipment
      const equipmentResponse = await equipmentAPI.getAll();
      if (equipmentResponse.success) {
        setEquipment(equipmentResponse.data.slice(0, 10));
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => (navigation as any).navigate('CategoryDetail', { categoryId: item.id })}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryIconText}>{item.icon || '📦'}</Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderEquipmentCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.equipmentCard}
      onPress={() => (navigation as any).navigate('EquipmentDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400' }}
        style={styles.equipmentImage}
      />
      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentBrand} numberOfLines={1}>{item.brand || 'Equipment'}</Text>
        <Text style={styles.equipmentName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.equipmentFooter}>
          <Text style={styles.equipmentPrice}>${item.daily_rate}/day</Text>
          {item.average_rating > 0 && (
            <View style={styles.equipmentRating}>
              <Text style={styles.ratingIcon}>⭐</Text>
              <Text style={styles.ratingText}>{item.average_rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{userName}! 👋</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileBtn}
          onPress={() => (navigation as any).navigate('Profile')}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => (navigation as any).navigate('Search')}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search equipment...</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Categories */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity onPress={() => (navigation as any).navigate('Categories')}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={categories}
                renderItem={renderCategoryCard}
                keyExtractor={(item: any) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              />
            </View>
          )}

          {/* Equipment */}
          {equipment.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Available Equipment</Text>
                <TouchableOpacity onPress={() => (navigation as any).navigate('Equipment')}>
                  <Text style={styles.seeAll}>See All →</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={equipment}
                renderItem={renderEquipmentCard}
                keyExtractor={(item: any) => item.id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.equipmentGrid}
                columnWrapperStyle={styles.equipmentRow}
              />
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md },
  greeting: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  userName: { fontSize: SIZES.h2, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  profileBtn: { width: 48, height: 48 },
  profileAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  profileAvatarText: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: SIZES.paddingHorizontal, paddingHorizontal: SIZES.md, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill, marginBottom: SIZES.lg, ...SHADOWS.small },
  searchIcon: { fontSize: 20, marginRight: SIZES.sm },
  searchPlaceholder: { fontSize: SIZES.body, color: COLORS.textLight },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: SIZES.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.paddingHorizontal, marginBottom: SIZES.md },
  sectionTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  seeAll: { fontSize: SIZES.body, color: COLORS.primary, fontWeight: FONT_WEIGHTS.semiBold },
  categoryList: { paddingHorizontal: SIZES.paddingHorizontal },
  categoryCard: { width: 90, marginRight: SIZES.md, alignItems: 'center' },
  categoryIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.sm, ...SHADOWS.card },
  categoryIconText: { fontSize: 32 },
  categoryName: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, textAlign: 'center' },
  equipmentGrid: { paddingHorizontal: SIZES.paddingHorizontal },
  equipmentRow: { justifyContent: 'space-between', marginBottom: SIZES.md },
  equipmentCard: { width: '48%', backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, overflow: 'hidden', ...SHADOWS.card },
  equipmentImage: { width: '100%', height: 140, backgroundColor: COLORS.background },
  equipmentInfo: { padding: SIZES.md },
  equipmentBrand: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.xs },
  equipmentName: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm, minHeight: 40 },
  equipmentFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  equipmentPrice: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary },
  equipmentRating: { flexDirection: 'row', alignItems: 'center' },
  ratingIcon: { fontSize: 14, marginRight: 2 },
  ratingText: { fontSize: SIZES.caption, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text },
});
