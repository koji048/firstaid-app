import React, { memo, useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { GuideStep } from '@types/guideContent';
import { createStyles } from './StepContent.styles';

interface StepContentProps {
  step: GuideStep;
  stepNumber: number;
  isHighContrast?: boolean;
  textSize?: 'normal' | 'large' | 'extra-large';
  showAllSteps?: boolean;
  testID?: string;
}

export const StepContent: React.FC<StepContentProps> = memo(
  ({
    step,
    stepNumber,
    isHighContrast = false,
    textSize = 'normal',
    showAllSteps = false,
    testID,
  }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const styles = createStyles(textSize);

    useEffect(() => {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(20);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, [step, fadeAnim, slideAnim]);

    const formatDuration = (seconds?: number): string => {
      if (!seconds) {
        return '';
      }
      if (seconds < 60) {
        return `${seconds} seconds`;
      }
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
      return `${minutes} min ${remainingSeconds} sec`;
    };

    return (
      <Animated.View
        style={[
          styles.container,
          isHighContrast && styles.containerHighContrast,
          !showAllSteps && {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        testID={testID}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepBadge, isHighContrast && styles.stepBadgeHighContrast]}>
              <Text style={[styles.stepNumber, isHighContrast && styles.stepNumberHighContrast]}>
                {stepNumber}
              </Text>
            </View>
            <Text
              style={[styles.stepTitle, isHighContrast && styles.stepTitleHighContrast]}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel={`Step ${stepNumber}: ${step.title}`}
            >
              {step.title}
            </Text>
          </View>

          {step.duration && (
            <View
              style={[styles.durationBadge, isHighContrast && styles.durationBadgeHighContrast]}
            >
              <Icon
                name="schedule"
                type="material"
                size={16}
                color={isHighContrast ? '#CCCCCC' : '#6f6f6f'}
              />
              <Text
                style={[styles.durationText, isHighContrast && styles.durationTextHighContrast]}
              >
                {formatDuration(step.duration)}
              </Text>
            </View>
          )}

          <View style={styles.contentContainer}>
            <Text
              style={[styles.description, isHighContrast && styles.descriptionHighContrast]}
              accessible={true}
              accessibilityLabel={step.description}
            >
              {step.description}
            </Text>

            {step.imageUrl && (
              <View
                style={[
                  styles.imagePlaceholder,
                  isHighContrast && styles.imagePlaceholderHighContrast,
                ]}
                accessible={true}
                accessibilityLabel="Step illustration placeholder"
              >
                <Icon
                  name="image"
                  type="material"
                  size={48}
                  color={isHighContrast ? '#CCCCCC' : '#C6C6C6'}
                />
                <Text
                  style={[
                    styles.imagePlaceholderText,
                    isHighContrast && styles.imagePlaceholderTextHighContrast,
                  ]}
                >
                  Image support coming soon
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    );
  },
);

StepContent.displayName = 'StepContent';
