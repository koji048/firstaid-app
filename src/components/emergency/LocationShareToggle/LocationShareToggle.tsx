import React, { memo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { LocationService } from '../../../services/location';
import { styles } from './LocationShareToggle.styles';

export interface LocationShareToggleProps {
  isEnabled: boolean;
  isTracking: boolean;
  currentLocation: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  } | null;
  error: string | null;
  isEmergencyMode: boolean;
  onToggle: (enabled: boolean) => void;
  onLocationUpdate: (location: any) => void;
  onTrackingChange: (tracking: boolean) => void;
  onError: (error: string | null) => void;
  testID?: string;
}

export const LocationShareToggle: React.FC<LocationShareToggleProps> = memo(
  ({
    isEnabled,
    isTracking,
    currentLocation,
    error,
    isEmergencyMode,
    onToggle,
    onLocationUpdate,
    onTrackingChange,
    onError,
    testID = 'location-share-toggle',
  }) => {
    useEffect(() => {
      let watchId: number | null = null;

      const startLocationTracking = async () => {
        if (isEnabled && isEmergencyMode) {
          onTrackingChange(true);
          onError(null);

          try {
            // First get current location
            const result = await LocationService.getCurrentLocation();
            if (result.success && result.location) {
              onLocationUpdate(result.location);
            } else if (result.error) {
              onError(result.error);
              return;
            }

            // Then start watching for updates
            watchId = await LocationService.startLocationWatch((locationResult) => {
              if (locationResult.success && locationResult.location) {
                onLocationUpdate(locationResult.location);
              } else if (locationResult.error) {
                onError(locationResult.error);
              }
            });

            if (!watchId) {
              onError('Failed to start location tracking');
            }
          } catch (err) {
            onError('Location tracking failed');
          }
        } else {
          onTrackingChange(false);
          LocationService.stopLocationWatch();
        }
      };

      startLocationTracking();

      return () => {
        if (watchId) {
          LocationService.stopLocationWatch();
        }
      };
    }, [isEnabled, isEmergencyMode, onLocationUpdate, onTrackingChange, onError]);

    const handleToggle = async () => {
      if (!isEnabled) {
        // Request permission before enabling
        const hasPermission = await LocationService.requestLocationPermission();
        if (!hasPermission) {
          LocationService.showPermissionDeniedAlert();
          return;
        }
      }

      onToggle(!isEnabled);
    };

    // Only show in emergency mode
    if (!isEmergencyMode) {
      return null;
    }

    const getLocationText = () => {
      if (error) {
        return `Error: ${error}`;
      }
      if (isTracking && !currentLocation) {
        return 'Getting location...';
      }
      if (currentLocation) {
        return LocationService.formatLocation(currentLocation);
      }
      return 'Location sharing disabled';
    };

    const getStatusIcon = () => {
      if (error) {
        return (
          <Icon
            name="location-off"
            type="material"
            size={20}
            color="#da1e28"
            testID="location-error-icon"
          />
        );
      }
      if (isTracking) {
        return <ActivityIndicator size="small" color="#24a148" testID="location-loading" />;
      }
      if (isEnabled && currentLocation) {
        return (
          <Icon
            name="location-on"
            type="material"
            size={20}
            color="#24a148"
            testID="location-active-icon"
          />
        );
      }
      return (
        <Icon
          name="location-off"
          type="material"
          size={20}
          color="#525252"
          testID="location-disabled-icon"
        />
      );
    };

    return (
      <View style={styles.container} testID={testID}>
        <TouchableOpacity
          style={[
            styles.toggleContainer,
            isEnabled ? styles.toggleEnabled : styles.toggleDisabled,
            error && styles.toggleError,
          ]}
          onPress={handleToggle}
          testID="location-toggle-button"
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>{getStatusIcon()}</View>

            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.title,
                  isEnabled ? styles.titleEnabled : styles.titleDisabled,
                  error && styles.titleError,
                ]}
              >
                Location Sharing
              </Text>

              <Text
                style={[
                  styles.status,
                  isEnabled ? styles.statusEnabled : styles.statusDisabled,
                  error && styles.statusError,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getLocationText()}
              </Text>
            </View>

            <View style={styles.switchContainer}>
              <View
                style={[
                  styles.switch,
                  isEnabled ? styles.switchOn : styles.switchOff,
                  error && styles.switchError,
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    isEnabled ? styles.switchThumbOn : styles.switchThumbOff,
                  ]}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {isEnabled && currentLocation && !error && (
          <View style={styles.shareInfo}>
            <Icon name="info" type="material" size={16} color="#0f62fe" style={styles.infoIcon} />
            <Text style={styles.shareInfoText}>
              Your location will be shared when you make emergency calls
            </Text>
          </View>
        )}
      </View>
    );
  },
);

LocationShareToggle.displayName = 'LocationShareToggle';
