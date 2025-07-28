import { Alert, Linking, PermissionsIOS } from 'react-native';
import { addBreadcrumb } from './sentry';

export interface LocationPermissionResult {
  granted: boolean;
  status: 'granted' | 'denied' | 'restricted' | 'undetermined';
  canAskAgain: boolean;
}

/**
 * iOS-specific location permission handling
 */
export class LocationPermissions {
  /**
   * Request location permission on iOS
   */
  static async request(options?: {
    title?: string;
    message?: string;
    alwaysUsage?: boolean;
  }): Promise<LocationPermissionResult> {
    try {
      const permissionType = options?.alwaysUsage
        ? PermissionsIOS.PERMISSIONS.LOCATION_ALWAYS
        : PermissionsIOS.PERMISSIONS.LOCATION_WHEN_IN_USE;

      // Check current permission status
      const currentStatus = await PermissionsIOS.check(permissionType);
      
      addBreadcrumb({
        message: 'iOS location permission check',
        category: 'permissions',
        level: 'info',
        data: { currentStatus, permissionType },
      });

      // If already granted, return success
      if (currentStatus === 'granted') {
        return {
          granted: true,
          status: 'granted',
          canAskAgain: false,
        };
      }

      // If restricted or denied, can't ask again
      if (currentStatus === 'restricted' || currentStatus === 'denied') {
        return {
          granted: false,
          status: currentStatus,
          canAskAgain: false,
        };
      }

      // Request permission
      const result = await PermissionsIOS.request(permissionType);
      
      addBreadcrumb({
        message: 'iOS location permission requested',
        category: 'permissions',
        level: 'info',
        data: { result },
      });

      return {
        granted: result === 'granted',
        status: result,
        canAskAgain: result === 'undetermined',
      };
    } catch (error) {
      addBreadcrumb({
        message: 'iOS location permission error',
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
   * Check current location permission status on iOS
   */
  static async check(): Promise<LocationPermissionResult> {
    try {
      const whenInUseStatus = await PermissionsIOS.check(
        PermissionsIOS.PERMISSIONS.LOCATION_WHEN_IN_USE,
      );
      
      const alwaysStatus = await PermissionsIOS.check(
        PermissionsIOS.PERMISSIONS.LOCATION_ALWAYS,
      );

      // If either permission is granted, consider it granted
      const isGranted = whenInUseStatus === 'granted' || alwaysStatus === 'granted';
      const status = isGranted ? 'granted' : whenInUseStatus;

      return {
        granted: isGranted,
        status: status as any,
        canAskAgain: status === 'undetermined',
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
   * Show permission explanation and request on iOS
   */
  static async requestWithExplanation(explanation: {
    title: string;
    message: string;
    buttonPositive?: string;
    buttonNegative?: string;
  }): Promise<LocationPermissionResult> {
    return new Promise((resolve) => {
      Alert.alert(
        explanation.title || 'Location Permission Required',
        explanation.message || 'This app needs access to your location for emergency services.',
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
            text: explanation.buttonPositive || 'Allow',
            onPress: async () => {
              const result = await this.request();
              resolve(result);
            },
          },
        ],
      );
    });
  }

  /**
   * Open app settings for iOS
   */
  static async openSettings(): Promise<void> {
    try {
      await Linking.openURL('app-settings:');
      
      addBreadcrumb({
        message: 'iOS settings opened for location permissions',
        category: 'permissions',
        level: 'info',
      });
    } catch (error) {
      addBreadcrumb({
        message: 'Failed to open iOS settings',
        category: 'permissions',
        level: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      
      Alert.alert(
        'Unable to Open Settings',
        'Please go to Settings > Privacy > Location Services to enable location access.',
      );
    }
  }

  /**
   * Get iOS-specific location permission features
   */
  static getFeatures(): string[] {
    return [
      'Precise location',
      'Approximate location',
      'When in use permission',
      'Always allow permission',
      'Temporary precise location',
    ];
  }

  /**
   * Check if precise location is enabled (iOS 14+)
   */
  static async isPreciseLocationEnabled(): Promise<boolean> {
    // This would require a native module to check precise location status
    // For now, assume precise location is enabled
    return true;
  }
}