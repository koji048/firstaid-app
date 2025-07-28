import React, { memo, useEffect, useRef, useState } from 'react';
import { Animated, Platform, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { PhoneService } from '../../../services/phone';
import { styles } from './EmergencyServicesButton.styles';

export interface EmergencyServicesButtonProps {
  disabled?: boolean;
  onPress?: () => void;
  onCallInitiated?: () => void;
  onCallCompleted?: (success: boolean) => void;
  testID?: string;
}

const EMERGENCY_NUMBER = '911';
const PULSE_DURATION = 1500;
const HAPTIC_PATTERN = Platform.OS === 'ios' ? 10 : [0, 50]; // iOS doesn't use pattern arrays

export const EmergencyServicesButton = memo<EmergencyServicesButtonProps>(
  ({
    disabled = false,
    onPress,
    onCallInitiated,
    onCallCompleted,
    testID = 'emergency-services-button',
  }) => {
    const [isDialing, setIsDialing] = useState(false);
    const isEmergencyMode = useSelector((state: RootState) => state.emergency.isEmergencyMode);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (!disabled) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: PULSE_DURATION / 2,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: PULSE_DURATION / 2,
              useNativeDriver: true,
            }),
          ]),
        );
        pulseAnimation.start();

        return () => {
          pulseAnimation.stop();
        };
      }
    }, [disabled, pulseAnim]);

    const handlePress = async () => {
      if (disabled || isDialing) {
        return;
      }

      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate(HAPTIC_PATTERN as number);
      } else {
        Vibration.vibrate(HAPTIC_PATTERN as number[]);
      }

      if (onPress) {
        onPress();
        return;
      }

      // In emergency mode, bypass confirmation
      if (isEmergencyMode) {
        await makeEmergencyCall();
      } else {
        // Normal mode - would typically show confirmation modal
        await makeEmergencyCall();
      }
    };

    const makeEmergencyCall = async () => {
      setIsDialing(true);
      onCallInitiated?.();

      try {
        const result = await PhoneService.makeEmergencyCall(EMERGENCY_NUMBER);
        onCallCompleted?.(result.success);

        if (!result.success && result.error) {
          PhoneService.handleCallError(result.error, 'Emergency Services');
        }
      } catch (error) {
        onCallCompleted?.(false);
        PhoneService.handleCallError('Failed to call emergency services', 'Emergency Services');
      } finally {
        setIsDialing(false);
      }
    };

    const isDisabled = disabled || isDialing;
    const containerStyle = [
      styles.container,
      isEmergencyMode && styles.emergencyModeContainer,
      isDisabled && styles.disabled,
    ];

    return (
      <Animated.View
        style={[
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={containerStyle}
          onPress={handlePress}
          disabled={isDisabled}
          activeOpacity={0.8}
          testID={testID}
          accessibilityLabel="Call emergency services 911"
          accessibilityRole="button"
          accessibilityHint="Double tap to call 911"
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon
                name="phone"
                type="material"
                size={36}
                color="#ffffff"
                testID="emergency-icon"
              />
              <View style={styles.emergencyBadge}>
                <Text style={styles.emergencyBadgeText}>911</Text>
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.emergencyLabel}>EMERGENCY</Text>
              <Text style={styles.callText}>Call 911</Text>
              {isEmergencyMode && <Text style={styles.modeText}>One-tap dialing active</Text>}
            </View>

            {isDialing && (
              <View style={styles.dialingIndicator}>
                <Text style={styles.dialingText}>Calling...</Text>
              </View>
            )}
          </View>

          {!isDisabled && <View style={styles.pulseRing} />}
        </TouchableOpacity>
      </Animated.View>
    );
  },
);

EmergencyServicesButton.displayName = 'EmergencyServicesButton';
