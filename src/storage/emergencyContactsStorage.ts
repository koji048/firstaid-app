/**
 * Emergency Contacts Storage Service
 *
 * Handles persistent storage of emergency contacts with encryption
 * for sensitive data and support for offline access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmergencyContact, StoredEmergencyContacts } from '../types';
import { encryptionService } from '../services/encryption';

// Storage constants
const STORAGE_PREFIX = '@firstaid:emergency_contacts:';
const VERSION_KEY = `${STORAGE_PREFIX}version`;
const CURRENT_VERSION = 1;

// Error messages
const ERRORS = {
  NOT_INITIALIZED: 'Encryption service not initialized',
  SAVE_FAILED: 'Failed to save emergency contacts',
  LOAD_FAILED: 'Failed to load emergency contacts',
  CLEAR_FAILED: 'Failed to clear emergency contacts',
  INVALID_DATA: 'Invalid data format',
};

class EmergencyContactsStorage {
  /**
   * Get storage key for a specific user
   */
  private getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId}`;
  }

  /**
   * Save emergency contacts to storage
   */
  async saveContacts(contacts: EmergencyContact[], userId: string): Promise<void> {
    try {
      // Ensure encryption service is initialized
      if (!encryptionService.isInitialized()) {
        await encryptionService.initialize();
      }

      // Prepare storage format
      const storageData: StoredEmergencyContacts = {
        version: CURRENT_VERSION,
        contacts,
        lastSync: new Date().toISOString(),
      };

      // Encrypt sensitive data
      const encryptedContacts = await this.encryptContacts(storageData.contacts);
      const dataToStore = {
        ...storageData,
        contacts: encryptedContacts,
      };

      // Save to AsyncStorage
      const key = this.getStorageKey(userId);
      await AsyncStorage.setItem(key, JSON.stringify(dataToStore));

      // Update version
      await AsyncStorage.setItem(VERSION_KEY, String(CURRENT_VERSION));
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
      throw new Error(ERRORS.SAVE_FAILED);
    }
  }

  /**
   * Load emergency contacts from storage
   */
  async loadContacts(userId: string): Promise<EmergencyContact[] | null> {
    try {
      // Ensure encryption service is initialized
      if (!encryptionService.isInitialized()) {
        await encryptionService.initialize();
      }

      // Load from AsyncStorage
      const key = this.getStorageKey(userId);
      const storedData = await AsyncStorage.getItem(key);

      if (!storedData) {
        return null;
      }

      const parsedData: StoredEmergencyContacts = JSON.parse(storedData);

      // Check version and migrate if necessary
      if (parsedData.version !== CURRENT_VERSION) {
        // Migration will be handled by migration system
        console.warn(
          `Data version mismatch: expected ${CURRENT_VERSION}, got ${parsedData.version}`,
        );
      }

      // Decrypt contacts
      const decryptedContacts = await this.decryptContacts(parsedData.contacts);

      return decryptedContacts;
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);

      // If decryption fails, it might be due to corrupted data
      // In production, we might want to handle this more gracefully
      if (error instanceof Error && error.message.includes('decrypt')) {
        await this.clearContacts(userId);
        return null;
      }

      throw new Error(ERRORS.LOAD_FAILED);
    }
  }

  /**
   * Clear emergency contacts from storage
   */
  async clearContacts(userId: string): Promise<void> {
    try {
      const key = this.getStorageKey(userId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear emergency contacts:', error);
      throw new Error(ERRORS.CLEAR_FAILED);
    }
  }

  /**
   * Encrypt emergency contacts
   * Only encrypts sensitive fields (phone, notes)
   */
  private async encryptContacts(contacts: EmergencyContact[]): Promise<any[]> {
    return contacts.map((contact) => ({
      ...contact,
      phone: encryptionService.encrypt(contact.phone),
      notes: contact.notes ? encryptionService.encrypt(contact.notes) : undefined,
    }));
  }

  /**
   * Decrypt emergency contacts
   */
  private async decryptContacts(encryptedContacts: any[]): Promise<EmergencyContact[]> {
    return encryptedContacts.map((contact) => ({
      ...contact,
      phone: encryptionService.decrypt(contact.phone),
      notes: contact.notes ? encryptionService.decrypt(contact.notes) : undefined,
      // Ensure dates are Date objects
      createdAt: new Date(contact.createdAt),
      updatedAt: new Date(contact.updatedAt),
    }));
  }

  /**
   * Get current storage version
   */
  async getStorageVersion(): Promise<number | null> {
    try {
      const version = await AsyncStorage.getItem(VERSION_KEY);
      return version ? parseInt(version, 10) : null;
    } catch (error) {
      console.error('Failed to get storage version:', error);
      return null;
    }
  }

  /**
   * Check if contacts exist for a user
   */
  async hasContacts(userId: string): Promise<boolean> {
    try {
      const key = this.getStorageKey(userId);
      const data = await AsyncStorage.getItem(key);
      return data !== null;
    } catch (error) {
      console.error('Failed to check contacts existence:', error);
      return false;
    }
  }

  /**
   * Get storage info for debugging
   */
  async getStorageInfo(userId: string): Promise<{
    exists: boolean;
    version: number | null;
    lastSync: string | null;
    contactCount: number;
  }> {
    try {
      const key = this.getStorageKey(userId);
      const storedData = await AsyncStorage.getItem(key);
      const version = await this.getStorageVersion();

      if (!storedData) {
        return {
          exists: false,
          version,
          lastSync: null,
          contactCount: 0,
        };
      }

      const parsedData: StoredEmergencyContacts = JSON.parse(storedData);

      return {
        exists: true,
        version: parsedData.version,
        lastSync: parsedData.lastSync || null,
        contactCount: parsedData.contacts.length,
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        exists: false,
        version: null,
        lastSync: null,
        contactCount: 0,
      };
    }
  }

  /**
   * Clear all emergency contacts data (for all users)
   * WARNING: Use with caution
   */
  async clearAllData(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const emergencyContactKeys = allKeys.filter((key) => key.startsWith(STORAGE_PREFIX));

      if (emergencyContactKeys.length > 0) {
        await AsyncStorage.multiRemove(emergencyContactKeys);
      }

      await AsyncStorage.removeItem(VERSION_KEY);
    } catch (error) {
      console.error('Failed to clear all emergency contacts data:', error);
      throw new Error('Failed to clear all data');
    }
  }
}

// Export singleton instance
export const emergencyContactsStorage = new EmergencyContactsStorage();

// Export class for testing
export { EmergencyContactsStorage };
