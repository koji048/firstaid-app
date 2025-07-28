import { Linking, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

// Mock the modules
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
}));

describe('EmergencyDialer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('iOS Emergency Dialer', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should dial emergency number on iOS', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.ios');
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(true);

      const result = await EmergencyDialer.dial('911');

      expect(result.success).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith('tel://911');
      expect(Linking.openURL).toHaveBeenCalledWith('tel://911');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'iOS emergency dial initiated',
          category: 'emergency',
          level: 'critical',
        }),
      );
    });

    it('should handle iOS simulator gracefully', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.ios');
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      // @ts-ignore
      global.__DEV__ = true;

      const result = await EmergencyDialer.dial('911');

      expect(result.success).toBe(true);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'iOS simulator detected, simulating emergency call',
        }),
      );
    });

    it('should check availability on iOS', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.ios');
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      const isAvailable = await EmergencyDialer.isAvailable();

      expect(isAvailable).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith('tel://911');
    });

    it('should get iOS features', () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.ios');
      
      const features = EmergencyDialer.getFeatures();

      expect(features).toContain('Direct emergency dialing');
      expect(features).toContain('Medical ID integration');
      expect(features).toContain('Emergency SOS shortcuts');
    });

    it('should always grant permissions on iOS', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.ios');
      
      const granted = await EmergencyDialer.requestPermissions();

      expect(granted).toBe(true);
    });
  });

  describe('Android Emergency Dialer', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('should dial emergency number on Android', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.android');
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
      (Linking.openURL as jest.Mock).mockResolvedValue(true);

      const result = await EmergencyDialer.dial('911');

      expect(result.success).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith('tel:911');
      expect(Linking.openURL).toHaveBeenCalledWith('tel:911');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Android emergency dial initiated',
          category: 'emergency',
          level: 'critical',
        }),
      );
    });

    it('should handle Android emulator gracefully', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.android');
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);
      // @ts-ignore
      global.__DEV__ = true;

      const result = await EmergencyDialer.dial('911');

      expect(result.success).toBe(true);
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Android emulator detected, simulating emergency call',
        }),
      );
    });

    it('should check availability on Android', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.android');
      
      (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);

      const isAvailable = await EmergencyDialer.isAvailable();

      expect(isAvailable).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith('tel:911');
    });

    it('should get Android features', () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.android');
      
      const features = EmergencyDialer.getFeatures();

      expect(features).toContain('Direct emergency dialing');
      expect(features).toContain('Emergency information on lock screen');
      expect(features).toContain('Emergency location service');
    });

    it('should request permissions on Android', async () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.android');
      
      const granted = await EmergencyDialer.requestPermissions();

      // Without native module, should default to true
      expect(granted).toBe(true);
    });

    it('should check for Emergency SOS support', () => {
      const { EmergencyDialer } = require('../../src/services/emergencyDialer.android');
      
      const supportsEsos = EmergencyDialer.supportsEmergencySOS();

      // Without native module, should return false
      expect(supportsEsos).toBe(false);
    });
  });

  describe('Platform helpers', () => {
    it('should get correct emergency number by country', () => {
      const { getPlatformEmergencyNumber } = require('../../src/services/emergencyDialer');
      
      expect(getPlatformEmergencyNumber('US')).toBe('911');
      expect(getPlatformEmergencyNumber('UK')).toBe('999');
      expect(getPlatformEmergencyNumber('EU')).toBe('112');
      expect(getPlatformEmergencyNumber('AU')).toBe('000');
      expect(getPlatformEmergencyNumber()).toBe('911'); // Default
    });

    it('should format emergency message', () => {
      const { formatEmergencyMessage } = require('../../src/services/emergencyDialer');
      
      Platform.OS = 'ios';
      const messageIOS = formatEmergencyMessage({ latitude: 37.7749, longitude: -122.4194 });
      expect(messageIOS).toContain('iPhone');
      expect(messageIOS).toContain('37.774900, -122.419400');

      Platform.OS = 'android';
      const messageAndroid = formatEmergencyMessage();
      expect(messageAndroid).toContain('Android');
      expect(messageAndroid).not.toContain('Location');
    });
  });
});