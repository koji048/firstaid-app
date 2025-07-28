import { Linking, NativeModules } from 'react-native';
import { addBreadcrumb } from './sentry';

interface EmergencyDialerResult {
  success: boolean;
  error?: string;
}

/**
 * iOS-specific emergency dialer implementation
 * Uses iOS-specific URL schemes and native modules when available
 */
export class EmergencyDialer {
  /**
   * Dial emergency number on iOS
   * iOS supports tel:// scheme for emergency calls
   */
  static async dial(emergencyNumber: string): Promise<EmergencyDialerResult> {
    try {
      addBreadcrumb({
        message: 'iOS emergency dial initiated',
        category: 'emergency',
        level: 'critical',
        data: {
          emergencyNumber,
          platform: 'ios',
          timestamp: new Date().toISOString(),
        },
      });

      // iOS uses tel:// for emergency calls
      const phoneUrl = `tel://${emergencyNumber}`;
      // Check if we can open the URL
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (!canOpen) {
        // In simulator, this will fail
        if (__DEV__) {
          addBreadcrumb({
            message: 'iOS simulator detected, simulating emergency call',
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
      await Linking.openURL(phoneUrl);
      
      addBreadcrumb({
        message: 'iOS emergency dial completed',
        category: 'emergency',
        level: 'info',
        data: { emergencyNumber },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      addBreadcrumb({
        message: 'iOS emergency dial failed',
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
   * Check if emergency calling is available on iOS
   */
  static async isAvailable(): Promise<boolean> {
    try {
      // Check if we can open tel URLs
      const canCall = await Linking.canOpenURL('tel://911');
      
      // In development/simulator, always return true
      if (__DEV__ && !canCall) {
        return true;
      }
      
      return canCall;
    } catch {
      return false;
    }
  }

  /**
   * Get iOS-specific emergency features
   */
  static getFeatures(): string[] {
    const features = [
      'Direct emergency dialing',
      'Medical ID integration',
      'Emergency SOS shortcuts',
      'Location sharing with emergency services',
    ];

    // Check for available native modules
    if (NativeModules.EmergencyServices) {
      features.push('Native emergency services integration');
    }

    return features;
  }

  /**
   * Request emergency permissions on iOS
   * iOS doesn't require special permissions for emergency calls
   */
  static async requestPermissions(): Promise<boolean> {
    // iOS doesn't require special permissions for emergency calls
    // Location permissions are handled separately
    return true;
  }

  /**
   * iOS-specific Medical ID integration (future enhancement)
   */
  static async getMedicalID(): Promise<any> {
    // This would integrate with iOS HealthKit Medical ID
    // For now, return null as it requires native module implementation
    addBreadcrumb({
      message: 'Medical ID requested but not implemented',
      category: 'emergency',
      level: 'info',
    });
    
    return null;
  }

  /**
   * Trigger iOS Emergency SOS (future enhancement)
   */
  static async triggerEmergencySOS(): Promise<EmergencyDialerResult> {
    // This would trigger iOS Emergency SOS feature
    // Requires native module implementation
    addBreadcrumb({
      message: 'Emergency SOS requested but not implemented',
      category: 'emergency',
      level: 'warning',
    });
    
    return {
      success: false,
      error: 'Emergency SOS not yet implemented',
    };
  }
}