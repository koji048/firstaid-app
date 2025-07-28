import { Platform } from 'react-native';
import { LocationCoordinates } from './location';
import { addBreadcrumb, captureException } from './sentry';

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  distance?: number; // Distance in meters
  estimatedTime?: number; // Estimated time in minutes
  latitude: number;
  longitude: number;
  type?: 'emergency' | 'urgent_care' | 'general';
  hasEmergencyRoom?: boolean;
  rating?: number;
  isOpen24Hours?: boolean;
}

export interface HospitalsResult {
  success: boolean;
  hospitals?: Hospital[];
  error?: string;
}

export class HospitalService {
  private static readonly SEARCH_RADIUS = 10000; // 10km radius
  private static readonly MAX_RESULTS = 10;
  private static cachedHospitals: Hospital[] | null = null;
  private static lastFetchTime: number | null = null;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get nearby hospitals based on current location
   * @param location - Current user location
   * @param useCache - Whether to use cached results if available
   * @returns Promise<HospitalsResult>
   */
  static async getNearbyHospitals(
    location: LocationCoordinates,
    useCache = true,
  ): Promise<HospitalsResult> {
    try {
      // Check cache first
      if (useCache && this.isCacheValid()) {
        addBreadcrumb({
          message: 'Returning cached hospitals',
          category: 'hospitals',
          level: 'info',
        });
        return { success: true, hospitals: this.cachedHospitals || [] };
      }

      // For now, return mock data
      // In production, this would call a real API (Google Places, MapBox, etc.)
      const mockHospitals = await this.getMockNearbyHospitals(location);

      // Update cache
      this.cachedHospitals = mockHospitals;
      this.lastFetchTime = Date.now();

      addBreadcrumb({
        message: 'Fetched nearby hospitals',
        category: 'hospitals',
        level: 'info',
        data: {
          count: mockHospitals.length,
          location: {
            lat: location.latitude,
            lng: location.longitude,
          },
        },
      });

      return { success: true, hospitals: mockHospitals };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch hospitals';

      captureException(error instanceof Error ? error : new Error(errorMessage), {
        context: 'hospital_search',
        location,
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Calculate distance between two coordinates in meters
   * Using Haversine formula
   */
  static calculateDistance(from: LocationCoordinates, to: LocationCoordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }

  /**
   * Estimate travel time based on distance
   * Rough estimate: 30 mph average speed in emergency
   */
  static estimateTravelTime(meters: number): number {
    const avgSpeedMph = 30;
    const metersPerMile = 1609.34;
    const miles = meters / metersPerMile;
    const hours = miles / avgSpeedMph;
    return Math.ceil(hours * 60); // Return minutes, rounded up
  }

  /**
   * Get directions URL for navigation
   */
  static getDirectionsUrl(hospital: Hospital, currentLocation: LocationCoordinates): string {
    const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
    const destination = `${hospital.latitude},${hospital.longitude}`;

    if (Platform.OS === 'ios') {
      // Apple Maps URL scheme
      return `maps://app?saddr=${origin}&daddr=${destination}&dirflg=d`;
    } else {
      // Google Maps URL for Android and web
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    }
  }

  /**
   * Check if cache is still valid
   */
  private static isCacheValid(): boolean {
    if (!this.cachedHospitals || !this.lastFetchTime) {
      return false;
    }
    return Date.now() - this.lastFetchTime < this.CACHE_DURATION;
  }

  /**
   * Get mock nearby hospitals for development
   * In production, this would be replaced with actual API calls
   */
  private static async getMockNearbyHospitals(location: LocationCoordinates): Promise<Hospital[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate mock hospitals around the given location
    const mockHospitals: Hospital[] = [
      {
        id: '1',
        name: 'City General Hospital',
        address: '123 Main St, Downtown',
        phone: '+1-555-0100',
        latitude: location.latitude + 0.01,
        longitude: location.longitude + 0.01,
        type: 'emergency',
        hasEmergencyRoom: true,
        rating: 4.5,
        isOpen24Hours: true,
      },
      {
        id: '2',
        name: "St. Mary's Medical Center",
        address: '456 Oak Ave, Westside',
        phone: '+1-555-0200',
        latitude: location.latitude - 0.015,
        longitude: location.longitude + 0.008,
        type: 'emergency',
        hasEmergencyRoom: true,
        rating: 4.7,
        isOpen24Hours: true,
      },
      {
        id: '3',
        name: 'Downtown Urgent Care',
        address: '789 Elm St, Suite 100',
        phone: '+1-555-0300',
        latitude: location.latitude + 0.005,
        longitude: location.longitude - 0.012,
        type: 'urgent_care',
        hasEmergencyRoom: false,
        rating: 4.2,
        isOpen24Hours: false,
      },
      {
        id: '4',
        name: 'Regional Medical Center',
        address: '321 Hospital Blvd',
        phone: '+1-555-0400',
        latitude: location.latitude + 0.02,
        longitude: location.longitude - 0.018,
        type: 'emergency',
        hasEmergencyRoom: true,
        rating: 4.8,
        isOpen24Hours: true,
      },
      {
        id: '5',
        name: 'Community Health Center',
        address: '567 Park Ave',
        phone: '+1-555-0500',
        latitude: location.latitude - 0.008,
        longitude: location.longitude - 0.005,
        type: 'general',
        hasEmergencyRoom: false,
        rating: 4.0,
        isOpen24Hours: false,
      },
    ];

    // Calculate distances and estimated times
    const hospitalsWithDistance = mockHospitals.map((hospital) => {
      const distance = this.calculateDistance(location, {
        latitude: hospital.latitude,
        longitude: hospital.longitude,
      });
      const estimatedTime = this.estimateTravelTime(distance);

      return {
        ...hospital,
        distance,
        estimatedTime,
      };
    });

    // Sort by distance
    return hospitalsWithDistance
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, this.MAX_RESULTS);
  }

  /**
   * Clear cached hospitals
   */
  static clearCache(): void {
    this.cachedHospitals = null;
    this.lastFetchTime = null;
  }
}