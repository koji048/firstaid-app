import {
  ContactRelationship,
  ContactCategory,
  EmergencyContact,
  NewEmergencyContact,
  UpdateEmergencyContact,
  StoredEmergencyContacts,
  EmergencyContactsState,
} from '../../src/types';

describe('Emergency Contact Types', () => {
  describe('Enums', () => {
    it('should have correct ContactRelationship values', () => {
      expect(ContactRelationship.SPOUSE).toBe('spouse');
      expect(ContactRelationship.PARENT).toBe('parent');
      expect(ContactRelationship.CHILD).toBe('child');
      expect(ContactRelationship.SIBLING).toBe('sibling');
      expect(ContactRelationship.FRIEND).toBe('friend');
      expect(ContactRelationship.DOCTOR).toBe('doctor');
      expect(ContactRelationship.OTHER).toBe('other');
    });

    it('should have correct ContactCategory values', () => {
      expect(ContactCategory.FAMILY).toBe('family');
      expect(ContactCategory.MEDICAL).toBe('medical');
      expect(ContactCategory.WORK).toBe('work');
      expect(ContactCategory.OTHER).toBe('other');
    });
  });

  describe('Type Guards', () => {
    const isValidEmergencyContact = (obj: any): obj is EmergencyContact => {
      return (
        typeof obj.id === 'string' &&
        typeof obj.userId === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.phone === 'string' &&
        Object.values(ContactRelationship).includes(obj.relationship) &&
        Object.values(ContactCategory).includes(obj.category) &&
        typeof obj.isPrimary === 'boolean' &&
        (obj.notes === undefined || typeof obj.notes === 'string') &&
        obj.createdAt instanceof Date &&
        obj.updatedAt instanceof Date
      );
    };

    it('should validate valid EmergencyContact', () => {
      const validContact: EmergencyContact = {
        id: 'contact_123',
        userId: 'user_123',
        name: 'John Doe',
        phone: '+1234567890',
        relationship: ContactRelationship.SPOUSE,
        category: ContactCategory.FAMILY,
        isPrimary: true,
        notes: 'Emergency contact notes',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isValidEmergencyContact(validContact)).toBe(true);
    });

    it('should validate EmergencyContact without optional fields', () => {
      const contactWithoutNotes: EmergencyContact = {
        id: 'contact_123',
        userId: 'user_123',
        name: 'John Doe',
        phone: '+1234567890',
        relationship: ContactRelationship.FRIEND,
        category: ContactCategory.OTHER,
        isPrimary: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isValidEmergencyContact(contactWithoutNotes)).toBe(true);
    });

    it('should reject invalid EmergencyContact', () => {
      const invalidContacts = [
        { ...createValidContact(), id: 123 }, // id should be string
        { ...createValidContact(), relationship: 'invalid' }, // invalid relationship
        { ...createValidContact(), category: 'invalid' }, // invalid category
        { ...createValidContact(), isPrimary: 'yes' }, // isPrimary should be boolean
        { ...createValidContact(), createdAt: '2025-01-01' }, // createdAt should be Date
      ];

      invalidContacts.forEach((contact) => {
        expect(isValidEmergencyContact(contact)).toBe(false);
      });
    });
  });

  describe('Type Compatibility', () => {
    it('should create valid NewEmergencyContact', () => {
      const newContact: NewEmergencyContact = {
        userId: 'user_123',
        name: 'Jane Doe',
        phone: '+0987654321',
        relationship: ContactRelationship.PARENT,
        category: ContactCategory.FAMILY,
        isPrimary: false,
        notes: 'Parent contact',
      };

      // TypeScript will ensure this is valid at compile time
      expect(newContact).toBeDefined();
      expect(newContact).not.toHaveProperty('id');
      expect(newContact).not.toHaveProperty('createdAt');
      expect(newContact).not.toHaveProperty('updatedAt');
    });

    it('should create valid UpdateEmergencyContact', () => {
      const updateContact: UpdateEmergencyContact = {
        name: 'Updated Name',
        phone: '+1111111111',
      };

      // All fields should be optional
      expect(updateContact).toBeDefined();
      expect(updateContact).not.toHaveProperty('id');
      expect(updateContact).not.toHaveProperty('userId');
    });

    it('should create valid StoredEmergencyContacts', () => {
      const stored: StoredEmergencyContacts = {
        version: 1,
        contacts: [createValidContact()],
        lastSync: '2025-01-01T00:00:00.000Z',
      };

      expect(stored.version).toBe(1);
      expect(stored.contacts).toHaveLength(1);
      expect(stored.lastSync).toBeDefined();
    });

    it('should create valid EmergencyContactsState', () => {
      const state: EmergencyContactsState = {
        contacts: {
          contact_1: createValidContact(),
        },
        contactIds: ['contact_1'],
        primaryContactId: 'contact_1',
        isLoading: false,
        error: null,
        isInitialized: true,
      };

      expect(state.contacts).toBeDefined();
      expect(state.contactIds).toHaveLength(1);
      expect(state.primaryContactId).toBe('contact_1');
    });
  });
});

// Helper function
function createValidContact(): EmergencyContact {
  return {
    id: 'contact_123',
    userId: 'user_123',
    name: 'John Doe',
    phone: '+1234567890',
    relationship: ContactRelationship.SPOUSE,
    category: ContactCategory.FAMILY,
    isPrimary: true,
    notes: 'Test notes',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
