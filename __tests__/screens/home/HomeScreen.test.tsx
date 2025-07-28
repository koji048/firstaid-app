import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { configureStore } from '@reduxjs/toolkit';
import HomeScreen from '../../../src/screens/home/HomeScreen';
import emergencyReducer from '../../../src/store/slices/emergencySlice';
import guidesReducer from '../../../src/store/slices/guidesSlice';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('react-native-elements', () => ({
  Icon: ({ name, testID }: any) => React.createElement('Text', { testID }, name),
}));

jest.mock('../../../src/components/emergency/EmergencyModeToggle/EmergencyModeToggle', () => ({
  EmergencyModeToggle: ({ isEmergencyMode, onToggle, testID }: any) => 
    React.createElement('Text', {
      testID,
      onPress: () => onToggle(!isEmergencyMode),
    }, `Emergency Mode: ${isEmergencyMode ? 'ON' : 'OFF'}`),
}));

jest.mock('../../../src/components/guides/QuickActionsBar/QuickActionsBar', () => ({
  QuickActionsBar: ({ testID }: any) => 
    React.createElement('Text', { testID }, 'Quick Actions Bar'),
}));

const Stack = createStackNavigator();

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      emergency: emergencyReducer,
      guides: guidesReducer,
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
      },
      guides: {
        guides: [],
        currentGuide: null,
        bookmarks: [],
        downloadedGuides: [],
        isLoading: false,
        error: null,
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={() => component} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render welcome header with app title', () => {
    renderWithProviders(<HomeScreen />);

    expect(screen.getByText('Welcome to')).toBeTruthy();
    expect(screen.getByText('First Aid Room')).toBeTruthy();
    expect(screen.getByText('Quick access to emergency services and first aid guidance')).toBeTruthy();
  });

  it('should render emergency mode toggle', () => {
    renderWithProviders(<HomeScreen />);

    expect(screen.getByTestId('home-emergency-toggle')).toBeTruthy();
    expect(screen.getByText('Emergency Mode: OFF')).toBeTruthy();
  });

  it('should render all quick action cards', () => {
    renderWithProviders(<HomeScreen />);

    expect(screen.getByText('Emergency Contacts')).toBeTruthy();
    expect(screen.getByText('First Aid Guides')).toBeTruthy();
    expect(screen.getByText('Medical Profile')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
  });

  it('should show quick actions bar when emergency mode is enabled', () => {
    const store = createMockStore({
      emergency: {
        contacts: [],
        primaryContact: null,
        isEmergencyMode: true,
        nearbyHospitals: [],
        userLocation: null,
        isLoadingContacts: false,
        isLoadingHospitals: false,
        error: null,
      },
    });

    renderWithProviders(<HomeScreen />, store);

    expect(screen.getByTestId('home-quick-actions')).toBeTruthy();
    expect(screen.getByText('Quick Actions Bar')).toBeTruthy();
  });

  it('should hide quick actions bar when emergency mode is disabled', () => {
    renderWithProviders(<HomeScreen />);

    expect(screen.queryByTestId('home-quick-actions')).toBeNull();
  });

  it('should display contact count in emergency contacts card', () => {
    const store = createMockStore({
      emergency: {
        contacts: [
          { id: '1', name: 'John Doe', phone: '123-456-7890', relationship: 'spouse', isPrimary: true },
          { id: '2', name: 'Jane Smith', phone: '987-654-3210', relationship: 'friend', isPrimary: false },
        ],
        primaryContact: null,
        isEmergencyMode: false,
        nearbyHospitals: [],
        userLocation: null,
        isLoadingContacts: false,
        isLoadingHospitals: false,
        error: null,
      },
    });

    renderWithProviders(<HomeScreen />, store);

    expect(screen.getByText('2 contacts saved')).toBeTruthy();
  });

  it('should display guide count in first aid guides card', () => {
    const store = createMockStore({
      guides: {
        guides: [
          { id: '1', title: 'CPR Guide', category: 'cardiopulmonary' },
          { id: '2', title: 'First Aid Basics', category: 'general' },
          { id: '3', title: 'Wound Care', category: 'trauma' },
        ],
        currentGuide: null,
        bookmarks: [],
        downloadedGuides: [],
        isLoading: false,
        error: null,
      },
    });

    renderWithProviders(<HomeScreen />, store);

    expect(screen.getByText('3 guides available')).toBeTruthy();
  });

  it('should show primary contact section when primary contact exists', () => {
    const primaryContact = {
      id: '1',
      name: 'John Doe',
      phone: '123-456-7890',
      relationship: 'spouse',
      isPrimary: true,
      category: 'family' as const,
    };

    const store = createMockStore({
      emergency: {
        contacts: [primaryContact],
        primaryContact,
        isEmergencyMode: false,
        nearbyHospitals: [],
        userLocation: null,
        isLoadingContacts: false,
        isLoadingHospitals: false,
        error: null,
      },
    });

    renderWithProviders(<HomeScreen />, store);

    expect(screen.getByText('Primary Emergency Contact')).toBeTruthy();
    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('spouse • 123-456-7890')).toBeTruthy();
  });

  it('should have proper accessibility labels for all interactive elements', () => {
    renderWithProviders(<HomeScreen />);

    expect(screen.getByLabelText('Emergency Contacts. Add emergency contacts')).toBeTruthy();
    expect(screen.getByLabelText('First Aid Guides. Browse medical guides')).toBeTruthy();
    expect(screen.getByLabelText('Medical Profile. View your medical information')).toBeTruthy();
    expect(screen.getByLabelText('Settings. App preferences and data')).toBeTruthy();
  });

  it('should handle navigation to different sections', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    renderWithProviders(<HomeScreen />);

    // Test emergency contacts navigation
    fireEvent.press(screen.getByTestId('emergency-contacts-card'));
    expect(mockNavigate).toHaveBeenCalledWith('EmergencyContacts');

    // Test guides navigation
    fireEvent.press(screen.getByTestId('guides-card'));
    expect(mockNavigate).toHaveBeenCalledWith('GuidesStack', { screen: 'GuidesList' });

    // Test medical profile navigation
    fireEvent.press(screen.getByTestId('medical-profile-card'));
    expect(mockNavigate).toHaveBeenCalledWith('MedicalStack', { screen: 'MedicalProfile' });

    // Test settings navigation
    fireEvent.press(screen.getByTestId('settings-card'));
    expect(mockNavigate).toHaveBeenCalledWith('SettingsStack', { screen: 'Settings' });
  });
});