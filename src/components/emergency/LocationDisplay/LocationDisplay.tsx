import React, { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Clipboard, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { LocationCoordinates, LocationResult, LocationService } from '../../../services/location';
import { styles } from './LocationDisplay.styles';

export interface LocationDisplayProps {
  onLocationUpdate?: (location: LocationCoordinates | null) => void;
  autoFetch?: boolean;
  emergencyMode?: boolean;
  testID?: string;
}

interface LocationState {
  location: LocationCoordinates | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdateTime: Date | null;
}

export const LocationDisplay = memo<LocationDisplayProps>(
  ({ onLocationUpdate, autoFetch = true, emergencyMode = false, testID = 'location-display' }) => {
    const [state, setState] = useState<LocationState>({
      location: null,
      address: null,
      isLoading: false,
      error: null,
      lastUpdateTime: null,
    });

    useEffect(() => {
      if (autoFetch) {
        fetchLocation();
      }
    }, [autoFetch]);

    const fetchLocation = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result: LocationResult = emergencyMode
          ? await LocationService.getEmergencyLocation()
          : await LocationService.getCurrentLocation();

        if (result.success && result.location) {
          setState((prev) => ({
            ...prev,
            location: result.location,
            isLoading: false,
            lastUpdateTime: new Date(),
          }));
          onLocationUpdate?.(result.location);
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: result.error || 'Unable to get location',
          }));
          onLocationUpdate?.(null);
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch location',
        }));
        onLocationUpdate?.(null);
      }
    };

    const copyLocation = () => {
      if (state.location) {
        const locationText = LocationService.formatLocation(state.location);
        Clipboard.setString(locationText);
        Alert.alert('Location Copied', 'Your location has been copied to clipboard', [
          { text: 'OK' },
        ]);
      }
    };

    const getAccuracyLevel = (accuracy?: number): string => {
      if (!accuracy) {
        return 'Unknown';
      }
      if (accuracy < 10) {
        return 'Excellent';
      }
      if (accuracy < 30) {
        return 'Good';
      }
      if (accuracy < 100) {
        return 'Fair';
      }
      return 'Poor';
    };

    const getAccuracyColor = (accuracy?: number): string => {
      if (!accuracy) {
        return '#6f6f6f';
      }
      if (accuracy < 10) {
        return '#24a148';
      }
      if (accuracy < 30) {
        return '#0f62fe';
      }
      if (accuracy < 100) {
        return '#f1c21b';
      }
      return '#da1e28';
    };

    if (state.isLoading) {
      return (
        <View style={styles.container} testID={testID}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0f62fe" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        </View>
      );
    }

    if (state.error) {
      return (
        <View style={styles.container} testID={testID}>
          <View style={styles.errorContainer}>
            <Icon
              name="location-off"
              type="material"
              size={24}
              color="#da1e28"
              style={styles.errorIcon}
            />
            <View style={styles.errorTextContainer}>
              <Text style={styles.errorText}>Location unavailable</Text>
              <Text style={styles.errorDetail}>{state.error}</Text>
            </View>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchLocation}
              testID="retry-location"
            >
              <Icon name="refresh" type="material" size={20} color="#0f62fe" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!state.location) {
      return (
        <View style={styles.container} testID={testID}>
          <TouchableOpacity
            style={styles.fetchButton}
            onPress={fetchLocation}
            testID="fetch-location"
          >
            <Icon name="my-location" type="material" size={24} color="#0f62fe" />
            <Text style={styles.fetchButtonText}>Get Current Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.container, emergencyMode && styles.emergencyContainer]} testID={testID}>
        <View style={styles.locationHeader}>
          <View style={styles.locationIconContainer}>
            <Icon
              name="location-on"
              type="material"
              size={28}
              color={emergencyMode ? '#da1e28' : '#0f62fe'}
            />
          </View>
          <Text style={[styles.locationTitle, emergencyMode && styles.emergencyTitle]}>
            Current Location
          </Text>
        </View>

        <View style={styles.locationContent}>
          <View style={styles.coordinatesContainer}>
            <Text style={styles.coordinatesLabel}>Coordinates:</Text>
            <Text style={styles.coordinatesText} selectable>
              {LocationService.formatLocation(state.location)}
            </Text>
          </View>

          {state.address && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressLabel}>Address:</Text>
              <Text style={styles.addressText} selectable>
                {state.address}
              </Text>
            </View>
          )}

          <View style={styles.accuracyContainer}>
            <Text style={styles.accuracyLabel}>Accuracy:</Text>
            <View style={styles.accuracyBadge}>
              <View
                style={[
                  styles.accuracyIndicator,
                  { backgroundColor: getAccuracyColor(state.location.accuracy) },
                ]}
              />
              <Text style={styles.accuracyText}>
                {getAccuracyLevel(state.location.accuracy)}
                {state.location.accuracy && ` (±${Math.round(state.location.accuracy)}m)`}
              </Text>
            </View>
          </View>

          {state.lastUpdateTime && (
            <Text style={styles.updateTime}>
              Updated: {state.lastUpdateTime.toLocaleTimeString()}
            </Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={copyLocation}
            testID="copy-location"
          >
            <Icon name="content-copy" type="material" size={20} color="#0f62fe" />
            <Text style={styles.actionButtonText}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={fetchLocation}
            testID="refresh-location"
          >
            <Icon name="refresh" type="material" size={20} color="#0f62fe" />
            <Text style={styles.actionButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

LocationDisplay.displayName = 'LocationDisplay';
