import React, { memo, useCallback, useState } from 'react';
import { Animated, LayoutAnimation, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Haptics from 'react-native-haptic-feedback';
import { styles } from './GuideWarnings.styles';

interface GuideWarningsProps {
  warnings: string[];
  whenToSeekHelp: string[];
  isHighContrast?: boolean;
  testID?: string;
}

export const GuideWarnings: React.FC<GuideWarningsProps> = memo(
  ({ warnings, whenToSeekHelp, isHighContrast = false, testID }) => {
    const [warningsExpanded, setWarningsExpanded] = useState(true);
    const [emergencyExpanded, setEmergencyExpanded] = useState(true);

    const toggleSection = useCallback(
      (section: 'warnings' | 'emergency') => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        Haptics.trigger('impactLight');

        if (section === 'warnings') {
          setWarningsExpanded(!warningsExpanded);
        } else {
          setEmergencyExpanded(!emergencyExpanded);
        }
      },
      [warningsExpanded, emergencyExpanded],
    );

    const renderWarningItem = (item: string, index: number) => (
      <View key={index} style={styles.warningItem}>
        <View style={styles.warningBullet}>
          <Text style={[styles.warningText, isHighContrast && styles.warningTextHighContrast]}>
            •
          </Text>
        </View>
        <Text
          style={[styles.warningText, isHighContrast && styles.warningTextHighContrast]}
          accessible={true}
          accessibilityLabel={`Warning: ${item}`}
        >
          {item}
        </Text>
      </View>
    );

    const renderSection = (
      title: string,
      items: string[],
      isExpanded: boolean,
      sectionType: 'warnings' | 'emergency',
      iconName: string,
    ) => {
      const isEmergency = sectionType === 'emergency';

      return (
        <View
          style={[
            styles.section,
            isHighContrast && styles.sectionHighContrast,
            isEmergency && styles.emergencySection,
          ]}
        >
          <TouchableOpacity
            style={[
              styles.header,
              isHighContrast && styles.headerHighContrast,
              isEmergency && styles.emergencyHeader,
            ]}
            onPress={() => toggleSection(sectionType)}
            testID={`${sectionType}-header`}
            accessible={true}
            accessibilityLabel={`${title}, ${isExpanded ? 'expanded' : 'collapsed'}, ${
              items.length
            } items`}
            accessibilityRole="button"
            accessibilityState={{ expanded: isExpanded }}
          >
            <View style={styles.headerContent}>
              <Icon
                name={iconName}
                type="material"
                size={24}
                color={isHighContrast ? '#000000' : '#FFFFFF'}
              />
              <Text style={[styles.headerTitle, isHighContrast && styles.headerTitleHighContrast]}>
                {title}
              </Text>
            </View>
            <View style={styles.expandButton}>
              <Icon
                name={isExpanded ? 'expand-less' : 'expand-more'}
                type="material"
                size={24}
                color={isHighContrast ? '#000000' : '#FFFFFF'}
              />
            </View>
            {!isExpanded && (
              <View style={styles.collapsedIndicator}>
                <View
                  style={[styles.indicatorDot, isHighContrast && styles.indicatorDotHighContrast]}
                />
              </View>
            )}
          </TouchableOpacity>
          {isExpanded && <View style={styles.content}>{items.map(renderWarningItem)}</View>}
        </View>
      );
    };

    if (warnings.length === 0 && whenToSeekHelp.length === 0) {
      return null;
    }

    return (
      <View style={styles.container} testID={testID}>
        {warnings.length > 0 &&
          renderSection('Warnings', warnings, warningsExpanded, 'warnings', 'warning')}

        {whenToSeekHelp.length > 0 &&
          renderSection(
            'When to Call Emergency',
            whenToSeekHelp,
            emergencyExpanded,
            'emergency',
            'phone',
          )}
      </View>
    );
  },
);

GuideWarnings.displayName = 'GuideWarnings';
