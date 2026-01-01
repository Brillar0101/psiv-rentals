// src/screens/profile/FavoritesScreen.tsx
// Favorites Screen - Shows user's favorite equipment

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@favorites';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_KEY);
      if (favoritesJson) {
        setFavorites(JSON.parse(favoritesJson));
      }
    } catch (error) {
      console.error('Load favorites error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    Alert.alert('Remove from Favorites', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const newFavorites = favorites.filter((item: any) => item.id !== id);
            await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
          } catch (error) {
            console.error('Remove favorite error:', error);
          }
        },
      },
    ]);
  };

  const renderFavoriteCard = ({ item }: any) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EquipmentDetail' as never, { equipmentId: item.id } as never)}>
      <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400' }} style={styles.image} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.equipmentName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.brand}>{item.brand}</Text>
          </View>
          <TouchableOpacity style={styles.heartBtn} onPress={() => removeFavorite(item.id)}>
            <Text style={styles.heartIcon}>❤️</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${item.daily_rate}/day</Text>
            {item.weekly_rate && <Text style={styles.weeklyPrice}>${item.weekly_rate}/week</Text>}
          </View>
          <TouchableOpacity style={styles.bookBtn} onPress={() => navigation.navigate('EquipmentDetail' as never, { equipmentId: item.id } as never)}>
            <Text style={styles.bookBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
          <Text style={styles.headerTitle}>Favorites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{favorites.length}</Text></View>
      </View>
      <FlatList data={favorites} renderItem={renderFavoriteCard} keyExtractor={(item: any) => item.id} contentContainerStyle={styles.list} numColumns={2} columnWrapperStyle={styles.row} showsVerticalScrollIndicator={false} ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>❤️</Text>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>Tap the heart icon on any equipment to save it here</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Home' } as never)}>
            <Text style={styles.browseBtnText}>Browse Equipment</Text>
          </TouchableOpacity>
        </View>
      } />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white, ...SHADOWS.small },
  backIcon: { fontSize: 28, color: COLORS.text },
  headerTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.bold, color: COLORS.white },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SIZES.paddingHorizontal },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, marginBottom: SIZES.md, overflow: 'hidden', ...SHADOWS.card },
  image: { width: '100%', height: 150, backgroundColor: COLORS.background },
  cardContent: { padding: SIZES.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.sm },
  equipmentName: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  brand: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  heartBtn: { padding: SIZES.xs },
  heartIcon: { fontSize: 24 },
  footer: { marginTop: SIZES.sm },
  priceContainer: { marginBottom: SIZES.sm },
  price: { fontSize: SIZES.h4, fontWeight: FONT_WEIGHTS.bold, color: COLORS.primary, marginBottom: SIZES.xs },
  weeklyPrice: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  bookBtn: { backgroundColor: COLORS.primary, paddingVertical: SIZES.sm, borderRadius: SIZES.radiusPill, alignItems: 'center' },
  bookBtnText: { fontSize: SIZES.bodySmall, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.white },
  empty: { alignItems: 'center', paddingVertical: SIZES.xxl * 2, paddingHorizontal: SIZES.xl },
  emptyIcon: { fontSize: 80, marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary, marginBottom: SIZES.xl, textAlign: 'center' },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md, borderRadius: SIZES.radiusPill },
  browseBtnText: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.white },
});
