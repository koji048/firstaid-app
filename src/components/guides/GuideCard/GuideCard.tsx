import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Haptics from 'react-native-haptic-feedback';
import { FirstAidGuide } from '../../../types';
import { GuideCategory } from '../../../types/guideContent';
import { styles } from './GuideCard.styles';

export interface GuideCardProps {
  guide: FirstAidGuide;
  onPress: () => void;
  onBookmarkToggle?: (guideId: string) => void;
  isBookmarked?: boolean;
  testID?: string;
}

const SEVERITY_CONFIG = {
  critical: {
    color: '#da1e28',
    icon: 'error',
    label: 'CRITICAL',
  },
  high: {
    color: '#f1620e',
    icon: 'warning',
    label: 'HIGH',
  },
  medium: {
    color: '#f1c21b',
    icon: 'info',
    label: 'MEDIUM',
  },
  low: {
    color: '#0f62fe',
    icon: 'info-outline',
    label: 'LOW',
  },
};

const CATEGORY_ICONS: Record<string, { icon: string; type: string }> = {
  [GuideCategory.BASIC_LIFE_SUPPORT]: { icon: 'favorite', type: 'material' },
  [GuideCategory.WOUNDS_BLEEDING]: { icon: 'healing', type: 'material' },
  [GuideCategory.BURNS_SCALDS]: { icon: 'whatshot', type: 'material' },
  [GuideCategory.FRACTURES_SPRAINS]: { icon: 'bone', type: 'material-community' },
  [GuideCategory.MEDICAL_EMERGENCIES]: { icon: 'local-hospital', type: 'material' },
  [GuideCategory.ENVIRONMENTAL_EMERGENCIES]: { icon: 'wb-sunny', type: 'material' },
  [GuideCategory.POISONING_OVERDOSE]: { icon: 'warning', type: 'material' },
  [GuideCategory.PEDIATRIC_EMERGENCIES]: { icon: 'child-care', type: 'material' },
};

const calculateReadTime = (guide: FirstAidGuide): number => {
  const stepsCount = guide.content?.steps?.length || 0;
  const warningsCount = guide.content?.warnings?.length || 0;
  const whenToSeekHelpCount = guide.content?.whenToSeekHelp?.length || 0;

  const totalItems = stepsCount + warningsCount + whenToSeekHelpCount;
  return Math.max(1, Math.ceil(totalItems * 0.5));
};

export const GuideCard: React.FC<GuideCardProps> = memo(
  ({ guide, onPress, onBookmarkToggle, isBookmarked = false, testID = 'guide-card' }) => {
    const severityConfig = SEVERITY_CONFIG[guide.severity];
    const categoryIcon = CATEGORY_ICONS[guide.category] || { icon: 'article', type: 'material' };
    const readTime = calculateReadTime(guide);

    const handlePress = () => {
      Haptics.trigger('impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      onPress();
    };

    const handleBookmarkToggle = () => {
      if (onBookmarkToggle) {
        Haptics.trigger('impactLight', {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
        onBookmarkToggle(guide.id);
      }
    };

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
        testID={testID}
        accessible={true}
        accessibilityLabel={`${guide.title}. ${severityConfig.label} severity. ${guide.summary}. ${readTime} minute read.`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view full guide"
      >
        <View
          style={[styles.severityIndicator, { backgroundColor: severityConfig.color }]}
          testID="severity-indicator"
        />

        <View style={styles.headerRow}>
          <View style={[styles.severityBadge, { backgroundColor: `${severityConfig.color}15` }]}>
            <Icon
              name={severityConfig.icon}
              type="material"
              size={16}
              color={severityConfig.color}
            />
            <Text style={[styles.severityText, { color: severityConfig.color }]}>
              {severityConfig.label}
            </Text>
          </View>

          <View style={styles.offlineBadge} testID="offline-badge">
            <Icon name="offline-pin" type="material" size={16} color="#24a148" />
            <Text style={styles.offlineText}>OFFLINE</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {guide.title}
        </Text>

        <Text style={styles.summary} numberOfLines={2}>
          {guide.summary}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.metaContainer}>
            <Icon
              name={categoryIcon.icon}
              type={categoryIcon.type}
              size={16}
              color="#6f6f6f"
              style={styles.categoryIcon}
            />
            <Text style={styles.category}>{guide.category.replace(/_/g, ' ')}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.readTime}>{readTime} min read</Text>
          </View>

          {onBookmarkToggle && (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={handleBookmarkToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              testID="bookmark-button"
              accessible={true}
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              accessibilityRole="button"
            >
              <Icon
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                type="material"
                size={24}
                color={isBookmarked ? '#0f62fe' : '#6f6f6f'}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

GuideCard.displayName = 'GuideCard';
