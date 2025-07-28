import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShakeDetectionService } from '../../services/shakeDetection';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  loadGuidesFromContent,
  selectFrequentlyAccessedGuides,
  selectGuideCategoriesWithCounts,
  selectRecentGuides,
  setSelectedCategory,
} from '../../store/slices/guidesSlice';
import { GuideContentService } from '../../services/guideContentService';
import { CategoryCard } from '../../components/guides/CategoryCard';
import { GuideCard } from '../../components/guides/GuideCard';
import { QuickActionsBar } from '../../components/guides/QuickActionsBar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { GuideCategory } from '../../types/guideContent';
import { FirstAidGuide } from '../../types';
import { trackScreen } from '../../utils/analytics';
import styles from './GuidesListScreen.styles';

const CRITICAL_GUIDE_IDS = ['adult-cpr', 'choking-adult', 'severe-bleeding', 'heart-attack'];
const HIGH_CONTRAST_KEY = '@high_contrast_mode';

const GuidesListScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const categoriesWithCounts = useAppSelector(selectGuideCategoriesWithCounts);
  const recentGuides = useAppSelector(selectRecentGuides);
  const frequentGuides = useAppSelector(selectFrequentlyAccessedGuides);
  const guides = useAppSelector((state) => state.guides.guides);
  const contentLoaded = useAppSelector((state) => state.guides.contentLoaded);

  useEffect(() => {
    trackScreen('GuidesListScreen');
    loadHighContrastSetting();
    loadGuidesContent();

    const unsubscribe = ShakeDetectionService.addListener(() => {
      handleShakeReset();
    });

    // Start shake detection if not already active
    if (!ShakeDetectionService.isActive()) {
      ShakeDetectionService.start();
    }

    return unsubscribe;
  }, [handleShakeReset, loadGuidesContent]);

  const loadHighContrastSetting = async () => {
    try {
      const value = await AsyncStorage.getItem(HIGH_CONTRAST_KEY);
      setIsHighContrast(value === 'true');
    } catch (error) {
      console.error('Error loading high contrast setting:', error);
    }
  };

  const loadGuidesContent = async () => {
    if (!contentLoaded) {
      try {
        setIsLoading(true);
        const { guides: loadedGuides, categories } = await GuideContentService.loadAllGuides();
        dispatch(loadGuidesFromContent({ guides: loadedGuides, categories }));
      } catch (error) {
        console.error('Error loading guides:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadGuidesContent();
    setIsRefreshing(false);
  }, [contentLoaded, loadGuidesContent]);

  const handleCategoryPress = (category: GuideCategory) => {
    dispatch(setSelectedCategory(category));
    navigation.navigate('GuidesList', { category });
  };

  const handleGuidePress = (guide: FirstAidGuide) => {
    navigation.navigate('GuideDetail', { guideId: guide.id });
  };

  const handleSearchPress = () => {
    navigation.navigate('GuideSearch');
  };

  const handleShakeReset = () => {
    navigation.navigate('GuidesMain');
  };

  const toggleHighContrast = async (value: boolean) => {
    setIsHighContrast(value);
    try {
      await AsyncStorage.setItem(HIGH_CONTRAST_KEY, value.toString());
    } catch (error) {
      console.error('Error saving high contrast setting:', error);
    }
  };

  const getCriticalGuides = (): FirstAidGuide[] => {
    return CRITICAL_GUIDE_IDS.map((id) => guides.find((g) => g.id === id)).filter(
      (guide): guide is FirstAidGuide => guide !== undefined,
    );
  };

  const renderCategoryCard = ({ item }: { item: { category: GuideCategory; count: number } }) => (
    <CategoryCard
      category={item.category}
      guideCount={item.count}
      onPress={() => handleCategoryPress(item.category)}
    />
  );

  const renderGuideCard = ({ item }: { item: FirstAidGuide }) => (
    <GuideCard guide={item} onPress={() => handleGuidePress(item)} />
  );

  const renderHorizontalGuideCard = ({ item }: { item: FirstAidGuide }) => (
    <View style={styles.horizontalCardWrapper}>
      <GuideCard guide={item} onPress={() => handleGuidePress(item)} />
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const containerStyle = [styles.container, isHighContrast && styles.containerHighContrast];
  const headerStyle = [styles.header, isHighContrast && styles.headerHighContrast];
  const titleStyle = [styles.title, isHighContrast && styles.titleHighContrast];
  const sectionTitleStyle = [
    styles.sectionTitle,
    isHighContrast && styles.sectionTitleHighContrast,
  ];

  return (
    <SafeAreaView style={containerStyle}>
      <StatusBar
        barStyle={isHighContrast ? 'light-content' : 'dark-content'}
        backgroundColor={isHighContrast ? '#000000' : '#ffffff'}
      />

      <View style={headerStyle}>
        <Text style={titleStyle}>First Aid Guides</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearchPress}
            testID="search-button"
            accessible={true}
            accessibilityLabel="Search guides"
            accessibilityRole="button"
          >
            <Icon
              name="search"
              type="material"
              size={24}
              color={isHighContrast ? '#ffffff' : '#161616'}
            />
          </TouchableOpacity>
          <View style={styles.contrastToggle}>
            <Icon
              name="contrast"
              type="material"
              size={20}
              color={isHighContrast ? '#ffffff' : '#161616'}
              style={styles.contrastIcon}
            />
            <Switch
              value={isHighContrast}
              onValueChange={toggleHighContrast}
              trackColor={{ false: '#e0e0e0', true: '#0f62fe' }}
              thumbColor="#ffffff"
              testID="high-contrast-toggle"
              accessible={true}
              accessibilityLabel="High contrast mode"
              accessibilityRole="switch"
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0f62fe']}
            tintColor="#0f62fe"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <QuickActionsBar />

        <View style={styles.section}>
          <Text style={sectionTitleStyle}>Most Critical</Text>
          <FlatList
            data={getCriticalGuides()}
            renderItem={renderHorizontalGuideCard}
            keyExtractor={(item) => `critical-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        <View style={styles.section}>
          <Text style={sectionTitleStyle}>Categories</Text>
          <FlatList
            data={categoriesWithCounts}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.category}
            scrollEnabled={false}
          />
        </View>

        {recentGuides.length > 0 && (
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>Recent</Text>
            <FlatList
              data={recentGuides}
              renderItem={renderHorizontalGuideCard}
              keyExtractor={(item) => `recent-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {frequentGuides.length > 0 && (
          <View style={styles.section}>
            <Text style={sectionTitleStyle}>Frequently Accessed</Text>
            <FlatList
              data={frequentGuides}
              renderItem={renderGuideCard}
              keyExtractor={(item) => `frequent-${item.id}`}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GuidesListScreen;
