// src/screens/home/HomeScreen.tsx
// Home Screen - Main landing page with equipment browsing

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { EquipmentCard } from '../../components/cards/EquipmentCard';
import { equipmentAPI, categoryAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  
  const [categories, setCategories] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, equipmentRes] = await Promise.all([
        categoryAPI.getAll(),
        equipmentAPI.getAll({ limit: 10, available_only: true }),
      ]);

      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      }

      if (equipmentRes.success) {
        setEquipment(equipmentRes.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('CategoryDetail' as never, { category: item } as never)}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryEmoji}>
          {item.name === 'Cameras' ? '📷' :
           item.name === 'Lenses' ? '🔍' :
           item.name === 'Audio' ? '🎤' :
           item.name === 'Lighting' ? '💡' :
           item.name === 'Stabilization' ? '🎥' :
           item.name === 'Accessories' ? '🎒' :
           item.name === 'Drones' ? '🚁' : '📦'}
        </Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.first_name || 'User'} 👋</Text>
          <Text style={styles.headerSubtitle}>Find your perfect equipment</Text>
        </View>
        
        {/* Notification icon */}
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search' as never)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search equipment...</Text>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('CategoryGrid' as never)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item: any) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Featured Equipment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Equipment</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.equipmentGrid}>
            {equipment.map((item: any) => (
              <EquipmentCard
                key={item.id}
                id={item.id}
                name={item.name}
                brand={item.brand}
                dailyRate={item.daily_rate}
                image={item.images?.[0]}
                available={item.quantity_available > 0}
                rating={item.average_rating}
                onPress={() => navigation.navigate('EquipmentDetail' as never, { id: item.id } as never)}
              />
            ))}
          </View>
        </View>

        {/* Popular This Week */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular This Week</Text>
          <View style={styles.equipmentGrid}>
            {equipment.slice(0, 4).map((item: any) => (
              <EquipmentCard
                key={`popular-${item.id}`}
                id={item.id}
                name={item.name}
                brand={item.brand}
                dailyRate={item.daily_rate}
                image={item.images?.[0]}
                available={item.quantity_available > 0}
                rating={item.average_rating}
                onPress={() => navigation.navigate('EquipmentDetail' as never, { id: item.id } as never)}
              />
            ))}
          </View>
        </View>

        {/* Spacing for bottom tab */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingTop: SIZES.xl + 20,
    paddingBottom: SIZES.md,
    backgroundColor: COLORS.white,
  },
  greeting: {
    fontSize: SIZES.h3,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: SIZES.sm,
  },
  notificationIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.paddingHorizontal,
    marginVertical: SIZES.md,
    padding: SIZES.md,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SIZES.sm,
  },
  searchPlaceholder: {
    fontSize: SIZES.body,
    color: COLORS.textLight,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingHorizontal,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  seeAll: {
    fontSize: SIZES.bodySmall,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  categoriesList: {
    paddingHorizontal: SIZES.paddingHorizontal,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: SIZES.md,
    width: 80,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: SIZES.caption,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
    textAlign: 'center',
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.paddingHorizontal,
    gap: SIZES.md,
  },
});
