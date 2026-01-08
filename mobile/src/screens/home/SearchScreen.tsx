// src/screens/home/SearchScreen.tsx
// Enhanced Search Screen with Analytics, Availability Filtering, and Suggestions

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/theme';
import { EquipmentCard } from '../../components/cards/EquipmentCard';
import { equipmentAPI, analyticsAPI } from '../../services/api';
import { Icon } from '../../components/ui/Icon';
import { EmptySearch } from '../../components/ui/EmptyState';
import { SkeletonEquipmentGrid } from '../../components/ui/SkeletonLoader';

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface Equipment {
  id: string;
  name: string;
  brand: string;
  daily_rate: number;
  images: string[];
  quantity_available: number;
  average_rating: number;
  category_id: string;
  category_name?: string;
}

interface PopularSearch {
  query: string;
  count: number;
}

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<Equipment[]>([]);
  const [similarItems, setSimilarItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);

  // Stats for results
  const [availableCount, setAvailableCount] = useState(0);
  const [unavailableCount, setUnavailableCount] = useState(0);

  // Track if we've logged this search (to avoid duplicate logs)
  const lastLoggedSearch = useRef<string>('');

  // Debounce search text - wait 300ms after user stops typing
  const debouncedSearchText = useDebounce(searchText, 300);

  // Fetch popular searches on mount
  useEffect(() => {
    fetchPopularSearches();
  }, []);

  // Perform search when debounced text changes
  useEffect(() => {
    if (debouncedSearchText.length >= 2) {
      performSearch(debouncedSearchText);
    } else if (debouncedSearchText.length === 0) {
      setResults([]);
      setSimilarItems([]);
      setHasSearched(false);
      setAvailableCount(0);
      setUnavailableCount(0);
    }
  }, [debouncedSearchText]);

  const fetchPopularSearches = async () => {
    try {
      // This will use the analytics API endpoint
      const response = await fetch('http://10.0.0.171:5000/api/analytics/popular-searches?limit=5');
      const data = await response.json();
      if (data.success && data.data) {
        setPopularSearches(data.data);
      }
    } catch (error) {
      console.log('Failed to fetch popular searches:', error);
      // Fall back to default suggestions
      setPopularSearches([
        { query: 'Canon', count: 0 },
        { query: 'Sony', count: 0 },
        { query: 'Lens', count: 0 },
        { query: 'Tripod', count: 0 },
        { query: 'Audio', count: 0 },
      ]);
    }
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setHasSearched(true);
    setSimilarItems([]);

    try {
      const response = await equipmentAPI.getAll({ search: query, limit: 30 });

      if (response.success) {
        const allResults = response.data || [];
        setResults(allResults);

        // Calculate availability stats
        const available = allResults.filter((item: Equipment) => item.quantity_available > 0).length;
        const unavailable = allResults.length - available;
        setAvailableCount(available);
        setUnavailableCount(unavailable);

        // Log search analytics (only if we haven't already logged this query)
        if (lastLoggedSearch.current !== query) {
          lastLoggedSearch.current = query;
          analyticsAPI.logSearch(query, allResults.length);
        }

        // If no results, fetch similar items
        if (allResults.length === 0) {
          fetchSimilarItems(query);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarItems = async (query: string) => {
    try {
      // Get popular/featured items as suggestions
      const response = await equipmentAPI.getFeatured(6);
      if (response.success) {
        setSimilarItems(response.data || []);
      }
    } catch (error) {
      console.log('Failed to fetch similar items:', error);
    }
  };

  const handleItemPress = (item: Equipment) => {
    // Log that user selected this item from search
    if (searchText.length >= 2) {
      analyticsAPI.logSearch(searchText, results.length, item.id);
    }
    (navigation as any).navigate('EquipmentDetail', { id: item.id });
  };

  const clearSearch = () => {
    setSearchText('');
    setResults([]);
    setSimilarItems([]);
    setHasSearched(false);
    setAvailableCount(0);
    setUnavailableCount(0);
    lastLoggedSearch.current = '';
    Keyboard.dismiss();
  };

  const handleContactUs = () => {
    // Open email or phone to contact about equipment
    Linking.openURL('mailto:contact@psivrentals.com?subject=Equipment Inquiry&body=Hi, I was looking for: ' + searchText);
  };

  // Filter results based on availability toggle
  const displayedResults = showAvailableOnly
    ? results.filter(item => item.quantity_available > 0)
    : results;

  const renderSuggestionTag = (tag: string | PopularSearch) => {
    const query = typeof tag === 'string' ? tag : tag.query;
    return (
      <TouchableOpacity
        key={query}
        style={styles.suggestionTag}
        onPress={() => setSearchText(query)}
      >
        <Text style={styles.suggestionTagText}>{query}</Text>
      </TouchableOpacity>
    );
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
            onChangeText={setSearchText}
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

      {/* Availability Filter Bar - Show when we have results */}
      {hasSearched && results.length > 0 && (
        <View style={styles.filterBar}>
          <View style={styles.resultStats}>
            <Text style={styles.resultCount}>
              {displayedResults.length} {displayedResults.length === 1 ? 'result' : 'results'}
            </Text>
            <View style={styles.availabilityStats}>
              <View style={styles.statBadge}>
                <View style={[styles.statDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.statText}>{availableCount} available</Text>
              </View>
              {unavailableCount > 0 && (
                <View style={styles.statBadge}>
                  <View style={[styles.statDot, { backgroundColor: COLORS.error }]} />
                  <Text style={styles.statText}>{unavailableCount} rented</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.filterToggle,
              showAvailableOnly && styles.filterToggleActive
            ]}
            onPress={() => setShowAvailableOnly(!showAvailableOnly)}
          >
            <Icon
              name="check-circle"
              size={16}
              color={showAvailableOnly ? COLORS.white : COLORS.primary}
            />
            <Text style={[
              styles.filterToggleText,
              showAvailableOnly && styles.filterToggleTextActive
            ]}>
              Available only
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <SkeletonEquipmentGrid count={6} />
        </View>
      ) : displayedResults.length > 0 ? (
        <FlatList
          data={displayedResults}
          numColumns={2}
          keyExtractor={(item) => item.id}
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
              onPress={() => handleItemPress(item)}
            />
          )}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      ) : hasSearched && searchText.length >= 2 ? (
        <ScrollView
          style={styles.noResultsContainer}
          contentContainerStyle={styles.noResultsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* No Results Message */}
          <View style={styles.noResultsHeader}>
            <View style={styles.noResultsIconContainer}>
              <Icon name="search" size={32} color={COLORS.textLight} />
              <View style={styles.noResultsX}>
                <Icon name="x" size={16} color={COLORS.error} />
              </View>
            </View>
            <Text style={styles.noResultsTitle}>No results for "{searchText}"</Text>
            <Text style={styles.noResultsSubtitle}>
              We couldn't find any equipment matching your search. Try different keywords or browse our suggestions below.
            </Text>
          </View>

          {/* Suggestions */}
          <View style={styles.noResultsSuggestions}>
            <Text style={styles.suggestionsTitle}>Try searching for:</Text>
            <View style={styles.suggestionTags}>
              {(popularSearches.length > 0 ? popularSearches : [
                { query: 'Camera', count: 0 },
                { query: 'Lens', count: 0 },
                { query: 'Lighting', count: 0 },
                { query: 'Audio', count: 0 },
              ]).map(renderSuggestionTag)}
            </View>
          </View>

          {/* Similar/Featured Items */}
          {similarItems.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>You might be interested in:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarList}
              >
                {similarItems.map((item) => (
                  <View key={item.id} style={styles.similarCard}>
                    <EquipmentCard
                      id={item.id}
                      name={item.name}
                      brand={item.brand}
                      dailyRate={item.daily_rate}
                      image={item.images?.[0]}
                      available={item.quantity_available > 0}
                      rating={item.average_rating}
                      onPress={() => handleItemPress(item)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Contact CTA */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Can't find what you need?</Text>
            <Text style={styles.contactSubtitle}>
              Let us know what equipment you're looking for and we'll try to help!
            </Text>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactUs}>
              <Icon name="mail" size={18} color={COLORS.white} />
              <Text style={styles.contactButtonText}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
              {(popularSearches.length > 0 ? popularSearches : [
                { query: 'Canon', count: 0 },
                { query: 'Sony', count: 0 },
                { query: 'Lens', count: 0 },
                { query: 'Tripod', count: 0 },
                { query: 'Audio', count: 0 },
              ]).map(renderSuggestionTag)}
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
    fontSize: SIZES.body,
    color: COLORS.text,
    paddingVertical: SIZES.xs,
  },
  clearButton: {
    padding: SIZES.xs,
  },

  // Filter Bar
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingHorizontal,
    paddingVertical: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultStats: {
    flex: 1,
  },
  resultCount: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
  },
  availabilityStats: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginTop: 4,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusPill,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterToggleText: {
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  filterToggleTextActive: {
    color: COLORS.white,
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

  // No Results State
  noResultsContainer: {
    flex: 1,
  },
  noResultsContent: {
    padding: SIZES.paddingHorizontal,
    paddingBottom: 100,
  },
  noResultsHeader: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  noResultsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  noResultsX: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  noResultsTitle: {
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  noResultsSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  noResultsSuggestions: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },

  // Similar Items
  similarSection: {
    marginBottom: SIZES.xl,
  },
  similarTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  similarList: {
    paddingRight: SIZES.paddingHorizontal,
  },
  similarCard: {
    width: 160,
    marginRight: SIZES.md,
  },

  // Contact Section
  contactSection: {
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  contactTitle: {
    fontSize: SIZES.body,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  contactSubtitle: {
    fontSize: SIZES.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusPill,
  },
  contactButtonText: {
    fontSize: SIZES.body,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },

  // Initial State
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
    fontSize: SIZES.h3,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  initialSubtitle: {
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
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.semiBold,
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
    fontSize: SIZES.bodySmall,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
});
