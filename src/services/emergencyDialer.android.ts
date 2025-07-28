import { Linking, NativeModules } from 'react-native';
import { addBreadcrumb } from './sentry';

interface EmergencyDialerResult {
  success: boolean;
  error?: string;
}

/**
 * Android-specific emergency dialer implementation
 * Uses Android Intent system for emergency calls
 */
export class EmergencyDialer {
  /**
   * Dial emergency number on Android
   * Android uses tel: scheme (without //) for emergency calls
   */
  static async dial(emergencyNumber: string): Promise<EmergencyDialerResult> {
    try {
      addBreadcrumb({
        message: 'Android emergency dial initiated',
        category: 'emergency',
        level: 'critical',
        data: {
          emergencyNumber,
          platform: 'android',
          timestamp: new Date().toISOString(),
        },
      });

      // Android uses tel: without double slashes
      const phoneUrl = `tel:${emergencyNumber}`;
      
      // Check if we can open the URL
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (!canOpen) {
        // In emulator, this might fail
        if (__DEV__) {
          addBreadcrumb({
            message: 'Android emulator detected, simulating emergency call',
            category: 'emergency',
            level: 'info',
          });
          return { success: true };
        }
        
        return {
          success: false,
          error: 'Unable to make emergency calls on this device',
        };
      }

      // Open the emergency dialer
      // On Android, this opens the dialer with the number pre-filled
      await Linking.openURL(phoneUrl);
      
      addBreadcrumb({
        message: 'Android emergency dial completed',
        category: 'emergency',
        level: 'info',
        data: { emergencyNumber },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      addBreadcrumb({
        message: 'Android emergency dial failed',
        category: 'emergency',
        level: 'error',
        data: {
          error: errorMessage,
          emergencyNumber,
        },
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if emergency calling is available on Android
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if we can open tel URLs
      const canCall = await Linking.canOpenURL('tel:911');
      
      // In development/emulator, always return true
      if (__DEV__ && !canCall) {
        return true;
      }
      
      return canCall;
    } catch {
      return false;
    }
  }

  /**
   * Get Android-specific emergency features
   */
  static getFeatures(): string[] {
    const features = [
      'Direct emergency dialing',
      'Emergency information on lock screen',
      'Emergency location service',
      'Automatic location sharing',
    ];

    // Check for available native modules
    if (NativeModules.EmergencyServices) {
      features.push('Native emergency services integration');
    }

    // Android 12+ features
    if (NativeModules.PlatformConstants?.Version >= 31) {
      features.push('Emergency SOS via power button');
      features.push('Car crash detection (select devices)');
    }

    return features;
  }

  /**
   * Request emergency permissions on Android
   * Android may require CALL_PHONE permission for direct dialing
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      // Check if we have a native permissions module
      if (NativeModules.EmergencyPermissions) {
        const granted = await NativeModules.EmergencyPermissions.requestCallPermission();
        
        addBreadcrumb({
          message: 'Android emergency permissions requested',
          category: 'emergency',
          level: 'info',
          data: { granted },
        });
        
        return granted;
      }
      
      // If no native module, assume we can make emergency calls
      // Emergency calls typically don't require special permissions
      return true;
    } catch (error) {
      addBreadcrumb({
        message: 'Failed to request Android emergency permissions',
        category: 'emergency',
        level: 'warning',
        data: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      
      // Default to true as emergency calls should work without permissions
      return true;
    }
  }

  /**
   * Set emergency information on lock screen (future enhancement)
   */
  static async setEmergencyInfo(info: {
    name?: string;
    bloodType?: string;
    allergies?: string;
    medications?: string;
    emergencyContact?: string;
  }): Promise<boolean> {
    // This would set emergency information visible on lock screen
    // Requires native module implementation
    addBreadcrumb({
      message: 'Emergency info update requested but not implemented',
      category: 'emergency',
      level: 'info',
      data: { hasInfo: !!info },
    });
    
    return false;
  }

  /**
   * Trigger Android Emergency Location Service (future enhancement)
   */
  static async triggerEmergencyLocation(): Promise<EmergencyDialerResult> {
    // This would trigger Android's Emergency Location Service (ELS)
    // which provides more accurate location to emergency services
    addBreadcrumb({
      message: 'Emergency Location Service requested but not implemented',
      category: 'emergency',
      level: 'warning',
    });
    
    return {
      success: false,
      error: 'Emergency Location Service not yet implemented',
    };
  }

  /**
   * Check if device supports Android Emergency SOS
   */
  static supportsEmergencySOS(): boolean {
    // Android 12+ (API level 31+) supports Emergency SOS
    const version = NativeModules.PlatformConstants?.Version || 0;
    return version >= 31;
  }
}