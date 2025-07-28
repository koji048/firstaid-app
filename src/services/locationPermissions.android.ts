import { Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import { addBreadcrumb } from './sentry';

export interface LocationPermissionResult {
  granted: boolean;
  status: 'granted' | 'denied' | 'never_ask_again' | 'undetermined';
  canAskAgain: boolean;
}

/**
 * Android-specific location permission handling
 */
export class LocationPermissions {
  /**
   * Request location permission on Android
   */
  static async request(options?: {
    title?: string;
    message?: string;
    buttonPositive?: string;
    buttonNegative?: string;
    buttonNeutral?: string;
  }): Promise<LocationPermissionResult> {
    try {
      // For Android 10+ (API 29+), we might need background location
      const permissions = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      
      if (Platform.Version >= 29 && options?.message?.includes('background')) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
      }

      // Check if permissions are already granted
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted) {
        return {
          granted: true,
          status: 'granted',
          canAskAgain: false,
        };
      }

      // Request permissions
      const result = await PermissionsAndroid.requestMultiple(permissions);
      
      const fineLocationStatus = result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      
      addBreadcrumb({
        message: 'Android location permission requested',
        category: 'permissions',
        level: 'info',
        data: { result },
      });

      // Convert Android permission status to our format
      let status: LocationPermissionResult['status'];
      let canAskAgain = true;

      switch (fineLocationStatus) {
        case PermissionsAndroid.RESULTS.GRANTED:
          status = 'granted';
          canAskAgain = false;
          break;
        case PermissionsAndroid.RESULTS.DENIED:
          status = 'denied';
          canAskAgain = true;
          break;
        case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
          status = 'never_ask_again';
          canAskAgain = false;
          break;
        default:
          status = 'undetermined';
          canAskAgain = true;
      }

      return {
        granted: fineLocationStatus === PermissionsAndroid.RESULTS.GRANTED,
        status,
        canAskAgain,
      };
    } catch (error) {
      addBreadcrumb({
        message: 'Android location permission error',
        category: 'permissions',
        level: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      return {
        granted: false,
        status: 'undetermined',
        canAskAgain: true,
      };
    }
  }

  /**
   * Check current location permission status on Android
   */
  static async check(): Promise<LocationPermissionResult> {
    try {
      const fineLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      
      const coarseLocationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      );

      const isGranted = fineLocationGranted || coarseLocationGranted;

      return {
        granted: isGranted,
        status: isGranted ? 'granted' : 'denied',
        canAskAgain: !isGranted,
      };
    } catch (error) {
      return {
        granted: false,
        status: 'undetermined',
        canAskAgain: true,
      };
    }
  }

  /**
   * Show permission explanation and request on Android
   */
  static async requestWithExplanation(explanation: {
    title: string;
    message: string;
    buttonPositive?: string;
    buttonNegative?: string;
    buttonNeutral?: string;
  }): Promise<LocationPermissionResult> {
    try {
      const rationale = await PermissionsAndroid.shouldShowRequestPermissionRationale(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (rationale) {
        // Show custom rationale
        return new Promise((resolve) => {
          Alert.alert(
            explanation.title,
            explanation.message,
            [
              {
                text: explanation.buttonNegative || 'Cancel',
                style: 'cancel',
                onPress: () => {
                  resolve({
                    granted: false,
                    status: 'denied',
                    canAskAgain: true,
                  });
                },
              },
              {
                text: explanation.buttonPositive || 'OK',
                onPress: async () => {
                  const result = await this.request(explanation);
                  resolve(result);
                },
              },
            ],
          );
        });
      } else {
        // Request directly
        return await this.request(explanation);
      }
    } catch (error) {
      return {
        granted: false,
        status: 'undetermined',
        canAskAgain: true,
      };
    }
  }

  /**
   * Open app settings for Android
   */
  static async openSettings(): Promise<void> {
    try {
      await Linking.openSettings();
      
      addBreadcrumb({
        message: 'Android settings opened for location permissions',
        category: 'permissions',
        level: 'info',
      });
    } catch (error) {
      addBreadcrumb({
        message: 'Failed to open Android settings',
        category: 'permissions',
        level: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      
      Alert.alert(
        'Unable to Open Settings',
        'Please go to Settings > Apps > First Aid Room > Permissions to enable location access.',
      );
    }
  }

  /**
   * Get Android-specific location permission features
   */
  static getFeatures(): string[] {
    const features = [
      'Fine location (GPS)',
      'Coarse location (Network)',
      'Foreground location access',
    ];

    // Android 10+ features
    if (Platform.Version >= 29) {
      features.push('Background location access');
    }

    // Android 12+ features
    if (Platform.Version >= 31) {
      features.push('Precise/Approximate location toggle');
    }

    return features;
  }

  /**
   * Check if high accuracy location is enabled
   */
  static async isHighAccuracyEnabled(): Promise<boolean> {
    // This would require a native module to check location mode
    // For now, check if fine location permission is granted
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted;
    } catch {
      return false;
    }
  }

  /**
   * Request background location permission (Android 10+)
   */
  static async requestBackgroundLocation(): Promise<LocationPermissionResult> {
    if (Platform.Version < 29) {
      // Background location not needed before Android 10
      return {
        granted: true,
        status: 'granted',
        canAskAgain: false,
      };
    }

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message:
            'This app needs access to your location even when the app is closed or not in use to provide emergency services.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );

      return {
        granted: result === PermissionsAndroid.RESULTS.GRANTED,
        status: result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
        canAskAgain: result !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      };
    } catch (error) {
      return {
        granted: false,
        status: 'undetermined',
        canAskAgain: true,
      };
    }
  }
}