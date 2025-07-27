import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  emergencyContactsStorage,
  EmergencyContactsStorage,
} from '../../src/storage/emergencyContactsStorage';
import { encryptionService } from '../../src/services/encryption';
import { EmergencyContact, ContactRelationship, ContactCategory } from '../../src/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock encryption service
jest.mock('../../src/services/encryption', () => ({
  encryptionService: {
    isInitialized: jest.fn(),
    initialize: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  },
}));

const createMockContact = (overrides?: Partial<EmergencyContact>): EmergencyContact => ({
  id: 'contact_1',
  userId: 'user_1',
  name: 'John Doe',
  phone: '+1234567890',
  relationship: ContactRelationship.SPOUSE,
  category: ContactCategory.FAMILY,
  isPrimary: true,
  notes: 'Test notes',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

describe('EmergencyContactsStorage', () => {
  let storage: EmergencyContactsStorage;
  const userId = 'test_user_123';

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new EmergencyContactsStorage();

    // Setup encryption service mocks
    (encryptionService.isInitialized as jest.Mock).mockReturnValue(true);
    (encryptionService.encrypt as jest.Mock).mockImplementation((data) => `encrypted_${data}`);
    (encryptionService.decrypt as jest.Mock).mockImplementation((data) =>
      data.replace('encrypted_', ''),
    );
  });

  describe('saveContacts', () => {
    it('should save contacts with encryption', async () => {
      const contacts = [createMockContact()];

      await storage.saveContacts(contacts, userId);

      expect(encryptionService.encrypt).toHaveBeenCalledWith(contacts[0].phone);
      expect(encryptionService.encrypt).toHaveBeenCalledWith(contacts[0].notes);

      const savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(savedData.version).toBe(1);
      expect(savedData.contacts[0].phone).toBe('encrypted_+1234567890');
      expect(savedData.contacts[0].notes).toBe('encrypted_Test notes');
    });

    it('should initialize encryption if not initialized', async () => {
      (encryptionService.isInitialized as jest.Mock).mockReturnValue(false);

      const contacts = [createMockContact()];
      await storage.saveContacts(contacts, userId);

      expect(encryptionService.initialize).toHaveBeenCalled();
    });

    it('should handle contacts without optional fields', async () => {
      const contact = createMockContact({ notes: undefined });

      await storage.saveContacts([contact], userId);

      const savedData = JSON.parse((AsyncStorage.setItem as jest.Mock).mock.calls[0][1]);
      expect(savedData.contacts[0].notes).toBeUndefined();
    });

    it('should handle save errors', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      await expect(storage.saveContacts([createMockContact()], userId)).rejects.toThrow(
        'Failed to save emergency contacts',
      );
    });
  });

  describe('loadContacts', () => {
    it('should load and decrypt contacts', async () => {
      const storedData = {
        version: 1,
        contacts: [
          {
            ...createMockContact(),
            phone: 'encrypted_+1234567890',
            notes: 'encrypted_Test notes',
          },
        ],
        lastSync: '2025-01-01T00:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(storedData));

      const contacts = await storage.loadContacts(userId);

      expect(contacts).toHaveLength(1);
      expect(contacts![0].phone).toBe('+1234567890');
      expect(contacts![0].notes).toBe('Test notes');
      expect(contacts![0].createdAt).toBeInstanceOf(Date);
    });

    it('should return null if no data exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const contacts = await storage.loadContacts(userId);

      expect(contacts).toBeNull();
    });

    it('should handle decryption errors by clearing data', async () => {
      const storedData = {
        version: 1,
        contacts: [
          {
            ...createMockContact(),
            phone: 'encrypted_+1234567890',
            notes: 'encrypted_Test notes',
          },
        ],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(storedData));
      (encryptionService.decrypt as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Failed to decrypt data');
      });

      const contacts = await storage.loadContacts(userId);

      expect(contacts).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        `@firstaid:emergency_contacts:${userId}`,
      );
    });

    it('should warn about version mismatch', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const storedData = {
        version: 2, // Future version
        contacts: [],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(storedData));

      await storage.loadContacts(userId);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('version mismatch'));
      consoleSpy.mockRestore();
    });
  });

  describe('clearContacts', () => {
    it('should remove contacts from storage', async () => {
      await storage.clearContacts(userId);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        `@firstaid:emergency_contacts:${userId}`,
      );
    });

    it('should handle clear errors', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Remove error'));

      await expect(storage.clearContacts(userId)).rejects.toThrow(
        'Failed to clear emergency contacts',
      );
    });
  });

  describe('utility methods', () => {
    it('should get storage version', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('1');

      const version = await storage.getStorageVersion();

      expect(version).toBe(1);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@firstaid:emergency_contacts:version');
    });

    it('should check if contacts exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('some data');

      const exists = await storage.hasContacts(userId);

      expect(exists).toBe(true);
    });

    it('should get storage info', async () => {
      const storedData = {
        version: 1,
        contacts: [createMockContact(), createMockContact({ id: 'contact_2' })],
        lastSync: '2025-01-01T00:00:00.000Z',
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(storedData))
        .mockResolvedValueOnce('1');

      const info = await storage.getStorageInfo(userId);

      expect(info).toEqual({
        exists: true,
        version: 1,
        lastSync: '2025-01-01T00:00:00.000Z',
        contactCount: 2,
      });
    });

    it('should clear all data', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValueOnce([
        '@firstaid:emergency_contacts:user1',
        '@firstaid:emergency_contacts:user2',
        '@firstaid:emergency_contacts:version',
        'other_key',
      ]);

      await storage.clearAllData();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        '@firstaid:emergency_contacts:user1',
        '@firstaid:emergency_contacts:user2',
        '@firstaid:emergency_contacts:version',
      ]);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@firstaid:emergency_contacts:version');
    });
  });
});
