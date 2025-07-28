import { HospitalService } from '../../src/services/hospital';
import { LocationCoordinates } from '../../src/services/location';
import * as Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}));

describe('HospitalService', () => {
  const mockLocation: LocationCoordinates = {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    timestamp: Date.now(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    HospitalService.clearCache();
  });

  describe('getNearbyHospitals', () => {
    it('should return mock hospitals successfully', async () => {
      const result = await HospitalService.getNearbyHospitals(mockLocation);

      expect(result.success).toBe(true);
      expect(result.hospitals).toBeDefined();
      expect(result.hospitals?.length).toBeGreaterThan(0);
      expect(result.hospitals?.[0]).toHaveProperty('id');
      expect(result.hospitals?.[0]).toHaveProperty('name');
      expect(result.hospitals?.[0]).toHaveProperty('distance');
      expect(result.hospitals?.[0]).toHaveProperty('estimatedTime');
    });

    it('should sort hospitals by distance', async () => {
      const result = await HospitalService.getNearbyHospitals(mockLocation);

      expect(result.success).toBe(true);
      const distances = result.hospitals?.map((h) => h.distance || 0) || [];
      const sortedDistances = [...distances].sort((a, b) => a - b);
      expect(distances).toEqual(sortedDistances);
    });

    it('should use cached results when available', async () => {
      // First call
      const result1 = await HospitalService.getNearbyHospitals(mockLocation);
      expect(result1.success).toBe(true);

      // Second call should use cache
      const result2 = await HospitalService.getNearbyHospitals(mockLocation, true);
      expect(result2.success).toBe(true);
      expect(result2.hospitals).toEqual(result1.hospitals);

      // Check breadcrumb for cache usage
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Returning cached hospitals',
          category: 'hospitals',
        }),
      );
    });

    it('should not use cache when explicitly disabled', async () => {
      // First call to populate cache
      await HospitalService.getNearbyHospitals(mockLocation);

      // Clear mocks
      jest.clearAllMocks();

      // Second call without cache
      const result = await HospitalService.getNearbyHospitals(mockLocation, false);
      expect(result.success).toBe(true);

      // Should not have cache breadcrumb
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Returning cached hospitals',
        }),
      );
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance correctly', () => {
      const from: LocationCoordinates = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: Date.now(),
      };

      const to: LocationCoordinates = {
        latitude: 37.7849,
        longitude: -122.4094,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        timestamp: Date.now(),
      };

      const distance = HospitalService.calculateDistance(from, to);
      expect(distance).toBeGreaterThan(1000); // More than 1km
      expect(distance).toBeLessThan(2000); // Less than 2km
    });

    it('should return 0 for same location', () => {
      const distance = HospitalService.calculateDistance(mockLocation, mockLocation);
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(HospitalService.formatDistance(500)).toBe('500m');
      expect(HospitalService.formatDistance(999)).toBe('999m');
    });

    it('should format kilometers correctly', () => {
      expect(HospitalService.formatDistance(1000)).toBe('1.0km');
      expect(HospitalService.formatDistance(1500)).toBe('1.5km');
      expect(HospitalService.formatDistance(10500)).toBe('10.5km');
    });
  });

  describe('estimateTravelTime', () => {
    it('should estimate travel time correctly', () => {
      // 1 mile = 1609.34 meters
      // At 30 mph, 1 mile takes 2 minutes
      expect(HospitalService.estimateTravelTime(1609.34)).toBe(2);
      expect(HospitalService.estimateTravelTime(3218.68)).toBe(4); // 2 miles
      expect(HospitalService.estimateTravelTime(805)).toBe(2); // 0.5 miles, rounds up
    });
  });

  describe('getDirectionsUrl', () => {
    const mockHospital = {
      id: '1',
      name: 'Test Hospital',
      address: '123 Test St',
      latitude: 37.7849,
      longitude: -122.4094,
    };

    it('should generate Apple Maps URL for iOS', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Platform = require('react-native').Platform;
      Platform.OS = 'ios';

      const url = HospitalService.getDirectionsUrl(mockHospital, mockLocation);
      expect(url).toContain('maps://app');
      expect(url).toContain('saddr=37.7749,-122.4194');
      expect(url).toContain('daddr=37.7849,-122.4094');
    });

    it('should generate Google Maps URL for Android', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Platform = require('react-native').Platform;
      Platform.OS = 'android';

      const url = HospitalService.getDirectionsUrl(mockHospital, mockLocation);
      expect(url).toContain('https://www.google.com/maps/dir/');
      expect(url).toContain('origin=37.7749,-122.4194');
      expect(url).toContain('destination=37.7849,-122.4094');
    });
  });

  describe('clearCache', () => {
    it('should clear cached hospitals', async () => {
      // Populate cache
      await HospitalService.getNearbyHospitals(mockLocation);

      // Clear cache
      HospitalService.clearCache();

      // Clear mocks
      jest.clearAllMocks();

      // Next call should not use cache
      await HospitalService.getNearbyHospitals(mockLocation);

      expect(Sentry.addBreadcrumb).not.toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Returning cached hospitals',
        }),
      );
    });
  });
});