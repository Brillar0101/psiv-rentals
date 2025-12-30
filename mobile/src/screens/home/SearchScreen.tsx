// src/screens/home/SearchScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, FONT_WEIGHTS, SHADOWS } from '../../constants/theme';
import { EquipmentCard } from '../../components/cards/EquipmentCard';
import { equipmentAPI } from '../../services/api';

export default function SearchScreen() {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await equipmentAPI.getAll({ search: text, limit: 20 });
      if (response.success) {
        setResults(response.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
            placeholderTextColor={COLORS.textLight}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setResults([]); }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><Text>Searching...</Text></View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.results}
          renderItem={({ item }) => (
            <EquipmentCard
              id={item.id}
              name={item.name}
              brand={item.brand}
              dailyRate={item.daily_rate}
              image={item.images?.[0]}
              available={item.quantity_available > 0}
              rating={item.average_rating}
              onPress={() => {}}
            />
          )}
        />
      ) : searchText.length > 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results found</Text>
        </View>
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>Search for cameras, lenses, audio gear...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingTop: 50, paddingHorizontal: SIZES.paddingHorizontal, paddingBottom: SIZES.md },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundDark, padding: SIZES.md, borderRadius: SIZES.radius },
  searchIcon: { fontSize: 20, marginRight: SIZES.sm },
  searchInput: { flex: 1, fontSize: SIZES.body, color: COLORS.text },
  clearIcon: { fontSize: 20, color: COLORS.textLight, padding: SIZES.xs },
  results: { padding: SIZES.paddingHorizontal, gap: SIZES.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SIZES.padding },
  emptyEmoji: { fontSize: 64, marginBottom: SIZES.md },
  emptyText: { fontSize: SIZES.body, color: COLORS.textSecondary, textAlign: 'center' },
});
