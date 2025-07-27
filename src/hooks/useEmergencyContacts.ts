/**
 * Emergency Contacts Hooks
 *
 * Custom React hooks for managing emergency contacts
 * with Redux state and storage persistence
 */

import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import {
  selectAllContacts,
  selectPrimaryContact,
  selectContactById,
  selectContactsByCategory,
  selectIsLoading,
  selectError,
  selectIsInitialized,
  loadContactsFromStorage,
  addContactWithStorage,
  updateContactWithStorage,
  deleteContactWithStorage,
  setPrimaryContact,
  saveContactsToStorage,
} from '../store/slices/emergencyContactsSlice';
import { RootState } from '../store/store';
import { NewEmergencyContact, UpdateEmergencyContact, ContactCategory } from '../types';

/**
 * Hook to get all emergency contacts
 */
export const useEmergencyContacts = () => {
  const dispatch = useAppDispatch();
  const userId = useUserId();
  const contacts = useSelector(selectAllContacts);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const isInitialized = useSelector(selectIsInitialized);

  // Load contacts on mount if not initialized
  useEffect(() => {
    if (!isInitialized && userId) {
      dispatch(loadContactsFromStorage(userId));
    }
  }, [dispatch, isInitialized, userId]);

  return {
    contacts,
    isLoading,
    error,
    isInitialized,
  };
};

/**
 * Hook to get the primary emergency contact
 */
export const usePrimaryContact = () => {
  const primaryContact = useSelector(selectPrimaryContact);
  const isLoading = useSelector(selectIsLoading);

  return {
    primaryContact,
    isLoading,
  };
};

/**
 * Hook to add a new emergency contact
 */
export const useAddContact = () => {
  const dispatch = useAppDispatch();
  const userId = useUserId();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const addContact = useCallback(
    async (contact: NewEmergencyContact) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await dispatch(addContactWithStorage({ userId, contact })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to add contact:', error);
        throw error;
      }
    },
    [dispatch, userId],
  );

  return {
    addContact,
    isLoading,
    error,
  };
};

/**
 * Hook to update an existing emergency contact
 */
export const useUpdateContact = () => {
  const dispatch = useAppDispatch();
  const userId = useUserId();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const updateContact = useCallback(
    async (id: string, updates: UpdateEmergencyContact) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await dispatch(updateContactWithStorage({ userId, id, updates })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to update contact:', error);
        throw error;
      }
    },
    [dispatch, userId],
  );

  return {
    updateContact,
    isLoading,
    error,
  };
};

/**
 * Hook to delete an emergency contact
 */
export const useDeleteContact = () => {
  const dispatch = useAppDispatch();
  const userId = useUserId();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const deleteContact = useCallback(
    async (contactId: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const result = await dispatch(deleteContactWithStorage({ userId, contactId })).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to delete contact:', error);
        throw error;
      }
    },
    [dispatch, userId],
  );

  return {
    deleteContact,
    isLoading,
    error,
  };
};

/**
 * Hook to manage primary contact
 */
export const useSetPrimaryContact = () => {
  const dispatch = useAppDispatch();
  const userId = useUserId();
  const contacts = useSelector(selectAllContacts);

  const setAsPrimary = useCallback(
    async (contactId: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      dispatch(setPrimaryContact(contactId));

      // Save to storage
      try {
        await dispatch(saveContactsToStorage({ userId, contacts })).unwrap();
      } catch (error) {
        console.error('Failed to save primary contact change:', error);
        throw error;
      }
    },
    [dispatch, contacts, userId],
  );

  return {
    setAsPrimary,
  };
};

/**
 * Hook to get emergency contact by ID
 */
export const useEmergencyContact = (contactId: string) => {
  const contact = useSelector((state: RootState) => selectContactById(state, contactId));

  return contact;
};

/**
 * Hook to get emergency contacts by category
 */
export const useEmergencyContactsByCategory = (category: ContactCategory) => {
  const contacts = useSelector((state: RootState) => selectContactsByCategory(state, category));

  return contacts;
};

/**
 * Hook to sync contacts with storage
 */
export const useSyncContacts = () => {
  const dispatch = useAppDispatch();
  const userId = useUserId();
  const contacts = useSelector(selectAllContacts);
  const isLoading = useSelector(selectIsLoading);

  const syncContacts = useCallback(async () => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      await dispatch(saveContactsToStorage({ userId, contacts })).unwrap();
    } catch (error) {
      console.error('Failed to sync contacts:', error);
      throw error;
    }
  }, [dispatch, contacts, userId]);

  return {
    syncContacts,
    isLoading,
  };
};

/**
 * Helper hook to get current user ID from auth state
 */
const useUserId = (): string | null => {
  const user = useSelector((state: RootState) => state.auth.user);
  return user?.id || null;
};
