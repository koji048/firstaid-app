import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Haptics from 'react-native-haptic-feedback';
import { Colors } from '@styles/theme';
import { styles } from './StepNavigator.styles';

interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  isHighContrast?: boolean;
  showAllSteps?: boolean;
  onStepChange: (step: number) => void;
  onToggleViewAll?: () => void;
  testID?: string;
}

export const StepNavigator: React.FC<StepNavigatorProps> = memo(
  ({
    currentStep,
    totalSteps,
    isHighContrast = false,
    showAllSteps = false,
    onStepChange,
    onToggleViewAll,
    testID,
  }) => {
    const progressAnimation = useRef(new Animated.Value(0)).current;
    const swipeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(progressAnimation, {
        toValue: currentStep / totalSteps,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }, [currentStep, totalSteps, progressAnimation]);

    const handlePrevious = useCallback(() => {
      if (currentStep > 1) {
        Haptics.trigger('impactLight');
        onStepChange(currentStep - 1);
      }
    }, [currentStep, onStepChange]);

    const handleNext = useCallback(() => {
      if (currentStep < totalSteps) {
        Haptics.trigger('impactLight');
        onStepChange(currentStep + 1);
      }
    }, [currentStep, totalSteps, onStepChange]);

    const handleToggleViewAll = useCallback(() => {
      Haptics.trigger('impactLight');
      onToggleViewAll?.();
    }, [onToggleViewAll]);

    // Swipe gesture handling
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 5;
        },
        onPanResponderMove: (_, gestureState) => {
          swipeAnimation.setValue(gestureState.dx);
        },
        onPanResponderRelease: (_, gestureState) => {
          const swipeThreshold = 50;

          if (gestureState.dx > swipeThreshold && currentStep > 1) {
            handlePrevious();
          } else if (gestureState.dx < -swipeThreshold && currentStep < totalSteps) {
            handleNext();
          }

          Animated.spring(swipeAnimation, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    ).current;

    const isPreviousDisabled = currentStep === 1;
    const isNextDisabled = currentStep === totalSteps;

    return (
      <View
        style={[styles.container, isHighContrast && styles.containerHighContrast]}
        testID={testID}
        {...panResponder.panHandlers}
      >
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, isHighContrast && styles.progressBarHighContrast]}
            testID="progress-bar"
          >
            <Animated.View
              style={[
                styles.progressFill,
                isHighContrast && styles.progressFillHighContrast,
                {
                  width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <View style={styles.stepInfo}>
            <Text
              style={[styles.stepText, isHighContrast && styles.stepTextHighContrast]}
              accessible={true}
              accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
            >
              Step {currentStep} of {totalSteps}
            </Text>
            {onToggleViewAll && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={handleToggleViewAll}
                testID="view-all-button"
                accessible={true}
                accessibilityLabel={showAllSteps ? 'Hide all steps' : 'View all steps'}
                accessibilityRole="button"
              >
                <Text
                  style={[styles.viewAllText, isHighContrast && styles.viewAllTextHighContrast]}
                >
                  {showAllSteps ? 'Hide All' : 'View All Steps'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Animated.View
          style={[
            styles.navigationContainer,
            {
              transform: [
                {
                  translateX: swipeAnimation.interpolate({
                    inputRange: [-100, 0, 100],
                    outputRange: [-10, 0, 10],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.navigationButton,
              isHighContrast && styles.navigationButtonHighContrast,
              isPreviousDisabled && styles.navigationButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={isPreviousDisabled}
            testID="previous-button"
            accessible={true}
            accessibilityLabel="Previous step"
            accessibilityRole="button"
            accessibilityState={{ disabled: isPreviousDisabled }}
          >
            <Icon
              name="chevron-left"
              type="material"
              size={24}
              color={
                isPreviousDisabled
                  ? styles.navigationButtonTextDisabled.color
                  : isHighContrast
                  ? '#FFFFFF'
                  : Colors.text
              }
            />
            <Text
              style={[
                styles.navigationButtonText,
                isHighContrast && styles.navigationButtonTextHighContrast,
                isPreviousDisabled && styles.navigationButtonTextDisabled,
              ]}
            >
              Previous
            </Text>
          </TouchableOpacity>

          <Text
            style={[styles.swipeHint, isHighContrast && styles.swipeHintHighContrast]}
            accessible={true}
            accessibilityLabel="Swipe left or right to navigate steps"
          >
            Swipe to navigate
          </Text>

          <TouchableOpacity
            style={[
              styles.navigationButton,
              isHighContrast && styles.navigationButtonHighContrast,
              isNextDisabled && styles.navigationButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={isNextDisabled}
            testID="next-button"
            accessible={true}
            accessibilityLabel={isNextDisabled ? 'Last step' : 'Next step'}
            accessibilityRole="button"
            accessibilityState={{ disabled: isNextDisabled }}
          >
            <Text
              style={[
                styles.navigationButtonText,
                isHighContrast && styles.navigationButtonTextHighContrast,
                isNextDisabled && styles.navigationButtonTextDisabled,
              ]}
            >
              {isNextDisabled ? 'Done' : 'Next'}
            </Text>
            <Icon
              name="chevron-right"
              type="material"
              size={24}
              color={
                isNextDisabled
                  ? styles.navigationButtonTextDisabled.color
                  : isHighContrast
                  ? '#FFFFFF'
                  : Colors.text
              }
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  },
);

StepNavigator.displayName = 'StepNavigator';
