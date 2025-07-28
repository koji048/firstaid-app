import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Haptics from 'react-native-haptic-feedback';
import { GuideCategory } from '../../../types/guideContent';
import { styles } from './CategoryCard.styles';

export interface CategoryCardProps {
  category: GuideCategory;
  guideCount: number;
  onPress: () => void;
  testID?: string;
}

const CATEGORY_CONFIG: Record<
  GuideCategory,
  {
    title: string;
    icon: string;
    iconType: string;
    color: string;
    description: string;
  }
> = {
  [GuideCategory.BASIC_LIFE_SUPPORT]: {
    title: 'Basic Life Support',
    icon: 'favorite',
    iconType: 'material',
    color: '#da1e28',
    description: 'CPR, choking, recovery position',
  },
  [GuideCategory.WOUNDS_BLEEDING]: {
    title: 'Wounds & Bleeding',
    icon: 'healing',
    iconType: 'material',
    color: '#f1620e',
    description: 'Cuts, bleeding control, wound care',
  },
  [GuideCategory.BURNS_SCALDS]: {
    title: 'Burns & Scalds',
    icon: 'whatshot',
    iconType: 'material',
    color: '#f1c21b',
    description: 'Thermal, chemical, electrical burns',
  },
  [GuideCategory.FRACTURES_SPRAINS]: {
    title: 'Fractures & Sprains',
    icon: 'bone',
    iconType: 'material-community',
    color: '#8a3ffc',
    description: 'Broken bones, joint injuries',
  },
  [GuideCategory.MEDICAL_EMERGENCIES]: {
    title: 'Medical Emergencies',
    icon: 'local-hospital',
    iconType: 'material',
    color: '#f1620e',
    description: 'Heart, stroke, diabetic emergencies',
  },
  [GuideCategory.ENVIRONMENTAL_EMERGENCIES]: {
    title: 'Environmental',
    icon: 'wb-sunny',
    iconType: 'material',
    color: '#0f62fe',
    description: 'Heat, cold, weather injuries',
  },
  [GuideCategory.POISONING_OVERDOSE]: {
    title: 'Poisoning & Overdose',
    icon: 'warning',
    iconType: 'material',
    color: '#da1e28',
    description: 'Toxic exposure, drug overdose',
  },
  [GuideCategory.PEDIATRIC_EMERGENCIES]: {
    title: 'Child Emergencies',
    icon: 'child-care',
    iconType: 'material',
    color: '#24a148',
    description: 'Infant & child specific care',
  },
};

export const CategoryCard: React.FC<CategoryCardProps> = memo(
  ({ category, guideCount, onPress, testID = 'category-card' }) => {
    const config = CATEGORY_CONFIG[category];

    const handlePress = () => {
      Haptics.trigger('impactMedium', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      onPress();
    };

    const severityIndicatorColor =
      category === GuideCategory.BASIC_LIFE_SUPPORT || category === GuideCategory.POISONING_OVERDOSE
        ? '#da1e28'
        : category === GuideCategory.MEDICAL_EMERGENCIES ||
          category === GuideCategory.WOUNDS_BLEEDING
        ? '#f1620e'
        : category === GuideCategory.BURNS_SCALDS
        ? '#f1c21b'
        : '#0f62fe';

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
        testID={testID}
        accessible={true}
        accessibilityLabel={`${config.title} category with ${guideCount} guides. ${config.description}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view guides in this category"
      >
        <View
          style={[styles.severityIndicator, { backgroundColor: severityIndicatorColor }]}
          testID="severity-indicator"
        />

        <View style={[styles.iconContainer, { backgroundColor: `${config.color}15` }]}>
          <Icon
            name={config.icon}
            type={config.iconType}
            size={32}
            color={config.color}
            testID="category-icon"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {config.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {config.description}
          </Text>
          <Text style={styles.guideCount}>{guideCount} guides</Text>
        </View>

        <Icon
          name="chevron-right"
          type="material"
          size={24}
          color="#525252"
          style={styles.chevron}
        />
      </TouchableOpacity>
    );
  },
);

CategoryCard.displayName = 'CategoryCard';
