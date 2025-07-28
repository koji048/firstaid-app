import React, { memo, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Alert,
  Linking,
  Vibration,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import Haptics from 'react-native-haptic-feedback';
import { RootState } from '../../../store/store';
import { toggleEmergencyMode } from '../../../store/slices/emergencySlice';
import { styles } from './GlobalEmergencyButton.styles';

export interface GlobalEmergencyButtonProps {
  emergencyNumber?: string;
  testID?: string;
}

export const GlobalEmergencyButton: React.FC<GlobalEmergencyButtonProps> = memo(
  ({ emergencyNumber = '911', testID = 'global-emergency-button' }) => {
    const dispatch = useDispatch();
    const { isEmergencyMode, primaryContact } = useSelector(
      (state: RootState) => state.emergency,
    );

    const triggerHapticFeedback = useCallback(() => {
      if (Platform.OS === 'ios') {
        Haptics.trigger('impactHeavy', {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        });
      } else {
        Vibration.vibrate([0, 100, 50, 100]);
      }
    }, []);

    const handleEmergencyCall = useCallback(() => {
      triggerHapticFeedback();
      
      const contactToCall = primaryContact || { name: 'Emergency Services', phone: emergencyNumber };
      
      Alert.alert(
        'Emergency Call',
        `Call ${contactToCall.name} at ${contactToCall.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call Now',
            style: 'destructive',
            onPress: () => {
              const phoneUrl = `tel:${contactToCall.phone}`;
              Linking.openURL(phoneUrl).catch((err) => {
                Alert.alert(
                  'Call Failed',
                  'Unable to make phone call. Please check your phone app.',
                );
                console.error('Call error:', err);
              });
            },
          },
        ],
        { cancelable: true },
      );
    }, [primaryContact, emergencyNumber, triggerHapticFeedback]);

    const handleLongPress = useCallback(() => {
      triggerHapticFeedback();
      
      if (!isEmergencyMode) {
        Alert.alert(
          'Enable Emergency Mode',
          'This will enable one-tap calling and quick access to emergency features.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable',
              style: 'default',
              onPress: () => {
                dispatch(toggleEmergencyMode(true));
              },
            },
          ],
        );
      } else {
        // In emergency mode, long press calls immediately
        handleEmergencyCall();
      }
    }, [isEmergencyMode, dispatch, handleEmergencyCall, triggerHapticFeedback]);

    const handlePress = useCallback(() => {
      if (isEmergencyMode) {
        // In emergency mode, single tap calls
        handleEmergencyCall();
      } else {
        // In normal mode, single tap shows options
        Alert.alert(
          'Emergency Options',
          'Choose an emergency action:',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Call Emergency Services',
              style: 'destructive',
              onPress: handleEmergencyCall,
            },
            {
              text: 'Enable Emergency Mode',
              style: 'default',
              onPress: () => {
                dispatch(toggleEmergencyMode(true));
              },
            },
          ],
          { cancelable: true },
        );
      }
    }, [isEmergencyMode, handleEmergencyCall, dispatch]);

    const buttonStyle = [
      styles.container,
      isEmergencyMode ? styles.emergencyActive : styles.emergencyInactive,
    ];

    const iconColor = isEmergencyMode ? '#ffffff' : '#ffffff';
    const iconName = isEmergencyMode ? 'emergency' : 'phone';

    return (
      <View style={styles.wrapper} testID={testID}>
        <TouchableOpacity
          style={buttonStyle}
          onPress={handlePress}
          onLongPress={handleLongPress}
          activeOpacity={0.8}
          testID="emergency-button"
          accessible={true}
          accessibilityLabel={
            isEmergencyMode
              ? 'Emergency call button - One tap to call emergency contact'
              : 'Emergency button - Access emergency services'
          }
          accessibilityRole="button"
          accessibilityHint={
            isEmergencyMode
              ? 'Double tap to call, long press for options'
              : 'Double tap for options, long press to enable emergency mode'
          }
        >
          <View style={styles.content}>
            <Icon
              name={iconName}
              type="material"
              size={28}
              color={iconColor}
              testID="emergency-icon"
            />
          </View>

          {isEmergencyMode && (
            <View style={styles.pulseAnimation}>
              <View style={styles.pulseRing} />
              <View style={styles.pulseRingDelay} />
            </View>
          )}
        </TouchableOpacity>

        {isEmergencyMode && (
          <View style={styles.statusIndicator}>
            <Text style={styles.statusText}>EMERGENCY</Text>
          </View>
        )}
      </View>
    );
  },
);

GlobalEmergencyButton.displayName = 'GlobalEmergencyButton';