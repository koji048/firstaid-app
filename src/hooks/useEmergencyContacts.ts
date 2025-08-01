/**
 * Emergency Contacts Hooks
 *
 * Custom React hooks for managing emergency contacts
 * with Redux state and storage persistence
 */

import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import {
  addContactWithStorage,
  deleteContactWithStorage,
  loadContactsFromStorage,
  saveContactsToStorage,
  selectAllContacts,
  selectContactById,
  selectContactsByCategory,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectPrimaryContact,
  setPrimaryContact,
  updateContactWithStorage,
} from '../store/slices/emergencyContactsSlice';
import { RootState } from '../store/store';
import { ContactCategory, NewEmergencyContact, UpdateEmergencyContact } from '../types';

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
  const [refreshing, setRefreshing] = React.useState(false);

  // Load contacts on mount if not initialized
  useEffect(() => {
    if (!isInitialized && userId) {
      dispatch(loadContactsFromStorage(userId));
    }
  }, [dispatch, isInitialized, userId]);

  const refreshContacts = useCallback(async () => {
    if (!userId) {
      return;
    }

    setRefreshing(true);
    try {
      await dispatch(loadContactsFromStorage(userId)).unwrap();
    } catch (err) {
      console.error('Failed to refresh contacts:', err);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, userId]);

  return {
    contacts,
    loading: isLoading,
    refreshing,
    error,
    isInitialized,
    refreshContacts,
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
      } catch (err) {
        console.error('Failed to add contact:', err);
        throw err;
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
      } catch (err) {
        console.error('Failed to update contact:', err);
        throw err;
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
      } catch (err) {
        console.error('Failed to delete contact:', err);
        throw err;
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
      } catch (err) {
        console.error('Failed to save primary contact change:', err);
        throw err;
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
    } catch (err) {
      console.error('Failed to sync contacts:', err);
      throw err;
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
