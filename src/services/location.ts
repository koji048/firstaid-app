import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { addBreadcrumb, captureException } from './sentry';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationResult {
  success: boolean;
  location?: LocationCoordinates;
  error?: string;
}

export interface LocationShareData {
  coordinates: LocationCoordinates;
  address?: string;
  shareUrl: string;
  timestamp: number;
}

export class LocationService {
  private static lastKnownLocation: LocationCoordinates | null = null;
  private static watchId: number | null = null;

  /**
   * Request location permissions
   * @returns Promise<boolean> - true if permission granted
   */
  static async requestLocationPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // iOS permissions are handled in Info.plist
        // Request permission by attempting to get location
        return new Promise((resolve) => {
          Geolocation.requestAuthorization(
            () => resolve(true),
            () => resolve(false),
          );
        });
      } else {
        // Android permissions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'First Aid Room needs access to your location to share it during emergencies.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      captureException(
        error instanceof Error ? error : new Error('Location permission request failed'),
        { context: 'location_permission' },
      );
      return false;
    }
  }

  /**
   * Get current location coordinates
   * @param timeout - Timeout in milliseconds (default: 10000)
   * @returns Promise<LocationResult>
   */
  static async getCurrentLocation(timeout = 10000): Promise<LocationResult> {
    try {
      addBreadcrumb({
        message: 'Location request initiated',
        category: 'location',
        level: 'info',
      });

      return new Promise((resolve) => {
        const timeoutId = setTimeout(() => {
          resolve({
            success: false,
            error: 'Location request timed out',
          });
        }, timeout);

        Geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            const location: LocationCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };

            this.lastKnownLocation = location;

            addBreadcrumb({
              message: 'Location obtained successfully',
              category: 'location',
              level: 'info',
              data: { accuracy: position.coords.accuracy },
            });

            resolve({
              success: true,
              location,
            });
          },
          (error) => {
            clearTimeout(timeoutId);
            const errorMessage = this.getLocationErrorMessage(error.code);

            captureException(new Error(errorMessage), {
              context: 'location_get_current',
              errorCode: error.code,
              errorMessage: error.message,
            });

            resolve({
              success: false,
              error: errorMessage,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: timeout - 1000, // Leave 1 second buffer for our timeout
            maximumAge: 30000, // Accept cached location up to 30 seconds old
          },
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown location error';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Start watching location for continuous updates
   * @param callback - Called when location updates
   * @returns number - Watch ID for stopping updates
   */
  static startLocationWatch(callback: (result: LocationResult) => void): Promise<number | null> {
    return new Promise(async (resolve) => {
      try {
        // Request permission first
        const hasPermission = await this.requestLocationPermission();
        if (!hasPermission) {
          callback({
            success: false,
            error: 'Location permission denied',
          });
          resolve(null);
          return;
        }

        const watchId = Geolocation.watchPosition(
          (position) => {
            const location: LocationCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };

            this.lastKnownLocation = location;
            callback({
              success: true,
              location,
            });
          },
          (error) => {
            const errorMessage = this.getLocationErrorMessage(error.code);
            callback({
              success: false,
              error: errorMessage,
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );

        this.watchId = watchId;
        resolve(watchId);
      } catch (error) {
        callback({
          success: false,
          error: 'Failed to start location watch',
        });
        resolve(null);
      }
    });
  }

  /**
   * Stop watching location updates
   */
  static stopLocationWatch(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Generate a shareable location URL
   * @param location - Location coordinates
   * @returns string - URL that can be shared
   */
  static generateShareUrl(location: LocationCoordinates): string {
    const { latitude, longitude } = location;
    // Use Google Maps URL format that works across platforms
    return `https://maps.google.com/?q=${latitude},${longitude}`;
  }

  /**
   * Create location share data
   * @param location - Location coordinates
   * @returns LocationShareData
   */
  static createShareData(location: LocationCoordinates): LocationShareData {
    return {
      coordinates: location,
      shareUrl: this.generateShareUrl(location),
      timestamp: Date.now(),
    };
  }

  /**
   * Get last known location if available
   * @returns LocationCoordinates | null
   */
  static getLastKnownLocation(): LocationCoordinates | null {
    return this.lastKnownLocation;
  }

  /**
   * Clear cached location data
   */
  static clearLocationData(): void {
    this.lastKnownLocation = null;
    this.stopLocationWatch();
  }

  /**
   * Show location permission denied alert
   */
  static showPermissionDeniedAlert(): void {
    Alert.alert(
      'Location Permission Required',
      'To share your location during emergencies, please enable location access in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Settings',
          onPress: () => {
            // Note: Opening settings would require additional native module
            // For now, just provide instructions
          },
        },
      ],
    );
  }

  /**
   * Format location coordinates for display
   * @param location - Location coordinates
   * @returns string - Formatted location string
   */
  static formatLocation(location: LocationCoordinates): string {
    const { latitude, longitude, accuracy } = location;
    let formatted = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    if (accuracy) {
      formatted += ` (±${Math.round(accuracy)}m)`;
    }

    return formatted;
  }

  /**
   * Get user-friendly error message for location errors
   * @param errorCode - Geolocation error code
   * @returns string - User-friendly error message
   */
  private static getLocationErrorMessage(errorCode: number): string {
    switch (errorCode) {
      case 1: // PERMISSION_DENIED
        return 'Location access was denied. Please enable location permissions.';
      case 2: // POSITION_UNAVAILABLE
        return 'Location is currently unavailable. Please check your GPS settings.';
      case 3: // TIMEOUT
        return 'Location request timed out. Please try again.';
      default:
        return 'Unable to get your current location. Please try again.';
    }
  }
}
