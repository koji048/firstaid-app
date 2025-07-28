import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { LocationCoordinates, LocationService } from '../../src/services/location';
import * as sentry from '../../src/services/sentry';

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  PermissionsAndroid: {
    request: jest.fn(),
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
  },
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  requestAuthorization: jest.fn(),
}));

jest.mock('../../src/services/sentry', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

describe('LocationService', () => {
  const mockPosition = {
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10,
    },
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset static properties
    LocationService.clearLocationData();
  });

  describe('requestLocationPermission', () => {
    it('should request iOS permissions correctly', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success) => success());

      const result = await LocationService.requestLocationPermission();

      expect(result).toBe(true);
      expect(Geolocation.requestAuthorization).toHaveBeenCalled();
    });

    it('should handle iOS permission denial', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((_, error) => error());

      const result = await LocationService.requestLocationPermission();

      expect(result).toBe(false);
    });

    it('should request Android permissions correctly', async () => {
      Platform.OS = 'android';
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.GRANTED,
      );

      const result = await LocationService.requestLocationPermission();

      expect(result).toBe(true);
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        expect.objectContaining({
          title: 'Location Permission',
          message: expect.any(String),
        }),
      );
    });

    it('should handle Android permission denial', async () => {
      Platform.OS = 'android';
      (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
        PermissionsAndroid.RESULTS.DENIED,
      );

      const result = await LocationService.requestLocationPermission();

      expect(result).toBe(false);
    });

    it('should handle permission request errors', async () => {
      Platform.OS = 'android';
      const error = new Error('Permission error');
      (PermissionsAndroid.request as jest.Mock).mockRejectedValue(error);

      const result = await LocationService.requestLocationPermission();

      expect(result).toBe(false);
      expect(sentry.captureException).toHaveBeenCalledWith(error, {
        context: 'location_permission',
      });
    });
  });

  describe('getCurrentLocation', () => {
    it('should get current location successfully', async () => {
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((success) =>
        success(mockPosition),
      );

      const result = await LocationService.getCurrentLocation();

      expect(result.success).toBe(true);
      expect(result.location).toEqual({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
        accuracy: mockPosition.coords.accuracy,
        timestamp: mockPosition.timestamp,
      });
      expect(sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Location obtained successfully',
        category: 'location',
        level: 'info',
        data: { accuracy: mockPosition.coords.accuracy },
      });
    });

    it('should handle location timeout', async () => {
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(() => {
        // Don't call success or error callback to simulate timeout
      });

      const result = await LocationService.getCurrentLocation(100);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Location request timed out');
    });

    it('should use cached location on timeout if available', async () => {
      // First set a cached location
      const cachedLocation: LocationCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 15,
        timestamp: Date.now() - 1000, // 1 second ago
      };

      // Set up first successful call to cache location
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: cachedLocation.latitude,
            longitude: cachedLocation.longitude,
            accuracy: cachedLocation.accuracy,
          },
          timestamp: cachedLocation.timestamp,
        }),
      );

      await LocationService.getCurrentLocation();

      // Now simulate timeout
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(() => {
        // Don't call callbacks to simulate timeout
      });

      const result = await LocationService.getCurrentLocation(100);

      expect(result.success).toBe(true);
      expect(result.location).toEqual(cachedLocation);
      expect(sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Location timeout - using cached location',
          category: 'location',
          level: 'warning',
        }),
      );
    });

    it('should handle permission denied error', async () => {
      const error = { code: 1, message: 'Permission denied' };
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((_, errorCallback) =>
        errorCallback(error),
      );

      const result = await LocationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Location access was denied. Please enable location permissions.');
      expect(sentry.captureException).toHaveBeenCalled();
    });

    it('should handle position unavailable error', async () => {
      const error = { code: 2, message: 'Position unavailable' };
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((_, errorCallback) =>
        errorCallback(error),
      );

      const result = await LocationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'Location is currently unavailable. Please check your GPS settings.',
      );
    });

    it('should handle unknown errors', async () => {
      const error = { code: 99, message: 'Unknown error' };
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((_, errorCallback) =>
        errorCallback(error),
      );

      const result = await LocationService.getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unable to get your current location. Please try again.');
    });

    it('should store last known location', async () => {
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((success) =>
        success(mockPosition),
      );

      await LocationService.getCurrentLocation();
      const lastKnown = LocationService.getLastKnownLocation();

      expect(lastKnown).toEqual({
        latitude: mockPosition.coords.latitude,
        longitude: mockPosition.coords.longitude,
        accuracy: mockPosition.coords.accuracy,
        timestamp: mockPosition.timestamp,
      });
    });
  });

  describe('startLocationWatch', () => {
    it('should start watching location successfully', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success) => success());
      (Geolocation.watchPosition as jest.Mock).mockReturnValue(123);

      const callback = jest.fn();
      const watchId = await LocationService.startLocationWatch(callback);

      expect(watchId).toBe(123);
      expect(Geolocation.watchPosition).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        expect.objectContaining({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }),
      );
    });

    it('should handle location updates', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success) => success());
      (Geolocation.watchPosition as jest.Mock).mockImplementation((success) => {
        success(mockPosition);
        return 123;
      });

      const callback = jest.fn();
      await LocationService.startLocationWatch(callback);

      expect(callback).toHaveBeenCalledWith({
        success: true,
        location: expect.objectContaining({
          latitude: mockPosition.coords.latitude,
          longitude: mockPosition.coords.longitude,
        }),
      });
    });

    it('should handle permission denial', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((_, error) => error());

      const callback = jest.fn();
      const watchId = await LocationService.startLocationWatch(callback);

      expect(watchId).toBeNull();
      expect(callback).toHaveBeenCalledWith({
        success: false,
        error: 'Location permission denied',
      });
    });

    it('should handle watch errors', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success) => success());
      (Geolocation.watchPosition as jest.Mock).mockImplementation((_, error) => {
        error({ code: 2, message: 'Position unavailable' });
        return 123;
      });

      const callback = jest.fn();
      await LocationService.startLocationWatch(callback);

      expect(callback).toHaveBeenCalledWith({
        success: false,
        error: 'Location is currently unavailable. Please check your GPS settings.',
      });
    });
  });

  describe('stopLocationWatch', () => {
    it('should stop watching location', async () => {
      Platform.OS = 'ios';
      (Geolocation.requestAuthorization as jest.Mock).mockImplementation((success) => success());
      (Geolocation.watchPosition as jest.Mock).mockReturnValue(123);

      const callback = jest.fn();
      await LocationService.startLocationWatch(callback);
      LocationService.stopLocationWatch();

      expect(Geolocation.clearWatch).toHaveBeenCalledWith(123);
    });

    it('should handle stopping when no watch active', () => {
      LocationService.stopLocationWatch();
      expect(Geolocation.clearWatch).not.toHaveBeenCalled();
    });
  });

  describe('utility methods', () => {
    it('should generate share URL correctly', () => {
      const location = {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: Date.now(),
      };

      const url = LocationService.generateShareUrl(location);
      expect(url).toBe('https://maps.google.com/?q=37.7749,-122.4194');
    });

    it('should create share data correctly', () => {
      const location = {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: Date.now(),
      };

      const shareData = LocationService.createShareData(location);
      expect(shareData).toEqual({
        coordinates: location,
        shareUrl: 'https://maps.google.com/?q=37.7749,-122.4194',
        timestamp: expect.any(Number),
      });
    });

    it('should format location correctly', () => {
      const location = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10.5,
        timestamp: Date.now(),
      };

      const formatted = LocationService.formatLocation(location);
      expect(formatted).toBe('37.774900, -122.419400 (±11m)');
    });

    it('should format location without accuracy', () => {
      const location = {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: Date.now(),
      };

      const formatted = LocationService.formatLocation(location);
      expect(formatted).toBe('37.774900, -122.419400');
    });

    it('should show permission denied alert', () => {
      LocationService.showPermissionDeniedAlert();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Location Permission Required',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Settings' }),
        ]),
      );
    });

    it('should clear location data', () => {
      LocationService.clearLocationData();
      const lastKnown = LocationService.getLastKnownLocation();

      expect(lastKnown).toBeNull();
      expect(Geolocation.clearWatch).not.toHaveBeenCalled(); // No watch was active
    });
  });

  describe('getEmergencyLocation', () => {
    it('should return recent cached location immediately', async () => {
      const recentLocation: LocationCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: Date.now() - 60000, // 1 minute ago
      };

      // Set up cached location
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: recentLocation.latitude,
            longitude: recentLocation.longitude,
            accuracy: recentLocation.accuracy,
          },
          timestamp: recentLocation.timestamp,
        }),
      );

      await LocationService.getCurrentLocation();
      jest.clearAllMocks();

      const result = await LocationService.getEmergencyLocation();

      expect(result.success).toBe(true);
      expect(result.location).toEqual(recentLocation);
      expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
      expect(sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Using recent cached location for emergency',
          category: 'emergency',
          level: 'info',
        }),
      );
    });

    it('should fetch fresh location if cache is old', async () => {
      const oldLocation: LocationCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: Date.now() - 360000, // 6 minutes ago
      };

      // Set up old cached location
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: oldLocation.latitude,
            longitude: oldLocation.longitude,
            accuracy: oldLocation.accuracy,
          },
          timestamp: oldLocation.timestamp,
        }),
      );

      await LocationService.getCurrentLocation();

      // Mock fresh location
      const freshLocation = {
        coords: {
          latitude: 37.785,
          longitude: -122.4294,
          accuracy: 5,
        },
        timestamp: Date.now(),
      };

      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((success) =>
        success(freshLocation),
      );

      const result = await LocationService.getEmergencyLocation();

      expect(result.success).toBe(true);
      expect(result.location?.latitude).toBe(freshLocation.coords.latitude);
      expect(Geolocation.getCurrentPosition).toHaveBeenCalled();
    });

    it('should use old cached location if fresh location fails', async () => {
      const oldLocation: LocationCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: Date.now() - 3600000, // 1 hour ago
      };

      // Set up old cached location
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: oldLocation.latitude,
            longitude: oldLocation.longitude,
            accuracy: oldLocation.accuracy,
          },
          timestamp: oldLocation.timestamp,
        }),
      );

      await LocationService.getCurrentLocation();

      // Mock location failure
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((_, error) =>
        error({ code: 2, message: 'Position unavailable' }),
      );

      const result = await LocationService.getEmergencyLocation();

      expect(result.success).toBe(true);
      expect(result.location).toEqual(oldLocation);
      expect(sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Using older cached location for emergency',
          category: 'emergency',
          level: 'warning',
        }),
      );
    });

    it('should handle no cached location and fresh location failure', async () => {
      // Ensure no cached location
      LocationService.clearLocationData();

      // Mock location failure
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation((_, error) =>
        error({ code: 1, message: 'Permission denied' }),
      );

      const result = await LocationService.getEmergencyLocation();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Location access was denied. Please enable location permissions.');
    });

    it('should log critical breadcrumb for emergency location', async () => {
      await LocationService.getEmergencyLocation();

      expect(sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Emergency location request initiated',
          category: 'emergency',
          level: 'critical',
        }),
      );
    });

    it('should handle exceptions and return cached location', async () => {
      const cachedLocation: LocationCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: Date.now() - 60000,
      };

      // Set up cached location
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementationOnce((success) =>
        success({
          coords: {
            latitude: cachedLocation.latitude,
            longitude: cachedLocation.longitude,
            accuracy: cachedLocation.accuracy,
          },
          timestamp: cachedLocation.timestamp,
        }),
      );

      await LocationService.getCurrentLocation();

      // Mock exception
      (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const result = await LocationService.getEmergencyLocation();

      expect(result.success).toBe(true);
      expect(result.location).toEqual(cachedLocation);
      expect(sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          context: 'location_get_current_sync_error',
        }),
      );
    });
  });
});
