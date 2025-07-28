import React, { memo, useCallback } from 'react';
import { Share, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Haptics from 'react-native-haptic-feedback';
import { FirstAidGuide } from '@types/index';
import { getCategoryConfig } from '@utils/categoryHelpers';
import { styles } from './GuideHeader.styles';

interface GuideHeaderProps {
  guide: FirstAidGuide;
  isBookmarked: boolean;
  isHighContrast?: boolean;
  onBookmarkToggle: () => void;
  onSharePress?: () => void;
  testID?: string;
}

export const GuideHeader: React.FC<GuideHeaderProps> = memo(
  ({ guide, isBookmarked, isHighContrast = false, onBookmarkToggle, onSharePress, testID }) => {
    const categoryConfig = getCategoryConfig(guide.category);

    const calculateReadTime = (): number => {
      const stepsTime = guide.content.steps.reduce((total, step) => {
        return total + (step.duration || 60); // Default 60 seconds per step
      }, 0);
      return Math.ceil(stepsTime / 60); // Convert to minutes
    };

    const handleBookmarkPress = useCallback(() => {
      Haptics.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      onBookmarkToggle();
    }, [onBookmarkToggle]);

    const handleSharePress = useCallback(async () => {
      Haptics.trigger('impactLight');

      const shareContent = {
        title: guide.title,
        message: `${guide.title}\n\n${guide.summary}\n\nFirst Aid Guide from First Aid Room App\n\nDISCLAIMER: This information is for emergency guidance only. Always seek professional medical help.`,
        url: `firstaidroom://guide/${guide.id}`, // Deep link for future implementation
      };

      try {
        await Share.share({
          message: shareContent.message,
          title: shareContent.title,
        });
        onSharePress?.();
      } catch (error) {
        console.error('Error sharing guide:', error);
      }
    }, [guide, onSharePress]);

    const readTime = calculateReadTime();

    return (
      <View
        style={[styles.container, isHighContrast && styles.containerHighContrast]}
        testID={testID}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, isHighContrast && styles.titleHighContrast]}>
              {guide.title}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBookmarkPress}
              testID="bookmark-button"
              accessible={true}
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              accessibilityRole="button"
            >
              <Icon
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                type="material"
                size={24}
                color={
                  isBookmarked ? styles.bookmarked.color : isHighContrast ? '#FFFFFF' : '#525252'
                }
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSharePress}
              testID="share-button"
              accessible={true}
              accessibilityLabel="Share guide"
              accessibilityRole="button"
            >
              <Icon
                name="share"
                type="material"
                size={24}
                color={isHighContrast ? '#FFFFFF' : '#525252'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.metaContainer}>
          <View
            style={[
              styles.categoryBadge,
              { borderColor: categoryConfig.color },
              isHighContrast && { borderColor: '#FFFFFF' },
            ]}
            testID="category-badge"
          >
            <View style={[styles.severityIndicator, { backgroundColor: categoryConfig.color }]} />
            <Text style={[styles.categoryText, isHighContrast && styles.categoryTextHighContrast]}>
              {categoryConfig.name.toLowerCase()}
            </Text>
          </View>
          <Text style={[styles.timeEstimate, isHighContrast && styles.timeEstimateHighContrast]}>
            {readTime} min read
          </Text>
        </View>
      </View>
    );
  },
);

GuideHeader.displayName = 'GuideHeader';
