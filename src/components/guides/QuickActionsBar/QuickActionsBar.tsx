import React, { memo } from 'react';
import { Alert, Linking, Share, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import Haptics from 'react-native-haptic-feedback';
import Geolocation from '@react-native-community/geolocation';
import { styles } from './QuickActionsBar.styles';

export interface QuickActionsBarProps {
  onEmergencyDial?: () => void;
  emergencyNumber?: string;
  testID?: string;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = memo(
  ({ onEmergencyDial, emergencyNumber = '911', testID = 'quick-actions-bar' }) => {
    const handleEmergencyDial = () => {
      Haptics.trigger('impactHeavy', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });

      if (onEmergencyDial) {
        onEmergencyDial();
      } else {
        Alert.alert(
          'Emergency Call',
          `Call ${emergencyNumber} for emergency assistance?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Call',
              style: 'destructive',
              onPress: () => {
                Linking.openURL(`tel:${emergencyNumber}`).catch((err) => {
                  Alert.alert('Error', 'Unable to make phone call');
                  console.error('Call error:', err);
                });
              },
            },
          ],
          { cancelable: true },
        );
      }
    };

    const handleShareLocation = () => {
      Haptics.trigger('impactMedium', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          const message = `Emergency! My location: ${locationUrl}`;

          Share.share({
            message,
            title: 'Emergency Location',
          }).catch((err) => {
            if (err && err.message !== 'User did not share') {
              Alert.alert('Error', 'Unable to share location');
              console.error('Share error:', err);
            }
          });
        },
        (error) => {
          Alert.alert(
            'Location Error',
            'Unable to get your location. Please enable location services.',
            [{ text: 'OK' }],
          );
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    };

    return (
      <View style={styles.container} testID={testID}>
        <TouchableOpacity
          style={[styles.actionButton, styles.emergencyButton]}
          onPress={handleEmergencyDial}
          activeOpacity={0.8}
          testID="emergency-dial-button"
          accessible={true}
          accessibilityLabel={`Emergency dial ${emergencyNumber}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to call emergency services"
        >
          <Icon name="phone" type="material" size={24} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.emergencyButtonText}>EMERGENCY DIAL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.locationButton]}
          onPress={handleShareLocation}
          activeOpacity={0.8}
          testID="share-location-button"
          accessible={true}
          accessibilityLabel="Share location"
          accessibilityRole="button"
          accessibilityHint="Double tap to share your current location"
        >
          <Icon
            name="location-on"
            type="material"
            size={24}
            color="#ffffff"
            style={styles.buttonIcon}
          />
          <Text style={styles.locationButtonText}>SHARE LOCATION</Text>
        </TouchableOpacity>
      </View>
    );
  },
);

QuickActionsBar.displayName = 'QuickActionsBar';
