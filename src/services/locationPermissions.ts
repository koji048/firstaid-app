/**
 * Platform-agnostic location permissions interface
 * The actual implementation is in platform-specific files:
 * - locationPermissions.ios.ts
 * - locationPermissions.android.ts
 */

export interface LocationPermissionResult {
  granted: boolean;
  status: 'granted' | 'denied' | 'restricted' | 'never_ask_again' | 'undetermined';
  canAskAgain: boolean;
}

export interface LocationPermissionOptions {
  title?: string;
  message?: string;
  buttonPositive?: string;
  buttonNegative?: string;
  buttonNeutral?: string;
  alwaysUsage?: boolean; // iOS specific
}

// Re-export the platform-specific implementation
export { LocationPermissions } from './locationPermissions';