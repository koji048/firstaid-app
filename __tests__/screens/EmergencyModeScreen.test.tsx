import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { configureStore } from '@reduxjs/toolkit';
import { Alert, StatusBar } from 'react-native';
import EmergencyModeScreen from '../../src/screens/EmergencyModeScreen';
import emergencyReducer from '../../src/store/slices/emergencySlice';
import {
  ContactCategory,
  ContactRelationship,
  EmergencyContact,
} from '../../src/types/emergencyContact';

// Mock navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
  }),
}));

// Mock StatusBar
jest.spyOn(StatusBar, 'setBarStyle');
jest.spyOn(StatusBar, 'setBackgroundColor');

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockPrimaryContact: EmergencyContact = {
  id: '1',
  name: 'Jane Doe',
  phone: '+1-555-123-4567',
  relationship: ContactRelationship.SPOUSE,
  category: ContactCategory.FAMILY,
  isPrimary: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      emergency: emergencyReducer,
    },
    preloadedState: {
      emergency: {
        contacts: [],
        primaryContact: null,
        isEmergencyMode: false,
        nearbyHospitals: [],
        userLocation: null,
        isLoadingContacts: false,
        isLoadingHospitals: false,
        error: null,
        ...initialState,
      },
    },
  });
};

describe('EmergencyModeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderScreen = (initialState = {}) => {
    const store = createMockStore(initialState);
    return render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyModeScreen />
        </NavigationContainer>
      </Provider>,
    );
  };

  it('should render emergency mode screen correctly', () => {
    const { getByText, getByTestId } = renderScreen();

    expect(getByText('EMERGENCY MODE')).toBeTruthy();
    expect(getByTestId('exit-emergency-mode')).toBeTruthy();
    expect(getByText('What to Tell 911')).toBeTruthy();
    expect(getByText('Nearby Hospitals')).toBeTruthy();
  });

  it('should enable emergency mode on mount', async () => {
    const store = createMockStore({ isEmergencyMode: false });
    render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyModeScreen />
        </NavigationContainer>
      </Provider>,
    );

    await waitFor(() => {
      expect(store.getState().emergency.isEmergencyMode).toBe(true);
    });
  });

  it('should set emergency status bar styles', () => {
    renderScreen();

    expect(StatusBar.setBarStyle).toHaveBeenCalledWith('light-content');
    expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith('#da1e28');
  });

  it('should display primary contact when available', () => {
    const { getByText } = renderScreen({
      primaryContact: mockPrimaryContact,
    });

    expect(getByText('Primary Emergency Contact')).toBeTruthy();
  });

  it('should not display primary contact section when not available', () => {
    const { queryByText } = renderScreen({
      primaryContact: null,
    });

    expect(queryByText('Primary Emergency Contact')).toBeNull();
  });

  it('should show exit confirmation dialog when exit button pressed', () => {
    const { getByTestId } = renderScreen();

    fireEvent.press(getByTestId('exit-emergency-mode'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Exit Emergency Mode',
      'Are you sure you want to exit emergency mode?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Exit' }),
      ]),
    );
  });

  it('should exit emergency mode and navigate back on confirmation', async () => {
    const store = createMockStore({ isEmergencyMode: true });
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <EmergencyModeScreen />
        </NavigationContainer>
      </Provider>,
    );

    fireEvent.press(getByTestId('exit-emergency-mode'));

    // Get the exit callback from Alert.alert
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const exitButton = alertCall[2].find((button: any) => button.text === 'Exit');

    // Execute the exit callback
    exitButton.onPress();

    await waitFor(() => {
      expect(store.getState().emergency.isEmergencyMode).toBe(false);
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should display emergency information correctly', () => {
    const { getByText } = renderScreen();

    expect(getByText('Your Location')).toBeTruthy();
    expect(getByText('Nature of Emergency')).toBeTruthy();
    expect(getByText('Number of People')).toBeTruthy();
    expect(getByText('Stay on the Line')).toBeTruthy();
  });

  it('should display location coordinates when available', () => {
    const { getByText } = renderScreen();

    // Initially shows placeholder text
    expect(getByText('Share your current address or nearest landmark')).toBeTruthy();
  });

  it('should display nearby hospitals placeholder', () => {
    const { getByText } = renderScreen();

    expect(getByText('Hospital information will be available soon')).toBeTruthy();
  });

  it('should reset status bar on unmount', () => {
    const { unmount } = renderScreen();

    unmount();

    expect(StatusBar.setBarStyle).toHaveBeenCalledWith('default');
    expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith('#ffffff');
  });

  it('should render EmergencyServicesButton component', () => {
    const { UNSAFE_getByType } = renderScreen();
    const EmergencyServicesButton =
      require('../../src/components/emergency/EmergencyServicesButton').EmergencyServicesButton;

    expect(UNSAFE_getByType(EmergencyServicesButton)).toBeTruthy();
  });

  it('should render LocationDisplay component', () => {
    const { UNSAFE_getByType } = renderScreen();
    const LocationDisplay =
      require('../../src/components/emergency/LocationDisplay').LocationDisplay;

    const locationDisplay = UNSAFE_getByType(LocationDisplay);
    expect(locationDisplay).toBeTruthy();
    expect(locationDisplay.props.emergencyMode).toBe(true);
    expect(locationDisplay.props.autoFetch).toBe(true);
  });
});
