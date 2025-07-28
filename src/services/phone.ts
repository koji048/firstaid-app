import { Alert, Linking, Platform } from 'react-native';
import { validatePhoneNumber } from '../utils/phoneNumber';
import { addBreadcrumb, captureException } from './sentry';

export interface CallResult {
  success: boolean;
  error?: string;
}

export class PhoneService {
  /**
   * Initiate a phone call using the device's native dialer
   * @param phoneNumber - The phone number to call
   * @param contactName - Optional contact name for logging
   * @returns Promise<CallResult>
   */
  static async makePhoneCall(phoneNumber: string, contactName?: string): Promise<CallResult> {
    try {
      // Validate phone number
      if (!validatePhoneNumber(phoneNumber)) {
        const error = 'Invalid phone number format';
        addBreadcrumb({
          message: 'Phone call failed - invalid number',
          category: 'phone',
          level: 'warning',
          data: { contactName, phoneNumber: phoneNumber.replace(/\d/g, '*') },
        });
        return { success: false, error };
      }

      // Clean phone number for calling (remove formatting, keep + for international)
      const cleanedNumber = this.cleanPhoneNumberForCalling(phoneNumber);
      const phoneUrl = `tel:${cleanedNumber}`;

      // Log call attempt
      addBreadcrumb({
        message: 'Phone call initiated',
        category: 'phone',
        level: 'info',
        data: { contactName, phoneNumber: phoneNumber.replace(/\d/g, '*') },
      });

      // Check if device can make phone calls
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (!canOpen) {
        const error = 'Device cannot make phone calls';
        return { success: false, error };
      }

      // Open native dialer (works on both iOS and Android with tel: scheme)
      await Linking.openURL(phoneUrl);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      captureException(error instanceof Error ? error : new Error(errorMessage), {
        context: 'phone_call',
        contactName,
        phoneNumber: phoneNumber.replace(/\d/g, '*'),
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Check if the device supports making phone calls
   * @returns Promise<boolean>
   */
  static async canMakePhoneCalls(): Promise<boolean> {
    try {
      return await Linking.canOpenURL('tel:+1234567890');
    } catch {
      return false;
    }
  }

  /**
   * Show platform-appropriate error when calls are not supported
   */
  static showCallNotSupportedError(): void {
    Alert.alert('Call Not Available', 'This device does not support making phone calls.', [
      { text: 'OK' },
    ]);
  }

  /**
   * Clean phone number for calling - remove formatting but preserve international format
   * @param phoneNumber - Raw phone number
   * @returns Cleaned phone number suitable for tel: URL
   */
  private static cleanPhoneNumberForCalling(phoneNumber: string): string {
    // Remove all characters except digits and +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // If it starts with +, keep it (international format)
    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    // For US numbers, add +1 country code if it's 10 digits
    if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
      return `+1${cleaned}`;
    }

    return cleaned;
  }

  /**
   * Handle phone call errors with user-friendly messages
   * @param error - Error from phone call attempt
   * @param contactName - Optional contact name for context
   */
  static handleCallError(error: string, contactName?: string): void {
    let userMessage = 'Unable to make phone call';

    if (error.includes('invalid')) {
      userMessage = `Invalid phone number${contactName ? ` for ${contactName}` : ''}`;
    } else if (error.includes('cannot make phone calls')) {
      userMessage = 'This device cannot make phone calls';
    } else if (error.includes('not supported')) {
      userMessage = 'Phone calls are not supported on this device';
    }

    Alert.alert('Call Failed', userMessage, [{ text: 'OK' }]);
  }

  /**
   * Make an emergency call with platform-specific handling
   * @param emergencyNumber - The emergency number to call (default: 911)
   * @returns Promise<CallResult>
   */
  static async makeEmergencyCall(emergencyNumber = '911'): Promise<CallResult> {
    try {
      // Use platform-specific emergency dialer if available
      try {
        // Try to use the platform-specific emergency dialer
        const { EmergencyDialer } = require('./emergencyDialer');
        
        if (EmergencyDialer) {
          const result = await EmergencyDialer.dial(emergencyNumber);
          
          if (!result.success && result.error) {
            // If platform-specific dialer fails, fall back to standard implementation
            throw new Error(result.error);
          }
          
          return result;
        }
      } catch (importError) {
        // If platform-specific dialer is not available, continue with standard implementation
        addBreadcrumb({
          message: 'Platform-specific emergency dialer not available, using standard implementation',
          category: 'emergency',
          level: 'info',
        });
      }

      // Standard implementation (fallback)
      // Log emergency call attempt
      addBreadcrumb({
        message: 'Emergency call initiated (standard)',
        category: 'emergency',
        level: 'critical',
        data: {
          emergencyNumber,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        },
      });

      let phoneUrl: string;

      if (Platform.OS === 'ios') {
        // iOS uses tel:// for emergency calls
        phoneUrl = `tel://${emergencyNumber}`;
      } else if (Platform.OS === 'android') {
        // Android uses tel: without double slashes
        phoneUrl = `tel:${emergencyNumber}`;
      } else {
        // Fallback for other platforms
        phoneUrl = `tel:${emergencyNumber}`;
      }

      // Check if device can make emergency calls
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (!canOpen) {
        // Fallback for simulator/emulator
        if (__DEV__) {
          Alert.alert('Emergency Call (Dev Mode)', `Would call ${emergencyNumber} in production`, [
            { text: 'OK' },
          ]);
          return { success: true };
        }

        const error = 'Device cannot make emergency calls';
        addBreadcrumb({
          message: 'Emergency call failed - device unsupported',
          category: 'emergency',
          level: 'error',
          data: { emergencyNumber, platform: Platform.OS },
        });
        return { success: false, error };
      }

      // Open emergency dialer
      await Linking.openURL(phoneUrl);

      // Log successful emergency call
      addBreadcrumb({
        message: 'Emergency call completed',
        category: 'emergency',
        level: 'info',
        data: {
          emergencyNumber,
          platform: Platform.OS,
          timestamp: new Date().toISOString(),
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      captureException(error instanceof Error ? error : new Error(errorMessage), {
        context: 'emergency_call',
        emergencyNumber,
        platform: Platform.OS,
        severity: 'critical',
      });

      addBreadcrumb({
        message: 'Emergency call failed with error',
        category: 'emergency',
        level: 'error',
        data: {
          error: errorMessage,
          emergencyNumber,
          platform: Platform.OS,
        },
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get platform-specific emergency number
   * @param countryCode - Optional country code for region-specific numbers
   * @returns Emergency number for the region
   */
  static getEmergencyNumber(countryCode?: string): string {
    // This can be extended to support international emergency numbers
    // For now, default to 911 for US/Canada
    const emergencyNumbers: Record<string, string> = {
      US: '911',
      CA: '911',
      UK: '999',
      EU: '112',
      AU: '000',
      NZ: '111',
      IN: '112',
      JP: '110', // Police, 119 for fire/ambulance
      CN: '110', // Police, 120 for ambulance
      BR: '190', // Police, 192 for ambulance
      MX: '911',
    };

    if (countryCode && emergencyNumbers[countryCode]) {
      return emergencyNumbers[countryCode];
    }

    // Default to 911
    return '911';
  }
}
