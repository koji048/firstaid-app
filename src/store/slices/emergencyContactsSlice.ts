import { createSlice, PayloadAction, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import {
  EmergencyContact,
  EmergencyContactsState,
  NewEmergencyContact,
  UpdateEmergencyContact,
  ContactCategory,
} from '../../types';
import { RootState } from '../store';
import { emergencyContactsStorage } from '../../storage/emergencyContactsStorage';
import { migrationRunner } from '../../storage/migrations';

/**
 * Initial state for emergency contacts
 */
const initialState: EmergencyContactsState = {
  contacts: {},
  contactIds: [],
  primaryContactId: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

/**
 * Async thunks for storage operations
 */

// Load contacts from storage
export const loadContactsFromStorage = createAsyncThunk(
  'emergencyContacts/loadFromStorage',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Run migrations if needed
      await migrationRunner.migrateUserStorage(userId);

      // Load contacts
      const contacts = await emergencyContactsStorage.loadContacts(userId);
      return contacts || [];
    } catch (error) {
      console.error('Failed to load contacts from storage:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load contacts');
    }
  },
);

// Save contacts to storage
export const saveContactsToStorage = createAsyncThunk(
  'emergencyContacts/saveToStorage',
  async (
    { userId, contacts }: { userId: string; contacts: EmergencyContact[] },
    { rejectWithValue },
  ) => {
    try {
      await emergencyContactsStorage.saveContacts(contacts, userId);
      return true;
    } catch (error) {
      console.error('Failed to save contacts to storage:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save contacts');
    }
  },
);

// Add contact with storage sync
export const addContactWithStorage = createAsyncThunk(
  'emergencyContacts/addWithStorage',
  async (
    { userId, contact }: { userId: string; contact: NewEmergencyContact },
    { dispatch, getState },
  ) => {
    // Generate ID and timestamps
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to Redux state
    dispatch(addContact(newContact));

    // Get all contacts and save to storage
    const state = getState() as RootState;
    const allContacts = selectAllContacts(state);
    await emergencyContactsStorage.saveContacts(allContacts, userId);

    return newContact;
  },
);

// Update contact with storage sync
export const updateContactWithStorage = createAsyncThunk(
  'emergencyContacts/updateWithStorage',
  async (
    { userId, id, updates }: { userId: string; id: string; updates: UpdateEmergencyContact },
    { dispatch, getState },
  ) => {
    // Update in Redux state
    dispatch(updateContact({ id, updates }));

    // Get all contacts and save to storage
    const state = getState() as RootState;
    const allContacts = selectAllContacts(state);
    await emergencyContactsStorage.saveContacts(allContacts, userId);

    return { id, updates };
  },
);

// Delete contact with storage sync
export const deleteContactWithStorage = createAsyncThunk(
  'emergencyContacts/deleteWithStorage',
  async ({ userId, contactId }: { userId: string; contactId: string }, { dispatch, getState }) => {
    // Delete from Redux state
    dispatch(deleteContact(contactId));

    // Get all contacts and save to storage
    const state = getState() as RootState;
    const allContacts = selectAllContacts(state);
    await emergencyContactsStorage.saveContacts(allContacts, userId);

    return contactId;
  },
);

/**
 * Emergency contacts slice
 */
