// src/screens/home/SearchScreen.tsx
// Search Screen with Professional Icons and Rubik Font
// FIXED: Proper fontFamily usage throughout

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { EquipmentCard } from '../../components/cards/EquipmentCard';
import { equipmentAPI } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import { EmptySearch } from '../../components/ui/EmptyState';
import { SkeletonEquipmentGrid } from '../../components/ui/SkeletonLoader';

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
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

  const clearSearch = () => {
    setSearchText('');
    setResults([]);
    setHasSearched(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      {/* Header with Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            value={searchText}
            onChangeText={handleSearch}
            autoFocus
            placeholderTextColor={COLORS.textLight}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Icon name="x" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <SkeletonEquipmentGrid count={6} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.results}
          columnWrapperStyle={styles.resultsRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <EquipmentCard
              id={item.id}
              name={item.name}
              brand={item.brand}
              dailyRate={item.daily_rate}
              image={item.images?.[0]}
              available={item.quantity_available > 0}
              rating={item.average_rating}
              onPress={() => (navigation as any).navigate('EquipmentDetail', { id: item.id })}
            />
          )}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      ) : hasSearched && searchText.length >= 2 ? (
        <EmptySearch query={searchText} />
      ) : (
        <View style={styles.initialState}>
          <View style={styles.initialIconContainer}>
            <Icon name="search" size={48} color={COLORS.textLight} />
          </View>
          <Text style={styles.initialTitle}>Search Equipment</Text>
          <Text style={styles.initialSubtitle}>
            Find cameras, lenses, audio gear, and more...
          </Text>
          
          {/* Quick Search Suggestions */}
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>Popular searches</Text>
            <View style={styles.suggestionTags}>
              {['Canon', 'Sony', 'Lens', 'Tripod', 'Audio'].map((tag) => (
                <TouchableOpacity 
                  key={tag}
                  style={styles.suggestionTag}
                  onPress={() => handleSearch(tag)}
                >
                  <Text style={styles.suggestionTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    backgroundColor: COLORS.white, 
    paddingTop: 50, 
    paddingHorizontal: SIZES.paddingHorizontal, 
    paddingBottom: SIZES.md,
    gap: SIZES.sm,
    ...SHADOWS.small,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: { 
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.backgroundDark, 
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm, 
    borderRadius: SIZES.radiusPill,
    gap: SIZES.sm,
  },
  searchInput: { 
    flex: 1, 
    fontFamily: FONTS.regular,
    fontSize: SIZES.body, 
    color: COLORS.text,
    paddingVertical: SIZES.xs,
  },
  clearButton: {
    padding: SIZES.xs,
  },
  loadingContainer: {
    paddingTop: SIZES.md,
  },
  results: { 
    padding: SIZES.paddingHorizontal,
    paddingTop: SIZES.md,
  },
  resultsRow: {
    justifyContent: 'space-between',
  },
  initialState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SIZES.paddingHorizontal,
    paddingBottom: 100,
  },
  initialIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  initialTitle: {
    fontFamily: FONTS.bold,
    fontSize: SIZES.h3,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  initialSubtitle: { 
    fontFamily: FONTS.regular,
    fontSize: SIZES.body, 
    color: COLORS.textSecondary, 
    textAlign: 'center',
    maxWidth: 280,
  },
  suggestions: {
    marginTop: SIZES.xxl,
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  suggestionTag: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusPill,
    ...SHADOWS.small,
  },
  suggestionTagText: {
    fontFamily: FONTS.medium,
    fontSize: SIZES.bodySmall,
    color: COLORS.text,
  },
});
