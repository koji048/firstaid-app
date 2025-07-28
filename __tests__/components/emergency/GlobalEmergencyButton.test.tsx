import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Alert, Linking } from 'react-native';
import { GlobalEmergencyButton } from '../../../src/components/emergency/GlobalEmergencyButton/GlobalEmergencyButton';
import emergencyReducer from '../../../src/store/slices/emergencySlice';

// Mock dependencies
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(),
    },
    Vibration: {
      vibrate: jest.fn(),
    },
  };
});

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native-elements', () => ({
  Icon: ({ name, testID }: any) => React.createElement('Text', { testID }, name),
}));

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

const renderWithStore = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('GlobalEmergencyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render emergency button with proper accessibility labels', () => {
    renderWithStore(<GlobalEmergencyButton />);

    const button = screen.getByTestId('emergency-button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Emergency button - Access emergency services');
    expect(button.props.accessibilityHint).toBe('Double tap for options, long press to enable emergency mode');
  });

  it('should show phone icon in normal mode', () => {
    renderWithStore(<GlobalEmergencyButton />);

    expect(screen.getByText('phone')).toBeTruthy();
  });

  it('should show emergency icon in emergency mode', () => {
    const store = createMockStore({
      isEmergencyMode: true,
    });

    renderWithStore(<GlobalEmergencyButton />, store);

    expect(screen.getByText('emergency')).toBeTruthy();
    expect(screen.getByText('EMERGENCY')).toBeTruthy();
  });

  it('should show emergency status indicator when in emergency mode', () => {
    const store = createMockStore({
      isEmergencyMode: true,
    });

    renderWithStore(<GlobalEmergencyButton />, store);

    expect(screen.getByText('EMERGENCY')).toBeTruthy();
  });

  it('should show options alert on press in normal mode', () => {
    const mockAlert = Alert.alert as jest.Mock;
    renderWithStore(<GlobalEmergencyButton />);

    fireEvent.press(screen.getByTestId('emergency-button'));

    expect(mockAlert).toHaveBeenCalledWith(
      'Emergency Options',
      'Choose an emergency action:',
      expect.arrayContaining([
        { text: 'Cancel', style: 'cancel' },
        expect.objectContaining({ text: 'Call Emergency Services' }),
        expect.objectContaining({ text: 'Enable Emergency Mode' }),
      ]),
      { cancelable: true }
    );
  });

  it('should call emergency services directly in emergency mode', () => {
    const mockAlert = Alert.alert as jest.Mock;
    const store = createMockStore({
      isEmergencyMode: true,
    });

    renderWithStore(<GlobalEmergencyButton />, store);

    fireEvent.press(screen.getByTestId('emergency-button'));

    expect(mockAlert).toHaveBeenCalledWith(
      'Emergency Call',
      'Call Emergency Services at 911?',
      expect.arrayContaining([
        { text: 'Cancel', style: 'cancel' },
        expect.objectContaining({ text: 'Call Now' }),
      ]),
      { cancelable: true }
    );
  });

  it('should call primary contact when available', () => {
    const mockAlert = Alert.alert as jest.Mock;
    const primaryContact = {
      id: '1',
      name: 'John Doe',
      phone: '123-456-7890',
      relationship: 'spouse',
      isPrimary: true,
      category: 'family' as const,
    };

    const store = createMockStore({
      isEmergencyMode: true,
      primaryContact,
    });

    renderWithStore(<GlobalEmergencyButton />, store);

    fireEvent.press(screen.getByTestId('emergency-button'));

    expect(mockAlert).toHaveBeenCalledWith(
      'Emergency Call',
      'Call John Doe at 123-456-7890?',
      expect.any(Array),
      { cancelable: true }
    );
  });

  it('should handle long press to enable emergency mode', () => {
    const mockAlert = Alert.alert as jest.Mock;
    renderWithStore(<GlobalEmergencyButton />);

    fireEvent(screen.getByTestId('emergency-button'), 'longPress');

    expect(mockAlert).toHaveBeenCalledWith(
      'Enable Emergency Mode',
      'This will enable one-tap calling and quick access to emergency features.',
      expect.arrayContaining([
        { text: 'Cancel', style: 'cancel' },
        expect.objectContaining({ text: 'Enable' }),
      ]),
    );
  });

  it('should make phone call when call option is selected', async () => {
    const mockAlert = Alert.alert as jest.Mock;
    const mockLinking = Linking.openURL as jest.Mock;
    mockLinking.mockResolvedValue(true);

    renderWithStore(<GlobalEmergencyButton />);

    fireEvent.press(screen.getByTestId('emergency-button'));

    // Simulate pressing the "Call Emergency Services" option
    const alertCalls = mockAlert.mock.calls;
    const lastCall = alertCalls[alertCalls.length - 1];
    const callOption = lastCall[2].find((option: any) => option.text === 'Call Emergency Services');
    
    if (callOption && callOption.onPress) {
      callOption.onPress();
    }

    // Now the call confirmation alert should appear
    expect(mockAlert).toHaveBeenCalledWith(
      'Emergency Call',
      'Call Emergency Services at 911?',
      expect.any(Array),
      { cancelable: true }
    );

    // Simulate confirming the call
    const confirmationCalls = mockAlert.mock.calls;
    const confirmationCall = confirmationCalls[confirmationCalls.length - 1];
    const confirmOption = confirmationCall[2].find((option: any) => option.text === 'Call Now');
    
    if (confirmOption && confirmOption.onPress) {
      confirmOption.onPress();
    }

    await waitFor(() => {
      expect(mockLinking).toHaveBeenCalledWith('tel:911');
    });
  });

  it('should use custom emergency number when provided', () => {
    const mockAlert = Alert.alert as jest.Mock;
    renderWithStore(<GlobalEmergencyButton emergencyNumber="000" />);

    fireEvent.press(screen.getByTestId('emergency-button'));

    // Check that the custom number is used in the alert
    expect(mockAlert).toHaveBeenCalledWith(
      'Emergency Options',
      'Choose an emergency action:',
      expect.any(Array),
      { cancelable: true }
    );
  });

  it('should have proper accessibility labels in emergency mode', () => {
    const store = createMockStore({
      isEmergencyMode: true,
    });

    renderWithStore(<GlobalEmergencyButton />, store);

    const button = screen.getByTestId('emergency-button');
    expect(button.props.accessibilityLabel).toBe('Emergency call button - One tap to call emergency contact');
    expect(button.props.accessibilityHint).toBe('Double tap to call, long press for options');
  });
});