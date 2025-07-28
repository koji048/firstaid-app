import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { styles } from './EmergencyModeToggle.styles';

export interface EmergencyModeToggleProps {
  isEmergencyMode: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export const EmergencyModeToggle: React.FC<EmergencyModeToggleProps> = memo(
  ({ isEmergencyMode, onToggle, disabled = false, testID = 'emergency-mode-toggle' }) => {
    const handlePress = () => {
      if (!disabled) {
        onToggle(!isEmergencyMode);
      }
    };

    const buttonStyle = [
      styles.container,
      isEmergencyMode ? styles.emergencyActive : styles.emergencyInactive,
      disabled && styles.disabled,
    ];

    const iconColor = isEmergencyMode ? '#ffffff' : '#da1e28';
    const iconName = isEmergencyMode ? 'emergency' : 'emergency-outlined';

    return (
      <View style={styles.wrapper} testID={testID}>
        <TouchableOpacity
          style={buttonStyle}
          onPress={handlePress}
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
                {isEmergencyMode ? 'One-tap calling enabled' : 'Tap to enable quick dial'}
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
