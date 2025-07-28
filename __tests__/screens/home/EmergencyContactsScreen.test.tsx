import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EmergencyContactsScreen from '../../../src/screens/home/EmergencyContactsScreen';
import authReducer from '../../../src/store/slices/authSlice';
import emergencyContactsReducer from '../../../src/store/slices/emergencyContactsSlice';
import * as hooks from '../../../src/hooks/useEmergencyContacts';
import {
  EmergencyContact,
  ContactCategory,
  ContactRelationship,
} from '../../../src/types/emergencyContact';

jest.mock('../../../src/hooks/useEmergencyContacts');

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    setOptions: mockSetOptions,
  }),
}));

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
];

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      emergencyContacts: emergencyContactsReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: { id: 'test-user-id' },
      },
      emergencyContacts: {
        contacts: {
          '1': mockContacts[0],
        },
        contactIds: ['1'],
        primaryContactId: '1',
        isLoading: false,
        error: null,
        isInitialized: true,
        searchQuery: '',
      },
    },
  });
};

describe('EmergencyContactsScreen', () => {
  const mockDeleteContact = jest.fn();
  const mockRefreshContacts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (hooks.useEmergencyContacts as jest.Mock).mockReturnValue({
      contacts: mockContacts,
      loading: false,
      refreshing: false,
      refreshContacts: mockRefreshContacts,
    });
    (hooks.useDeleteContact as jest.Mock).mockReturnValue({
      deleteContact: mockDeleteContact,
    });
  });

  it('renders contacts list and search bar', () => {
    const store = createTestStore();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyContactsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(getByPlaceholderText('Search by name, phone, or notes')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('sets up header with add button', () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyContactsScreen />
        </NavigationContainer>
      </Provider>,
    );

    expect(mockSetOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        headerRight: expect.any(Function),
      }),
    );
  });

  it('navigates to edit screen when edit pressed', () => {
    const store = createTestStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyContactsScreen />
        </NavigationContainer>
      </Provider>,
    );

    const editButton = getByTestId('edit-button');
    fireEvent.press(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('Home', {
      screen: 'AddEmergencyContact',
      params: { contactId: '1' },
    });
  });

  it('shows delete confirmation when delete pressed', () => {
    const store = createTestStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyContactsScreen />
        </NavigationContainer>
      </Provider>,
    );

    const deleteButton = getByTestId('delete-button');
    fireEvent.press(deleteButton);

    // Alert.alert is mocked by React Native Testing Library
    expect(mockDeleteContact).not.toHaveBeenCalled(); // Not called until confirmation
  });

  it('filters contacts based on search query', async () => {
    const store = createTestStore();
    const { getByPlaceholderText, getByText, queryByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyContactsScreen />
        </NavigationContainer>
      </Provider>,
    );

    const searchInput = getByPlaceholderText('Search by name, phone, or notes');
    fireEvent.changeText(searchInput, 'Jane');

    await waitFor(() => {
      expect(queryByText('John Doe')).toBeNull();
    });
  });
});
