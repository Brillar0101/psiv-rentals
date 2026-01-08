// src/screens/home/HomeScreen.tsx
// Home Screen with Professional Icons and Rubik Font
// FIXED: Proper fontFamily usage throughout

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { equipmentAPI, categoryAPI } from '../../services/api';
import { Icon, getCategoryIcon } from '../../components/ui/Icon';
import { ImageWithFallback, CategoryImage, AvatarImage } from '../../components/ui/ImageWithFallback';
import { StatusBadge, RatingBadge } from '../../components/ui/StatusBadge';
import { SkeletonCategoryList, SkeletonEquipmentGrid } from '../../components/ui/SkeletonLoader';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('User');
  const [userFullName, setUserFullName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        setUserFullName(fullName);
        setProfileImageUrl(user.profile_image_url || null);
      }
    } catch (error) {
      console.error('Load user error:', error);
    }
  };

  const loadData = async () => {
    try {
      // Load categories
      const categoriesResponse = await categoryAPI.getAll();
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.slice(0, 6));
      }

      // Load FEATURED equipment (top 6 rated)
      const featuredResponse = await equipmentAPI.getFeatured(6);
      if (featuredResponse.success) {
        setFeaturedEquipment(featuredResponse.data);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderCategoryCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => (navigation as any).navigate('CategoryDetail', { categoryId: item.id })}
      activeOpacity={0.7}
    >
      <CategoryImage
        categoryName={item.name}
        size={70}
      />
      <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderEquipmentCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.equipmentCard}
      onPress={() => (navigation as any).navigate('EquipmentDetail', { id: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.equipmentImageContainer}>
        <ImageWithFallback
          source={item.images?.[0]}
          style={styles.equipmentImage}
          fallbackIcon="camera"
          fallbackIconSize={32}
          borderRadius={SIZES.radiusLarge}
        />
        
        {/* Featured Badge */}
        <View style={styles.featuredBadge}>
          <Icon name="star" size={10} color={COLORS.white} />
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
      </View>

      <View style={styles.equipmentInfo}>
        <Text style={styles.equipmentBrand} numberOfLines={1}>{item.brand || 'Equipment'}</Text>
        <Text style={styles.equipmentName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.equipmentFooter}>
          <Text style={styles.equipmentPrice}>${item.daily_rate}/day</Text>
          <RatingBadge 
            rating={item.average_rating || 0} 
            showCount={false}
            size="small"
          />
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
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{userName}!</Text>
            <Icon name="zap" size={24} color={COLORS.accent} />
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => (navigation as any).navigate('Profile')}
        >
          <AvatarImage
            source={profileImageUrl}
            name={userFullName}
            size={40}
            variant="primary"
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => (navigation as any).navigate('Search')}
        activeOpacity={0.7}
      >
        <Icon name="search" size={20} color={COLORS.textSecondary} />
        <Text style={styles.searchPlaceholder}>Search equipment...</Text>
      </TouchableOpacity>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity 
              onPress={() => (navigation as any).navigate('Categories')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAll}>See All</Text>
              <Icon name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <SkeletonCategoryList count={5} />
          ) : categories.length > 0 ? (
            <FlatList
              data={categories}
              renderItem={renderCategoryCard}
              keyExtractor={(item: any) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            />
          ) : null}
        </View>

        {/* Featured Equipment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <View style={styles.sectionTitleRow}>
                <Icon name="star" size={20} color={COLORS.accent} />
                <Text style={styles.sectionTitle}>Featured Equipment</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Top rated by our customers</Text>
            </View>
            <TouchableOpacity 
              onPress={() => (navigation as any).navigate('Search')}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAll}>See All</Text>
              <Icon name="chevron-right" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <SkeletonEquipmentGrid count={4} />
          ) : featuredEquipment.length > 0 ? (
            <FlatList
              data={featuredEquipment}
              renderItem={renderEquipmentCard}
              keyExtractor={(item: any) => item.id}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.equipmentGrid}
              columnWrapperStyle={styles.equipmentRow}
            />
          ) : null}
        </View>

        <View style={{ height: 100 }} />
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
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SIZES.paddingHorizontal, 
    paddingTop: 50, 
    paddingBottom: SIZES.md 
  },
  greeting: { 
    fontFamily: FONTS.regular,
    fontSize: SIZES.body, 
    color: COLORS.textSecondary, 
    marginBottom: SIZES.xs 
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  userName: { 
    fontFamily: FONTS.bold,
    fontSize: SIZES.h2, 
    color: COLORS.text 
  },
  profileBtn: { 
    width: 48, 
    height: 48 
  },
  profileAvatar: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...SHADOWS.small 
  },
  profileAvatarText: { 
    fontFamily: FONTS.bold,
    fontSize: SIZES.h4, 
    color: COLORS.white 
  },
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.white, 
    marginHorizontal: SIZES.paddingHorizontal, 
    paddingHorizontal: SIZES.md, 
    paddingVertical: SIZES.md, 
    borderRadius: SIZES.radiusPill, 
    marginBottom: SIZES.lg, 
    ...SHADOWS.small,
    gap: SIZES.sm,
  },
  searchPlaceholder: { 
    fontFamily: FONTS.regular,
    fontSize: SIZES.body, 
    color: COLORS.textLight 
  },
  section: { 
    marginBottom: SIZES.lg 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    paddingHorizontal: SIZES.paddingHorizontal, 
    marginBottom: SIZES.md 
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  sectionTitle: { 
    fontFamily: FONTS.bold,
    fontSize: SIZES.h4, 
    color: COLORS.text 
  },
  sectionSubtitle: { 
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption, 
    color: COLORS.textSecondary, 
    marginTop: SIZES.xs 
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAll: { 
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.bodySmall, 
    color: COLORS.primary, 
  },
  categoryList: { 
    paddingHorizontal: SIZES.paddingHorizontal 
  },
  categoryCard: { 
    width: 90, 
    marginRight: SIZES.md, 
    alignItems: 'center' 
  },
  categoryName: { 
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.bodySmall, 
    color: COLORS.text, 
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
  equipmentGrid: { 
    paddingHorizontal: SIZES.paddingHorizontal 
  },
  equipmentRow: { 
    justifyContent: 'space-between', 
    marginBottom: SIZES.md 
  },
  equipmentCard: { 
    width: '48%', 
    backgroundColor: COLORS.white, 
    borderRadius: SIZES.radiusLarge, 
    overflow: 'hidden', 
    ...SHADOWS.card 
  },
  equipmentImageContainer: {
    position: 'relative',
  },
  equipmentImage: { 
    width: '100%', 
    height: 140, 
    backgroundColor: COLORS.background 
  },
  featuredBadge: { 
    position: 'absolute', 
    top: 8, 
    right: 8, 
    backgroundColor: COLORS.accent,
    paddingHorizontal: SIZES.sm, 
    paddingVertical: 4, 
    borderRadius: SIZES.radiusPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredBadgeText: { 
    fontFamily: FONTS.bold,
    fontSize: 10, 
    color: COLORS.white 
  },
  equipmentInfo: { 
    padding: SIZES.md 
  },
  equipmentBrand: { 
    fontFamily: FONTS.regular,
    fontSize: SIZES.caption, 
    color: COLORS.textSecondary, 
    marginBottom: SIZES.xs 
  },
  equipmentName: { 
    fontFamily: FONTS.bold,
    fontSize: SIZES.body, 
    color: COLORS.text, 
    marginBottom: SIZES.sm, 
    minHeight: 40 
  },
  equipmentFooter: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  equipmentPrice: { 
    fontFamily: FONTS.bold,
    fontSize: SIZES.body, 
    color: COLORS.primary 
  },
});
