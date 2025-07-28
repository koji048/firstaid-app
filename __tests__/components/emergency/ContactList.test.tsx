import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ContactList } from '../../../src/components/emergency/ContactList';
import {
  EmergencyContact,
  ContactCategory,
  ContactRelationship,
} from '../../../src/types/emergencyContact';
import emergencyContactsReducer, {
  setSearchQuery,
} from '../../../src/store/slices/emergencyContactsSlice';
import * as hooks from '../../../src/hooks/useEmergencyContacts';

jest.mock('../../../src/hooks/useEmergencyContacts');

const mockContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1234567890',
    relationship: ContactRelationship.PARENT,
    category: ContactCategory.FAMILY,
    isPrimary: true,
    notes: 'Dad',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dr. Smith',
    phone: '+0987654321',
    relationship: ContactRelationship.DOCTOR,
    category: ContactCategory.MEDICAL,
    isPrimary: false,
    notes: 'Family doctor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('ContactList', () => {
  const mockOnContactPress = jest.fn();
  const mockOnEditPress = jest.fn();
  const mockOnDeletePress = jest.fn();
  const mockRefreshContacts = jest.fn();
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = configureStore({
      reducer: {
        emergencyContacts: emergencyContactsReducer,
      },
      preloadedState: {
        emergencyContacts: {
          contacts: mockContacts.reduce((acc, contact) => ({ ...acc, [contact.id]: contact }), {}),
          contactIds: mockContacts.map((c) => c.id),
          primaryContactId: '1',
          isLoading: false,
          error: null,
          isInitialized: true,
          searchQuery: '',
        },
      },
    });
    (hooks.useEmergencyContacts as jest.Mock).mockReturnValue({
      contacts: mockContacts,
      loading: false,
      refreshing: false,
      refreshContacts: mockRefreshContacts,
    });
  });

  it('renders contacts grouped by category', () => {
    const { getByText } = render(
      <Provider store={store}>
        <ContactList
          onContactPress={mockOnContactPress}
          onEditPress={mockOnEditPress}
          onDeletePress={mockOnDeletePress}
        />
      </Provider>,
    );

    expect(getByText('Family')).toBeTruthy();
    expect(getByText('Medical')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Dr. Smith')).toBeTruthy();
  });

  it('shows empty state when no contacts', () => {
    store = configureStore({
      reducer: {
        emergencyContacts: emergencyContactsReducer,
      },
      preloadedState: {
        emergencyContacts: {
          contacts: {},
          contactIds: [],
          primaryContactId: null,
          isLoading: false,
          error: null,
          isInitialized: true,
          searchQuery: '',
        },
      },
    });
    (hooks.useEmergencyContacts as jest.Mock).mockReturnValue({
      contacts: [],
      loading: false,
      refreshing: false,
      refreshContacts: mockRefreshContacts,
    });

    const { getByText } = render(
      <Provider store={store}>
        <ContactList
          onContactPress={mockOnContactPress}
          onEditPress={mockOnEditPress}
          onDeletePress={mockOnDeletePress}
        />
      </Provider>,
    );

    expect(getByText('No Emergency Contacts')).toBeTruthy();
  });

  it('filters contacts based on search query', () => {
    store.dispatch(setSearchQuery('john'));

    const { getByText, queryByText } = render(
      <Provider store={store}>
        <ContactList
          onContactPress={mockOnContactPress}
          onEditPress={mockOnEditPress}
          onDeletePress={mockOnDeletePress}
        />
      </Provider>,
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(queryByText('Dr. Smith')).toBeNull();
  });

  it('shows no results message when search yields no matches', () => {
    store.dispatch(setSearchQuery('xyz'));

    const { getByText } = render(
      <Provider store={store}>
        <ContactList
          onContactPress={mockOnContactPress}
          onEditPress={mockOnEditPress}
          onDeletePress={mockOnDeletePress}
        />
      </Provider>,
    );

    expect(getByText('No contacts found matching "xyz"')).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    (hooks.useEmergencyContacts as jest.Mock).mockReturnValue({
      contacts: [],
      loading: true,
      refreshing: false,
      refreshContacts: mockRefreshContacts,
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <ContactList
          onContactPress={mockOnContactPress}
          onEditPress={mockOnEditPress}
          onDeletePress={mockOnDeletePress}
        />
      </Provider>,
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
