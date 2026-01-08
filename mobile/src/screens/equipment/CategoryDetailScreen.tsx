// src/screens/equipment/CategoryDetailScreen.tsx
// Category Detail Screen - Shows all equipment in a category - FIXED

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Icon } from '../../components/ui/Icon';
import { equipmentAPI, categoryAPI } from '../../services/api';

export default function CategoryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params as any;

  const [category, setCategory] = useState<any>(null);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoryAndEquipment();
  }, [categoryId]);

  const loadCategoryAndEquipment = async () => {
    try {
      setLoading(true);
      
      // Load category details
      const categoryResponse = await categoryAPI.getById(categoryId);
      if (categoryResponse.success) {
        setCategory(categoryResponse.data);
      }

      // Load equipment in this category
      const equipmentResponse = await equipmentAPI.getByCategory(categoryId);
      if (equipmentResponse.success) {
        setEquipment(equipmentResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEquipmentCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => (navigation as any).navigate('EquipmentDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/400' }}
        style={styles.image}
      />
      <View style={styles.cardContent}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.brand}>{item.brand}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.daily_rate}/day</Text>
          {item.quantity_available > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Available</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category?.name || 'Category'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={equipment}
          renderItem={renderEquipmentCard}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconContainer}>
                <Icon name="box" size={80} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyTitle}>No Equipment</Text>
              <Text style={styles.emptyText}>
                No equipment available in this category
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white, ...SHADOWS.small },
  headerTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: SIZES.paddingHorizontal },
  row: { justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, marginBottom: SIZES.md, overflow: 'hidden', ...SHADOWS.card },
  image: { width: '100%', height: 150, backgroundColor: COLORS.background },
  cardContent: { padding: SIZES.md },
  name: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  brand: { fontSize: SIZES.caption, color: COLORS.textSecondary, marginBottom: SIZES.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  price: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.primary },
  badge: { backgroundColor: COLORS.successLight, paddingHorizontal: SIZES.xs, paddingVertical: 2, borderRadius: SIZES.radiusPill },
  badgeText: { fontSize: SIZES.tiny, color: COLORS.success, fontFamily: FONTS.semiBold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.xxl * 2 },
  emptyIconContainer: { marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center' },
});
