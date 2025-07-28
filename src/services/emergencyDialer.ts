import { Platform } from 'react-native';

// Platform-specific imports will be resolved by React Native's platform-specific file resolution
export { EmergencyDialer } from './emergencyDialer';

/**
 * Re-export the platform-specific EmergencyDialer
 * React Native will automatically pick the correct file based on platform
 * - emergencyDialer.ios.ts for iOS
 * - emergencyDialer.android.ts for Android
 */

// Type definitions for consistency across platforms
export interface EmergencyDialerResult {
  success: boolean;
  error?: string;
}

export interface EmergencyInfo {
  name?: string;
  bloodType?: string;
  allergies?: string;
  medications?: string;
  emergencyContact?: string;
}

// Helper functions that work across platforms
export const getPlatformEmergencyNumber = (countryCode?: string): string => {
  // Default emergency numbers by region
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
};

export const formatEmergencyMessage = (location?: { latitude: number; longitude: number }): string => {
  const platform = Platform.OS === 'ios' ? 'iPhone' : 'Android';
  let message = `Emergency call from ${platform} device.`;
  
  if (location) {
    message += ` Location: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  }
  
  return message;
};