import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShakeDetectionService } from '@services/shakeDetection';
import Haptics from 'react-native-haptic-feedback';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  addToRecentGuides,
  incrementViewCount,
  selectBookmarkedGuideIds,
  setCurrentGuide,
  toggleBookmark,
} from '@store/slices/guidesSlice';
import { selectIsEmergencyMode } from '@store/slices/emergencyContactsSlice';
import { GuideContentService } from '@services/guideContentService';
import { PhoneService } from '@services/phone';
import { GuideHeader } from '@components/guides/GuideHeader';
import { StepNavigator } from '@components/guides/StepNavigator';
import { StepContent } from '@components/guides/StepContent';
import { GuideWarnings } from '@components/guides/GuideWarnings';
import { TextSize, TextSizeControl } from '@components/guides/TextSizeControl';
import { LoadingSpinner } from '@components/common/LoadingSpinner';
import { FirstAidGuide } from '@types/index';
import { trackEvent, trackGuideView } from '@utils/analytics';
import { Colors } from '@styles/theme';
import { styles } from './GuideDetailScreen.styles';

interface RouteParams {
  guideId: string;
}

const HIGH_CONTRAST_KEY = '@high_contrast_mode';
const LAST_VIEWED_STEP_KEY = '@last_viewed_step_';
const VIEW_ALL_STEPS_KEY = '@view_all_steps_preference';

const GuideDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useAppDispatch();
  const { guideId } = route.params as RouteParams;

  const [guide, setGuide] = useState<FirstAidGuide | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>('normal');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookmarkedIds = useAppSelector(selectBookmarkedGuideIds);
  const isEmergencyMode = useAppSelector(selectIsEmergencyMode);
  const isBookmarked = bookmarkedIds.includes(guideId);

  // Load guide and preferences on mount
  useEffect(() => {
    loadGuide();
    loadPreferences();
    setupShakeListener();

    return () => {
      saveLastViewedStep();
    };
  }, [guideId]);

  // Update navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: guide?.title || 'First Aid Guide',
      headerRight: () => (
        <TouchableOpacity
          onPress={handleHighContrastToggle}
          style={{ marginRight: 16 }}
          testID="high-contrast-toggle"
        >
          <Icon
            name="contrast"
            type="material"
            size={24}
            color={isHighContrast ? '#FFFFFF' : '#0f62fe'}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, guide, isHighContrast]);

  const loadGuide = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const guideService = GuideContentService.getInstance();
      const loadedGuide = guideService.getGuideById(guideId);

      if (!loadedGuide) {
        throw new Error('Guide not found');
      }

      setGuide(loadedGuide);
      dispatch(setCurrentGuide(loadedGuide));
      dispatch(addToRecentGuides(guideId));
      dispatch(incrementViewCount(guideId));

      trackGuideView(guideId, loadedGuide.title);

      // Load last viewed step
      const lastStep = await AsyncStorage.getItem(`${LAST_VIEWED_STEP_KEY}${guideId}`);
      if (lastStep) {
        setCurrentStep(parseInt(lastStep, 10));
      }
    } catch (error) {
      console.error('Error loading guide:', error);
      setError('Failed to load guide. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const [highContrast, viewAllSteps] = await Promise.all([
        AsyncStorage.getItem(HIGH_CONTRAST_KEY),
        AsyncStorage.getItem(VIEW_ALL_STEPS_KEY),
      ]);

      if (highContrast === 'true') {
        setIsHighContrast(true);
      }
      if (viewAllSteps === 'true') {
        setShowAllSteps(true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const setupShakeListener = () => {
    const unsubscribe = ShakeDetectionService.addListener(() => {
      Haptics.trigger('impactMedium');
      setCurrentStep(1);
      trackEvent('guide_shake_reset', { guideId });
    });

    // Start shake detection if not already active
    if (!ShakeDetectionService.isActive()) {
      ShakeDetectionService.start();
    }

    return unsubscribe;
  };

  const saveLastViewedStep = async () => {
    try {
      await AsyncStorage.setItem(`${LAST_VIEWED_STEP_KEY}${guideId}`, currentStep.toString());
    } catch (error) {
      console.error('Error saving last viewed step:', error);
    }
  };

  const handleStepChange = useCallback(
    (step: number) => {
      setCurrentStep(step);
      trackEvent('guide_step_change', { guideId, step });
    },
    [guideId],
  );

  const handleToggleViewAll = useCallback(async () => {
    const newValue = !showAllSteps;
    setShowAllSteps(newValue);

    try {
      await AsyncStorage.setItem(VIEW_ALL_STEPS_KEY, newValue.toString());
    } catch (error) {
      console.error('Error saving view all preference:', error);
    }

    trackEvent('guide_view_all_toggle', { guideId, viewAll: newValue });
  }, [showAllSteps, guideId]);

  const handleBookmarkToggle = useCallback(() => {
    dispatch(toggleBookmark(guideId));
    trackEvent('guide_bookmark_toggle', { guideId, bookmarked: !isBookmarked });
  }, [dispatch, guideId, isBookmarked]);

  const handleHighContrastToggle = useCallback(async () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);

    try {
      await AsyncStorage.setItem(HIGH_CONTRAST_KEY, newValue.toString());
    } catch (error) {
      console.error('Error saving high contrast preference:', error);
    }

    Haptics.trigger('impactLight');
  }, [isHighContrast]);

  const handleEmergencyDial = useCallback(async () => {
    Alert.alert('Emergency Call', 'Call 911 for emergency assistance?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call 911',
        style: 'destructive',
        onPress: async () => {
          try {
            await PhoneService.makePhoneCall('911', 'Emergency Services');
            trackEvent('emergency_dial_from_guide', { guideId });
          } catch (error) {
            Alert.alert('Error', 'Unable to make emergency call');
          }
        },
      },
    ]);
  }, [guideId]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadGuide();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="loading-spinner">
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !guide) {
    return (
      <View style={[styles.errorContainer, isHighContrast && styles.containerHighContrast]}>
        <Icon
          name="error-outline"
          type="material"
          size={64}
          color={isHighContrast ? '#FFFFFF' : '#6f6f6f'}
        />
        <Text style={[styles.errorText, isHighContrast && styles.errorTextHighContrast]}>
          {error || 'Guide not found'}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, isHighContrast && styles.retryButtonHighContrast]}
          onPress={loadGuide}
        >
          <Text
            style={[styles.retryButtonText, isHighContrast && styles.retryButtonTextHighContrast]}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isHighContrast && styles.containerHighContrast]}>
      <StatusBar
        barStyle={isHighContrast ? 'light-content' : 'dark-content'}
        backgroundColor={isHighContrast ? '#000000' : '#ffffff'}
      />

      {isEmergencyMode && (
        <View
          style={[styles.emergencyBanner, isHighContrast && styles.emergencyBannerHighContrast]}
        >
          <Icon
            name="warning"
            type="material"
            size={20}
            color={isHighContrast ? '#000000' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.emergencyBannerText,
              isHighContrast && styles.emergencyBannerTextHighContrast,
            ]}
          >
            EMERGENCY MODE ACTIVE
          </Text>
        </View>
      )}

      <GuideHeader
        guide={guide}
        isBookmarked={isBookmarked}
        isHighContrast={isHighContrast}
        onBookmarkToggle={handleBookmarkToggle}
        testID="guide-header"
      />

      <ScrollView
        style={styles.content}
        testID="refreshControl"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={isHighContrast ? '#FFFFFF' : Colors.primary}
          />
        }
      >
        <TextSizeControl
          currentSize={textSize}
          isHighContrast={isHighContrast}
          onSizeChange={setTextSize}
          testID="text-size-control"
        />

        {showAllSteps ? (
          <View style={styles.allStepsContainer}>
            {guide.content.steps.map((step, index) => (
              <StepContent
                key={step.order}
                step={step}
                stepNumber={index + 1}
                isHighContrast={isHighContrast}
                textSize={textSize}
                showAllSteps={true}
                testID={`step-content-${index + 1}`}
              />
            ))}
          </View>
        ) : (
          <StepContent
            step={guide.content.steps[currentStep - 1]}
            stepNumber={currentStep}
            isHighContrast={isHighContrast}
            textSize={textSize}
            showAllSteps={false}
            testID="current-step-content"
          />
        )}

        <GuideWarnings
          warnings={guide.content.warnings}
          whenToSeekHelp={guide.content.whenToSeekHelp}
          isHighContrast={isHighContrast}
          testID="guide-warnings"
        />
      </ScrollView>

      <StepNavigator
        currentStep={currentStep}
        totalSteps={guide.content.steps.length}
        isHighContrast={isHighContrast}
        showAllSteps={showAllSteps}
        onStepChange={handleStepChange}
        onToggleViewAll={handleToggleViewAll}
        testID="step-navigator"
      />

      <TouchableOpacity
        style={[styles.emergencyButton, isHighContrast && styles.emergencyButtonHighContrast]}
        onPress={handleEmergencyDial}
        testID="emergency-dial-button"
        accessible={true}
        accessibilityLabel="Call emergency services"
        accessibilityRole="button"
      >
        <Icon
          name="phone"
          type="material"
          size={32}
          color={isHighContrast ? '#000000' : '#FFFFFF'}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default GuideDetailScreen;
