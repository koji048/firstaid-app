import { Alert, Linking } from 'react-native';
import { PhoneService } from '../../src/services/phone';
import * as sentry from '../../src/services/sentry';
import { validatePhoneNumber } from '../../src/utils/phoneNumber';

// Mock dependencies
jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('../../src/services/sentry', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

jest.mock('../../src/utils/phoneNumber', () => ({
  validatePhoneNumber: jest.fn(),
}));

describe('PhoneService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(undefined);
    (validatePhoneNumber as jest.Mock).mockReturnValue(true);
  });

  describe('makePhoneCall', () => {
    it('should successfully make a phone call with valid US number', async () => {
      const phoneNumber = '(555) 123-4567';
      const result = await PhoneService.makePhoneCall(phoneNumber);

      expect(result.success).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith('tel:+15551234567');
      expect(sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Phone call initiated',
        category: 'phone',
        level: 'info',
        data: { contactName: undefined, phoneNumber: '(***) ***-****' },
      });
    });

    it('should successfully make a phone call with international number', async () => {
      const phoneNumber = '+44 20 7946 0958';
      const result = await PhoneService.makePhoneCall(phoneNumber);

      expect(result.success).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith('tel:+442079460958');
    });

    it('should handle numbers with extension', async () => {
      const phoneNumber = '555-123-4567 ext 123';
      const result = await PhoneService.makePhoneCall(phoneNumber);

      expect(result.success).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith('tel:5551234567123');
    });

    it('should handle numbers with special characters', async () => {
      const phoneNumber = '555.123.4567';
      const result = await PhoneService.makePhoneCall(phoneNumber);

      expect(result.success).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith('tel:+15551234567');
    });

    it('should return error for empty phone number', async () => {
      (validatePhoneNumber as jest.Mock).mockReturnValue(false);
      const result = await PhoneService.makePhoneCall('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number format');
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('should return error for invalid phone number', async () => {
      (validatePhoneNumber as jest.Mock).mockReturnValue(false);
      const phoneNumber = '123';
      const result = await PhoneService.makePhoneCall(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid phone number format');
      expect(Linking.openURL).not.toHaveBeenCalled();
    });

    it('should return error when cannot open URL', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      const phoneNumber = '555-123-4567';

      const result = await PhoneService.makePhoneCall(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Device cannot make phone calls');
      // captureException is not called in this case, only for actual errors
    });

    it('should handle Linking.openURL errors', async () => {
      const error = new Error('Failed to open URL');
      (Linking.openURL as jest.Mock).mockRejectedValue(error);
      const phoneNumber = '555-123-4567';

      const result = await PhoneService.makePhoneCall(phoneNumber);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to open URL');
      expect(sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          context: 'phone_call',
          phoneNumber: '***-***-****',
        }),
      );
    });

    it('should mask phone number in logs for privacy', async () => {
      const phoneNumber = '555-123-4567';
      await PhoneService.makePhoneCall(phoneNumber);

      expect(sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { contactName: undefined, phoneNumber: '***-***-****' },
        }),
      );
    });
  });

  describe('canMakePhoneCalls', () => {
    it('should check if device can make phone calls', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      const result = await PhoneService.canMakePhoneCalls();

      expect(result).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith('tel:+1234567890');
    });

    it('should return false when cannot make calls', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      const result = await PhoneService.canMakePhoneCalls();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      (Linking.canOpenURL as jest.Mock).mockRejectedValue(new Error('Test error'));
      const result = await PhoneService.canMakePhoneCalls();

      expect(result).toBe(false);
    });
  });

  describe('showCallNotSupportedError', () => {
    it('should show alert for unsupported calls', () => {
      PhoneService.showCallNotSupportedError();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Call Not Available',
        'This device does not support making phone calls.',
        [{ text: 'OK' }],
      );
    });
  });

  describe('handleCallError', () => {
    it('should handle invalid phone number error', () => {
      PhoneService.handleCallError('invalid phone number', 'John Doe');

      expect(Alert.alert).toHaveBeenCalledWith('Call Failed', 'Invalid phone number for John Doe', [
        { text: 'OK' },
      ]);
    });

    it('should handle device cannot make calls error', () => {
      PhoneService.handleCallError('cannot make phone calls');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Call Failed',
        'This device cannot make phone calls',
        [{ text: 'OK' }],
      );
    });

    it('should handle generic error', () => {
      PhoneService.handleCallError('Some other error');

      expect(Alert.alert).toHaveBeenCalledWith('Call Failed', 'Unable to make phone call', [
        { text: 'OK' },
      ]);
    });
  });
});