const emergencyContactsSlice = createSlice({
  name: 'emergencyContacts',
  initialState,
  reducers: {
    /**
     * Add a new emergency contact
     */
    addContact: (state, action: PayloadAction<EmergencyContact>) => {
      const contact = action.payload;
      state.contacts[contact.id] = contact;
      state.contactIds.push(contact.id);

      // If this is the first contact or marked as primary, set as primary
      if (contact.isPrimary || state.contactIds.length === 1) {
        state.primaryContactId = contact.id;
        // Ensure only one primary contact
        Object.keys(state.contacts).forEach((id) => {
          if (id !== contact.id) {
            state.contacts[id].isPrimary = false;
          }
        });
      }
    },

    /**
     * Update an existing emergency contact
     */
    updateContact: (
      state,
      action: PayloadAction<{ id: string; updates: UpdateEmergencyContact }>,
    ) => {
      const { id, updates } = action.payload;
      if (state.contacts[id]) {
        state.contacts[id] = {
          ...state.contacts[id],
          ...updates,
          updatedAt: new Date(),
        };

        // Handle primary contact update
        if (updates.isPrimary === true) {
          state.primaryContactId = id;
          // Ensure only one primary contact
          Object.keys(state.contacts).forEach((contactId) => {
            if (contactId !== id) {
              state.contacts[contactId].isPrimary = false;
            }
          });
        } else if (updates.isPrimary === false && state.primaryContactId === id) {
          state.primaryContactId = null;
        }
      }
    },

    /**
     * Delete an emergency contact
     */
    deleteContact: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.contacts[id];
      state.contactIds = state.contactIds.filter((contactId) => contactId !== id);

      // If deleting primary contact, clear primary
      if (state.primaryContactId === id) {
        state.primaryContactId = null;
      }
    },

    /**
     * Set all contacts (bulk update)
     */
    setContacts: (state, action: PayloadAction<EmergencyContact[]>) => {
      const contacts = action.payload;
      state.contacts = {};
      state.contactIds = [];
      state.primaryContactId = null;

      contacts.forEach((contact) => {
        state.contacts[contact.id] = contact;
        state.contactIds.push(contact.id);
        if (contact.isPrimary) {
          state.primaryContactId = contact.id;
        }
      });

      state.isInitialized = true;
    },

    /**
     * Set primary contact
     */
    setPrimaryContact: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.contacts[id]) {
        // Clear previous primary
        if (state.primaryContactId) {
          state.contacts[state.primaryContactId].isPrimary = false;
        }

        // Set new primary
        state.contacts[id].isPrimary = true;
        state.primaryContactId = id;
      }
    },

    /**
     * Set loading state
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set error state
     */
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * Clear all contacts
     */
    clearContacts: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Load contacts from storage
    builder
      .addCase(loadContactsFromStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadContactsFromStorage.fulfilled, (state, action) => {
        const contacts = action.payload;
        state.contacts = {};
        state.contactIds = [];
        state.primaryContactId = null;

        contacts.forEach((contact) => {
          state.contacts[contact.id] = contact;
          state.contactIds.push(contact.id);
          if (contact.isPrimary) {
            state.primaryContactId = contact.id;
          }
        });

        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(loadContactsFromStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isInitialized = true; // Mark as initialized even on error
      });

    // Save contacts to storage
    builder.addCase(saveContactsToStorage.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Add contact with storage
    builder
      .addCase(addContactWithStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addContactWithStorage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addContactWithStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to add contact';
      });

    // Update contact with storage
    builder
      .addCase(updateContactWithStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateContactWithStorage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateContactWithStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update contact';
      });

    // Delete contact with storage
    builder
      .addCase(deleteContactWithStorage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteContactWithStorage.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteContactWithStorage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete contact';
      });
  },
});

/**
 * Actions
 */
export const {
  addContact,
  updateContact,
  deleteContact,
  setContacts,
  setPrimaryContact,
  setLoading,
  setError,
  clearContacts,
} = emergencyContactsSlice.actions;

/**
 * Selectors
 */

// Basic selectors
export const selectEmergencyContactsState = (state: RootState) => state.emergencyContacts;
export const selectContactsObject = (state: RootState) => state.emergencyContacts.contacts;
export const selectContactIds = (state: RootState) => state.emergencyContacts.contactIds;
export const selectPrimaryContactId = (state: RootState) =>
  state.emergencyContacts.primaryContactId;
export const selectIsLoading = (state: RootState) => state.emergencyContacts.isLoading;
export const selectError = (state: RootState) => state.emergencyContacts.error;
export const selectIsInitialized = (state: RootState) => state.emergencyContacts.isInitialized;

// Memoized selectors
export const selectAllContacts = createSelector(
  [selectContactsObject, selectContactIds],
  (contacts, ids) => ids.map((id) => contacts[id]).filter(Boolean),
);

export const selectContactById = createSelector(
  [selectContactsObject, (state: RootState, contactId: string) => contactId],
  (contacts, contactId) => contacts[contactId] || null,
);

export const selectPrimaryContact = createSelector(
  [selectContactsObject, selectPrimaryContactId],
  (contacts, primaryId) => (primaryId ? contacts[primaryId] || null : null),
);

export const selectContactsByCategory = createSelector(
  [selectAllContacts, (state: RootState, category: ContactCategory) => category],
  (contacts, category) => contacts.filter((contact) => contact.category === category),
);

export const selectContactsCount = createSelector([selectContactIds], (ids) => ids.length);

export const selectHasPrimaryContact = createSelector(
  [selectPrimaryContactId],
  (primaryId) => primaryId !== null,
);

/**
 * Reducer
 */
export default emergencyContactsSlice.reducer;
