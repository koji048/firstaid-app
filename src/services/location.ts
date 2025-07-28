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
      // Try to use platform-specific permission handler
      try {
        const { LocationPermissions } = require('./locationPermissions');
        
        if (LocationPermissions) {
          const result = await LocationPermissions.requestWithExplanation({
            title: 'Location Permission Required',
            message: 'First Aid Room needs access to your location to share it during emergencies and help emergency services find you quickly.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          });
          
          return result.granted;
        }
      } catch (importError) {
        // If platform-specific handler is not available, continue with standard implementation
        addBreadcrumb({
          message: 'Platform-specific location permissions not available, using standard implementation',
          category: 'location',
          level: 'info',
        });
      }

      // Standard implementation (fallback)
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
          // Return last known location on timeout if available
          if (this.lastKnownLocation) {
            addBreadcrumb({
              message: 'Location timeout - using cached location',
              category: 'location',
              level: 'warning',
              data: { cacheAge: Date.now() - this.lastKnownLocation.timestamp },
            });

            resolve({
              success: true,
              location: this.lastKnownLocation,
            });
          } else {
            resolve({
              success: false,
              error: 'Location request timed out',
            });
          }
        }, timeout);

        try {
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
        } catch (error) {
          clearTimeout(timeoutId);
          const errorMessage = error instanceof Error ? error.message : 'Unknown location error';
          captureException(error instanceof Error ? error : new Error(errorMessage), {
            context: 'location_get_current_sync_error',
          });
          resolve({
            success: false,
            error: errorMessage,
          });
        }
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
   * Get current location for emergency use
   * Uses high accuracy mode with shorter timeout
   * Falls back to cached location if available
   * @returns Promise<LocationResult>
   */
  static async getEmergencyLocation(): Promise<LocationResult> {
    try {
      addBreadcrumb({
        message: 'Emergency location request initiated',
        category: 'emergency',
        level: 'critical',
        data: { timestamp: new Date().toISOString() },
      });

      // First check if we have a recent cached location (within 5 minutes)
      if (this.lastKnownLocation) {
        const cacheAge = Date.now() - this.lastKnownLocation.timestamp;
        const fiveMinutes = 5 * 60 * 1000;

        if (cacheAge < fiveMinutes) {
          addBreadcrumb({
            message: 'Using recent cached location for emergency',
            category: 'emergency',
            level: 'info',
            data: { cacheAge: Math.round(cacheAge / 1000) },
          });

          return {
            success: true,
            location: this.lastKnownLocation,
          };
        }
      }

      // Try to get fresh location with 5 second timeout
      let result: LocationResult;
      try {
        result = await this.getCurrentLocation(5000);
      } catch (error) {
        // Handle any exceptions during getCurrentLocation
        captureException(
          error instanceof Error ? error : new Error('Failed to get current location'),
          {
            context: 'emergency_location_getCurrentLocation',
            severity: 'critical',
          },
        );

        // Set result as failed
        result = {
          success: false,
          error: 'Location request failed',
        };
      }

      // If failed but we have any cached location, use it
      if (!result.success && this.lastKnownLocation) {
        addBreadcrumb({
          message: 'Using older cached location for emergency',
          category: 'emergency',
          level: 'warning',
          data: {
            originalError: result.error,
            cacheAge: Math.round((Date.now() - this.lastKnownLocation.timestamp) / 1000),
          },
        });

        return {
          success: true,
          location: this.lastKnownLocation,
        };
      }

      return result;
    } catch (error) {
      captureException(error instanceof Error ? error : new Error('Emergency location failed'), {
        context: 'emergency_location',
        severity: 'critical',
      });

      // Last resort - return cached location if available
      if (this.lastKnownLocation) {
        return {
          success: true,
          location: this.lastKnownLocation,
        };
      }

      return {
        success: false,
        error: 'Unable to determine location',
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
