// src/screens/home/CategoryGridScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { categoryAPI } from '../../services/api';

export default function CategoryGridScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);

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
      console.error('Failed to load categories:', error);
    }
  };

  const getCategoryEmoji = (name: string) => {
    const emojiMap: any = {
      'Cameras': '📷', 'Lenses': '🔍', 'Audio': '🎤', 'Lighting': '💡',
      'Stabilization': '🎥', 'Accessories': '🎒', 'Drones': '🚁',
    };
    return emojiMap[name] || '📦';
  };

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('CategoryDetail' as never, { category: item } as never)}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.emoji}>{getCategoryEmoji(item.name)}</Text>
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.count}>{item.equipment_count || 0} items</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All Categories</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  backButton: { fontSize: 28, color: COLORS.text },
  title: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  grid: { padding: SIZES.paddingHorizontal },
  row: { gap: SIZES.md },
  categoryCard: { flex: 1, backgroundColor: COLORS.white, borderRadius: SIZES.radiusLarge, padding: SIZES.lg, alignItems: 'center', marginBottom: SIZES.md, ...SHADOWS.card },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryAlpha, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md },
  emoji: { fontSize: 40 },
  name: { fontSize: SIZES.body, fontWeight: FONT_WEIGHTS.semiBold, color: COLORS.text, marginBottom: SIZES.xs },
  count: { fontSize: SIZES.caption, color: COLORS.textSecondary },
});
