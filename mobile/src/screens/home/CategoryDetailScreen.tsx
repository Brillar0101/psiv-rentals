// src/screens/home/CategoryDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SIZES, FONT_WEIGHTS } from '../../constants/theme';
import { EquipmentCard } from '../../components/cards/EquipmentCard';
import { equipmentAPI } from '../../services/api';

export default function CategoryDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params as any;
  
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getByCategory(category.id);
      if (response.success) {
        setEquipment(response.data);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{category.name}</Text>
        <TouchableOpacity><Text style={styles.filterButton}>🎛️</Text></TouchableOpacity>
      </View>

      <FlatList
        data={equipment}
        numColumns={2}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No equipment available in this category</Text>
          </View>
        }
        renderItem={({ item }) => (
          <EquipmentCard
            id={item.id}
            name={item.name}
            brand={item.brand}
            dailyRate={item.daily_rate}
            image={item.images?.[0]}
            available={item.quantity_available > 0}
            rating={item.average_rating}
            onPress={() => navigation.navigate('EquipmentDetail' as never, { id: item.id } as never)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.paddingHorizontal, paddingTop: 50, paddingBottom: SIZES.md, backgroundColor: COLORS.white },
  backButton: { fontSize: 28, color: COLORS.text },
  title: { fontSize: SIZES.h3, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  filterButton: { fontSize: 24 },
  grid: { padding: SIZES.paddingHorizontal, gap: SIZES.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: SIZES.xxl },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary },
});
