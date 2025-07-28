import React, { memo, useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View, Vibration } from 'react-native';
import { Icon } from 'react-native-elements';
import { ShakeDetectionService } from '../../../services/shakeDetection';
import { styles } from './EmergencyModeToggle.styles';

export interface EmergencyModeToggleProps {
  isEmergencyMode: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  enableShakeActivation?: boolean;
  enableLongPressActivation?: boolean;
  testID?: string;
}

export const EmergencyModeToggle: React.FC<EmergencyModeToggleProps> = memo(
  ({
    isEmergencyMode,
    onToggle,
    disabled = false,
    enableShakeActivation = true,
    enableLongPressActivation = true,
    testID = 'emergency-mode-toggle',
  }) => {
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [isLongPressing, setIsLongPressing] = useState(false);

    // Set up shake detection
    useEffect(() => {
      if (!enableShakeActivation || disabled) {
        return;
      }

      const unsubscribe = ShakeDetectionService.addListener(() => {
        if (!isEmergencyMode) {
          handleShakeActivation();
        }
      });

      // Start shake detection if not already active
      if (!ShakeDetectionService.isActive()) {
        ShakeDetectionService.start({
          threshold: 15,
          minimumShakes: 3,
          timeWindow: 1000,
        });
      }

      return () => {
        unsubscribe();
      };
    }, [enableShakeActivation, disabled, isEmergencyMode]);

    const handlePress = () => {
      if (!disabled) {
        onToggle(!isEmergencyMode);
      }
    };

    const handleShakeActivation = () => {
      Alert.alert(
        'Shake Detected',
        'Enable Emergency Mode for quick access to emergency services?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            style: 'default',
            onPress: () => {
              Vibration.vibrate([0, 100, 50, 100]);
              onToggle(true);
            },
          },
        ],
      );
    };

    const handleLongPressStart = () => {
      if (!enableLongPressActivation || disabled || isEmergencyMode) {
        return;
      }

      setIsLongPressing(true);
      Vibration.vibrate(50);

      const timer = setTimeout(() => {
        setIsLongPressing(false);
        Alert.alert(
          'Long Press Detected',
          'Enable Emergency Mode for quick access to emergency services?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              style: 'default',
              onPress: () => {
                Vibration.vibrate([0, 100, 50, 100]);
                onToggle(true);
              },
            },
          ],
        );
      }, 2000); // 2 second long press

      setLongPressTimer(timer);
    };

    const handleLongPressEnd = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      setIsLongPressing(false);
    };

    const buttonStyle = [
      styles.container,
      isEmergencyMode ? styles.emergencyActive : styles.emergencyInactive,
      disabled && styles.disabled,
      isLongPressing && styles.longPressing,
    ];

    const iconColor = isEmergencyMode ? '#ffffff' : '#da1e28';
    const iconName = isEmergencyMode ? 'emergency' : 'emergency-outlined';

    return (
      <View style={styles.wrapper} testID={testID}>
        <TouchableOpacity
          style={buttonStyle}
          onPress={handlePress}
          onPressIn={handleLongPressStart}
          onPressOut={handleLongPressEnd}
          disabled={disabled}
          activeOpacity={0.8}
          testID="emergency-toggle-button"
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon
                name={iconName}
                type="material"
                size={24}
                color={iconColor}
                testID="emergency-icon"
              />
            </View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.label,
                  isEmergencyMode ? styles.labelActive : styles.labelInactive,
                  disabled && styles.labelDisabled,
                ]}
              >
                Emergency Mode
              </Text>

              <Text
                style={[
                  styles.description,
                  isEmergencyMode ? styles.descriptionActive : styles.descriptionInactive,
                  disabled && styles.descriptionDisabled,
                ]}
              >
                {isLongPressing
                  ? 'Hold to activate...'
                  : isEmergencyMode
                  ? 'One-tap calling enabled'
                  : 'Tap, hold, or shake to enable'}
              </Text>
            </View>

            <View style={styles.switchContainer}>
              <View
                style={[
                  styles.switch,
                  isEmergencyMode ? styles.switchOn : styles.switchOff,
                  disabled && styles.switchDisabled,
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    isEmergencyMode ? styles.switchThumbOn : styles.switchThumbOff,
                  ]}
                />
              </View>
            </View>
          </View>

          {isEmergencyMode && (
            <View style={styles.activeIndicator}>
              <View style={styles.pulseOuter}>
                <View style={styles.pulseInner} />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {isEmergencyMode && (
          <View style={styles.warningBanner}>
            <Icon
              name="warning"
              type="material"
              size={16}
              color="#da1e28"
              style={styles.warningIcon}
            />
            <Text style={styles.warningText}>Emergency mode: One-tap calling is active</Text>
          </View>
        )}
      </View>
    );
  },
);

EmergencyModeToggle.displayName = 'EmergencyModeToggle';
