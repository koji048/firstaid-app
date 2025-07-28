import { Linking, Alert } from 'react-native';
import { validatePhoneNumber } from '../utils/phoneNumber';
import { captureException, addBreadcrumb } from './sentry';

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
}
