// src/screens/equipment/CategoriesScreen.tsx
// All Categories Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { Icon, getCategoryIcon } from '../../components/ui/Icon';
import { categoryAPI } from '../../services/api';

export default function CategoriesScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Load categories error:', error);
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
        <Icon name={getCategoryIcon(item.name)} size={32} color={COLORS.primary} />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryDescription} numberOfLines={2}>
          {item.description || 'Browse all equipment in this category'}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color={COLORS.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Categories</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconContainer}>
                <Icon name="box" size={80} color={COLORS.textLight} />
              </View>
              <Text style={styles.emptyTitle}>No Categories</Text>
              <Text style={styles.emptySubtitle}>Categories will appear here</Text>
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
  categoryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SIZES.md, borderRadius: SIZES.radiusLarge, marginBottom: SIZES.md, ...SHADOWS.card },
  categoryIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primaryAlpha, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.md },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: SIZES.body, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.xs },
  categoryDescription: { fontSize: SIZES.caption, color: COLORS.textSecondary },
  empty: { alignItems: 'center', paddingVertical: SIZES.xxl * 2 },
  emptyIconContainer: { marginBottom: SIZES.lg },
  emptyTitle: { fontSize: SIZES.h3, fontFamily: FONTS.bold, color: COLORS.text, marginBottom: SIZES.sm },
  emptySubtitle: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
