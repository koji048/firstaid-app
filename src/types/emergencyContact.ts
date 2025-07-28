/**
 * Emergency Contact Types and Interfaces
 *
 * This module defines the data structures for emergency contacts
 * used throughout the First Aid Room application.
 */

/**
 * Relationship types for emergency contacts
 */
export enum ContactRelationship {
  SPOUSE = 'spouse',
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  FRIEND = 'friend',
  DOCTOR = 'doctor',
  OTHER = 'other',
}

/**
 * Categories for organizing emergency contacts
 */
export enum ContactCategory {
  FAMILY = 'family',
  MEDICAL = 'medical',
  WORK = 'work',
  OTHER = 'other',
}

/**
 * Main emergency contact interface
 */
export interface EmergencyContact {
  /** Unique identifier for the contact */
  id: string;

  /** User ID who owns this contact */
  userId: string;

  /** Full name of the emergency contact */
  name: string;

  /** Phone number with country code */
  phone: string;

  /** Relationship to the user */
  relationship: ContactRelationship;

  /** Category for organization */
  category: ContactCategory;

  /** Whether this is the primary emergency contact */
  isPrimary: boolean;

  /** Optional notes about the contact */
  notes?: string;

  /** Timestamp when contact was created */
  createdAt: Date;

  /** Timestamp when contact was last updated */
  updatedAt: Date;
}

/**
 * Type for creating a new emergency contact (without generated fields)
 */
export type NewEmergencyContact = Omit<EmergencyContact, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Type for updating an existing emergency contact
 */
export type UpdateEmergencyContact = Partial<
  Omit<EmergencyContact, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

/**
 * Storage format for emergency contacts (for AsyncStorage)
 */
export interface StoredEmergencyContacts {
  version: number;
  contacts: EmergencyContact[];
  lastSync?: string;
}

/**
 * Redux state shape for emergency contacts
 */
export interface EmergencyContactsState {
  /** Normalized contacts object (keyed by ID) */
  contacts: Record<string, EmergencyContact>;

  /** Array of contact IDs for ordering */
  contactIds: string[];

  /** ID of the primary contact */
  primaryContactId: string | null;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: string | null;

  /** Whether data has been loaded from storage */
  isInitialized: boolean;

  /** Current search query */
  searchQuery: string;

  /** Emergency mode state - enables one-tap calling and enlarged UI */
  isEmergencyMode: boolean;

  /** Location sharing state during emergency mode */
  locationSharing: {
    /** Whether location sharing is enabled */
    isEnabled: boolean;
    /** Current location coordinates */
    currentLocation: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      timestamp: number;
    } | null;
    /** Whether location is being actively tracked */
    isTracking: boolean;
    /** Last error when getting location */
    error: string | null;
  };
}
