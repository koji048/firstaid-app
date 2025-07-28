import React, { memo, useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Haptics from 'react-native-haptic-feedback';
import { styles } from './TextSizeControl.styles';

export type TextSize = 'normal' | 'large' | 'extra-large';

interface TextSizeControlProps {
  currentSize: TextSize;
  isHighContrast?: boolean;
  onSizeChange: (size: TextSize) => void;
  testID?: string;
}

const TEXT_SIZE_KEY = '@text_size_preference';

const SIZE_OPTIONS: { value: TextSize; label: string; icon: string }[] = [
  { value: 'normal', label: 'A', icon: 'text-fields' },
  { value: 'large', label: 'A+', icon: 'text-fields' },
  { value: 'extra-large', label: 'A++', icon: 'text-fields' },
];

export const TextSizeControl: React.FC<TextSizeControlProps> = memo(
  ({ currentSize, isHighContrast = false, onSizeChange, testID }) => {
    // Load saved preference on mount
    useEffect(() => {
      loadTextSizePreference();
    }, []);

    const loadTextSizePreference = async () => {
      try {
        const savedSize = await AsyncStorage.getItem(TEXT_SIZE_KEY);
        if (savedSize && isValidTextSize(savedSize)) {
          onSizeChange(savedSize as TextSize);
        }
      } catch (error) {
        console.error('Error loading text size preference:', error);
      }
    };

    const isValidTextSize = (size: string): boolean => {
      return ['normal', 'large', 'extra-large'].includes(size);
    };

    const handleSizeChange = useCallback(
      async (size: TextSize) => {
        Haptics.trigger('impactLight');
        onSizeChange(size);

        try {
          await AsyncStorage.setItem(TEXT_SIZE_KEY, size);
        } catch (error) {
          console.error('Error saving text size preference:', error);
        }
      },
      [onSizeChange],
    );

    const getSizeMultiplier = (size: TextSize): number => {
      switch (size) {
        case 'large':
          return 1.2;
        case 'extra-large':
          return 1.4;
        default:
          return 1;
      }
    };

    return (
      <View
        style={[styles.container, isHighContrast && styles.containerHighContrast]}
        testID={testID}
      >
        <Text
          style={[styles.label, isHighContrast && styles.labelHighContrast]}
          accessible={true}
          accessibilityLabel="Text size control"
        >
          Text Size:
        </Text>

        <View style={styles.sizeOptions}>
          {SIZE_OPTIONS.map((option) => {
            const isActive = currentSize === option.value;
            const multiplier = getSizeMultiplier(option.value);

            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sizeButton,
                  isHighContrast && styles.sizeButtonHighContrast,
                  isActive && styles.sizeButtonActive,
                  isActive && isHighContrast && styles.sizeButtonActiveHighContrast,
                ]}
                onPress={() => handleSizeChange(option.value)}
                testID={`size-button-${option.value}`}
                accessible={true}
                accessibilityLabel={`Text size ${option.value}`}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[
                    styles.sizeButtonText,
                    isHighContrast && styles.sizeButtonTextHighContrast,
                    isActive && styles.sizeButtonTextActive,
                    isActive && isHighContrast && styles.sizeButtonTextActiveHighContrast,
                    { fontSize: 14 * multiplier },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sizeIndicator}>
          <Icon
            name="format-size"
            type="material"
            size={20}
            color={isHighContrast ? '#CCCCCC' : '#6f6f6f'}
          />
          <Text
            style={[
              styles.sizePreview,
              styles.sizeButtonText,
              isHighContrast && styles.sizeButtonTextHighContrast,
              { fontSize: 14 * getSizeMultiplier(currentSize) },
            ]}
          >
            {currentSize.replace('-', ' ')}
          </Text>
        </View>
      </View>
    );
  },
);

TextSizeControl.displayName = 'TextSizeControl';
