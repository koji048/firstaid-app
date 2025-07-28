import { configureStore } from '@reduxjs/toolkit';
import emergencyContactsReducer, {
  addContact,
  clearContacts,
  deleteContact,
  selectAllContacts,
  selectContactById,
  selectContactsByCategory,
  selectContactsCount,
  selectHasPrimaryContact,
  selectPrimaryContact,
  setContacts,
  setError,
  setLoading,
  setPrimaryContact,
  updateContact,
} from '../../../src/store/slices/emergencyContactsSlice';
import { ContactCategory, ContactRelationship, EmergencyContact } from '../../../src/types';

// Helper function to create a mock contact
const createMockContact = (overrides?: Partial<EmergencyContact>): EmergencyContact => ({
  id: 'contact_1',
  userId: 'user_1',
  name: 'John Doe',
  phone: '+1234567890',
  relationship: ContactRelationship.SPOUSE,
  category: ContactCategory.FAMILY,
  isPrimary: false,
  notes: 'Test notes',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

describe('emergencyContactsSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        emergencyContacts: emergencyContactsReducer,
      },
    });
  });

  describe('reducers', () => {
    it('should handle initial state', () => {
      expect(store.getState().emergencyContacts).toEqual({
        contacts: {},
        contactIds: [],
        primaryContactId: null,
        isLoading: false,
        error: null,
        isInitialized: false,
      });
    });

    it('should handle addContact', () => {
      const contact = createMockContact();
      store.dispatch(addContact(contact));

      const state = store.getState().emergencyContacts;
      expect(state.contacts[contact.id]).toEqual(contact);
      expect(state.contactIds).toContain(contact.id);
    });

    it('should set first contact as primary automatically', () => {
      const contact = createMockContact();
      store.dispatch(addContact(contact));

      const state = store.getState().emergencyContacts;
      expect(state.primaryContactId).toBe(contact.id);
    });

    it('should ensure only one primary contact when adding primary', () => {
      const contact1 = createMockContact({ id: 'contact_1', isPrimary: true });
      const contact2 = createMockContact({ id: 'contact_2', isPrimary: true });

      store.dispatch(addContact(contact1));
      store.dispatch(addContact(contact2));

      const state = store.getState().emergencyContacts;
      expect(state.contacts[contact1.id].isPrimary).toBe(false);
      expect(state.contacts[contact2.id].isPrimary).toBe(true);
      expect(state.primaryContactId).toBe(contact2.id);
    });

    it('should handle updateContact', () => {
      const contact = createMockContact();
      store.dispatch(addContact(contact));

      const updates = { name: 'Jane Doe', phone: '+0987654321' };
      store.dispatch(updateContact({ id: contact.id, updates }));

      const state = store.getState().emergencyContacts;
      expect(state.contacts[contact.id].name).toBe('Jane Doe');
      expect(state.contacts[contact.id].phone).toBe('+0987654321');
    });

    it('should handle primary contact update', () => {
      const contact = createMockContact();
      store.dispatch(addContact(contact));

      store.dispatch(updateContact({ id: contact.id, updates: { isPrimary: true } }));

      const state = store.getState().emergencyContacts;
      expect(state.primaryContactId).toBe(contact.id);
      expect(state.contacts[contact.id].isPrimary).toBe(true);
    });

    it('should handle deleteContact', () => {
      const contact = createMockContact();
      store.dispatch(addContact(contact));
      store.dispatch(deleteContact(contact.id));

      const state = store.getState().emergencyContacts;
      expect(state.contacts[contact.id]).toBeUndefined();
      expect(state.contactIds).not.toContain(contact.id);
    });

    it('should clear primary contact when deleting primary', () => {
      const contact = createMockContact({ isPrimary: true });
      store.dispatch(addContact(contact));
      store.dispatch(deleteContact(contact.id));

      const state = store.getState().emergencyContacts;
      expect(state.primaryContactId).toBeNull();
    });

    it('should handle setContacts', () => {
      const contacts = [
        createMockContact({ id: 'contact_1' }),
        createMockContact({ id: 'contact_2', isPrimary: true }),
        createMockContact({ id: 'contact_3' }),
      ];

      store.dispatch(setContacts(contacts));

      const state = store.getState().emergencyContacts;
      expect(state.contactIds).toHaveLength(3);
      expect(state.primaryContactId).toBe('contact_2');
      expect(state.isInitialized).toBe(true);
    });

    it('should handle setPrimaryContact', () => {
      const contact1 = createMockContact({ id: 'contact_1', isPrimary: true });
      const contact2 = createMockContact({ id: 'contact_2' });

      store.dispatch(addContact(contact1));
      store.dispatch(addContact(contact2));
      store.dispatch(setPrimaryContact('contact_2'));

      const state = store.getState().emergencyContacts;
      expect(state.contacts.contact_1.isPrimary).toBe(false);
      expect(state.contacts.contact_2.isPrimary).toBe(true);
      expect(state.primaryContactId).toBe('contact_2');
    });

    it('should handle setLoading', () => {
      store.dispatch(setLoading(true));
      expect(store.getState().emergencyContacts.isLoading).toBe(true);

      store.dispatch(setLoading(false));
      expect(store.getState().emergencyContacts.isLoading).toBe(false);
    });

    it('should handle setError', () => {
      store.dispatch(setError('Test error'));
      expect(store.getState().emergencyContacts.error).toBe('Test error');

      store.dispatch(setError(null));
      expect(store.getState().emergencyContacts.error).toBeNull();
    });

    it('should handle clearContacts', () => {
      const contact = createMockContact();
      store.dispatch(addContact(contact));
      store.dispatch(clearContacts());

      const state = store.getState().emergencyContacts;
      expect(state).toEqual({
        contacts: {},
        contactIds: [],
        primaryContactId: null,
        isLoading: false,
        error: null,
        isInitialized: false,
      });
    });
  });

  describe('selectors', () => {
    beforeEach(() => {
      const contacts = [
        createMockContact({ id: 'contact_1', category: ContactCategory.FAMILY }),
        createMockContact({ id: 'contact_2', category: ContactCategory.MEDICAL, isPrimary: true }),
        createMockContact({ id: 'contact_3', category: ContactCategory.FAMILY }),
      ];
      store.dispatch(setContacts(contacts));
    });

    it('should select all contacts', () => {
      const contacts = selectAllContacts(store.getState());
      expect(contacts).toHaveLength(3);
      expect(contacts[0].id).toBe('contact_1');
    });

    it('should select contact by id', () => {
      const contact = selectContactById(store.getState(), 'contact_2');
      expect(contact?.id).toBe('contact_2');

      const notFound = selectContactById(store.getState(), 'contact_999');
      expect(notFound).toBeNull();
    });

    it('should select primary contact', () => {
      const primary = selectPrimaryContact(store.getState());
      expect(primary?.id).toBe('contact_2');
      expect(primary?.isPrimary).toBe(true);
    });

    it('should select contacts by category', () => {
      const familyContacts = selectContactsByCategory(store.getState(), ContactCategory.FAMILY);
      expect(familyContacts).toHaveLength(2);
      expect(familyContacts.every((c) => c.category === ContactCategory.FAMILY)).toBe(true);

      const medicalContacts = selectContactsByCategory(store.getState(), ContactCategory.MEDICAL);
      expect(medicalContacts).toHaveLength(1);
      expect(medicalContacts[0].category).toBe(ContactCategory.MEDICAL);
    });

    it('should select contacts count', () => {
      const count = selectContactsCount(store.getState());
      expect(count).toBe(3);
    });

    it('should select has primary contact', () => {
      const hasPrimary = selectHasPrimaryContact(store.getState());
      expect(hasPrimary).toBe(true);

      store.dispatch(clearContacts());
      const hasPrimaryAfterClear = selectHasPrimaryContact(store.getState());
      expect(hasPrimaryAfterClear).toBe(false);
    });
  });
});
