import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addToRecentGuides,
  addToRecentSearches,
  clearSearchResults,
  incrementViewCount,
  searchGuides,
  selectRecentSearches,
  selectSearchResults,
} from '../../store/slices/guidesSlice';
import { SearchBar } from '../../components/guides/SearchBar';
import { GuideCard } from '../../components/guides/GuideCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SearchIndexer } from '../../utils/searchIndexer';
import { FirstAidGuide } from '../../types';
import { GuideCategory } from '../../types/guideContent';
import { trackEvent, trackScreen } from '../../utils/analytics';
import styles from './GuideSearchScreen.styles';

const CATEGORY_FILTERS: Array<{ label: string; value: GuideCategory | null }> = [
  { label: 'All', value: null },
  { label: 'Life Support', value: GuideCategory.BASIC_LIFE_SUPPORT },
  { label: 'Wounds', value: GuideCategory.WOUNDS_BLEEDING },
  { label: 'Burns', value: GuideCategory.BURNS_SCALDS },
  { label: 'Fractures', value: GuideCategory.FRACTURES_SPRAINS },
  { label: 'Medical', value: GuideCategory.MEDICAL_EMERGENCIES },
  { label: 'Environmental', value: GuideCategory.ENVIRONMENTAL_EMERGENCIES },
  { label: 'Poisoning', value: GuideCategory.POISONING_OVERDOSE },
  { label: 'Child', value: GuideCategory.PEDIATRIC_EMERGENCIES },
];

const NO_RESULTS_SUGGESTIONS = [
  'Try searching for symptoms instead of medical terms',
  'Use simple words like "bleeding" or "burn"',
  'Check your spelling',
  'Try voice search for hands-free input',
];

const GuideSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchIndexer, setSearchIndexer] = useState<SearchIndexer | null>(null);

  const searchResults = useAppSelector(selectSearchResults);
  const recentSearches = useAppSelector(selectRecentSearches);
  const guides = useAppSelector((state) => state.guides.guides);
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    trackScreen('GuideSearchScreen');
    initializeSearchIndexer();
    loadHighContrastSetting();

    return () => {
      dispatch(clearSearchResults());
    };
  }, [dispatch, initializeSearchIndexer]);

  const loadHighContrastSetting = async () => {
    try {
      const value = await AsyncStorage.getItem('@high_contrast_mode');
      setIsHighContrast(value === 'true');
    } catch (error) {
      console.error('Error loading high contrast setting:', error);
    }
  };

  const initializeSearchIndexer = async () => {
    const indexer = new SearchIndexer();
    await indexer.indexGuides(guides);
    setSearchIndexer(indexer);
  };

  const handleSearch = useCallback(
    async (query: string) => {
      if (!searchIndexer || !query.trim()) {
        dispatch(clearSearchResults());
        return;
      }

      setIsSearching(true);
      try {
        const results = await searchIndexer.search(query, {
          maxResults: 20,
          fuzzyThreshold: 0.3,
        });

        const filteredResults = selectedCategory
          ? results.filter((result) => {
              const guide = guides.find((g) => g.id === result.id);
              return guide?.category === selectedCategory;
            })
          : results;

        dispatch(searchGuides({ query, results: filteredResults }));

        if (query.trim().length > 2) {
          dispatch(addToRecentSearches(query));
        }

        trackEvent('guide_search', { query, resultCount: filteredResults.length });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [searchIndexer, selectedCategory, guides, dispatch],
  );

  const handleSearchSubmit = () => {
    handleSearch(searchQuery);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleGuidePress = (guide: FirstAidGuide) => {
    dispatch(addToRecentGuides(guide.id));
    dispatch(incrementViewCount(guide.id));
    navigation.navigate('GuideDetail', { guideId: guide.id });
  };

  const handleCategorySelect = (category: GuideCategory | null) => {
    setSelectedCategory(category);
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const getGuidesFromResults = (): FirstAidGuide[] => {
    return searchResults
      .map((result) => guides.find((guide) => guide.id === result.id))
      .filter((guide): guide is FirstAidGuide => guide !== undefined);
  };

  const renderGuideCard = ({ item }: { item: FirstAidGuide }) => (
    <GuideCard guide={item} onPress={() => handleGuidePress(item)} />
  );

  const renderCategoryFilter = ({ item }: { item: (typeof CATEGORY_FILTERS)[0] }) => {
    const isSelected = selectedCategory === item.value;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          isSelected && styles.filterChipSelected,
          isHighContrast && styles.filterChipHighContrast,
        ]}
        onPress={() => handleCategorySelect(item.value)}
        testID={`filter-${item.label}`}
      >
        <Text
          style={[
            styles.filterChipText,
            isSelected && styles.filterChipTextSelected,
            isHighContrast && styles.filterChipTextHighContrast,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (!searchQuery) {
      return null;
    }

    return (
      <View style={styles.emptyState}>
        <Icon
          name="search-off"
          type="material"
          size={64}
          color="#6f6f6f"
          style={styles.emptyIcon}
        />
        <Text style={[styles.emptyTitle, isHighContrast && styles.emptyTitleHighContrast]}>
          No results found for "{searchQuery}"
        </Text>
        <View style={styles.suggestionsList}>
          {NO_RESULTS_SUGGESTIONS.map((suggestion, index) => (
            <Text
              key={index}
              style={[styles.suggestionText, isHighContrast && styles.suggestionTextHighContrast]}
            >
              • {suggestion}
            </Text>
          ))}
        </View>
        {selectedCategory && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => handleCategorySelect(null)}
          >
            <Text style={styles.clearFilterText}>Clear category filter</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const containerStyle = [styles.container, isHighContrast && styles.containerHighContrast];
  const headerStyle = [styles.header, isHighContrast && styles.headerHighContrast];

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar
        barStyle={isHighContrast ? 'light-content' : 'dark-content'}
        backgroundColor={isHighContrast ? '#000000' : '#ffffff'}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={headerStyle}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            testID="back-button"
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Icon
              name="arrow-back"
              type="material"
              size={24}
              color={isHighContrast ? '#ffffff' : '#161616'}
            />
          </TouchableOpacity>
          <Text style={[styles.title, isHighContrast && styles.titleHighContrast]}>
            Search Guides
          </Text>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearchSubmit}
          suggestions={searchIndexer ? searchIndexer.getSuggestions(searchQuery) : []}
          recentSearches={recentSearches}
          onSuggestionPress={handleSuggestionPress}
          autoFocus={true}
        />

        <FlatList
          data={CATEGORY_FILTERS}
          renderItem={renderCategoryFilter}
          keyExtractor={(item) => item.label}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          contentContainerStyle={styles.filterListContent}
        />

        {isSearching ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={getGuidesFromResults()}
            renderItem={renderGuideCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsList}
            ListEmptyComponent={renderEmptyState()}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default GuideSearchScreen;
