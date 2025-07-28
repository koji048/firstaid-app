import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Vibration } from 'react-native';
import { EmergencyServicesButton } from '../../../src/components/emergency/EmergencyServicesButton';
import { PhoneService } from '../../../src/services/phone';
import emergencyReducer from '../../../src/store/slices/emergencySlice';

// Mock modules
jest.mock('../../../src/services/phone');
jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
  vibrate: jest.fn(),
}));

const createMockStore = (isEmergencyMode = false) => {
  return configureStore({
    reducer: {
      emergency: emergencyReducer,
    },
    preloadedState: {
      emergency: {
        contacts: [],
        primaryContact: null,
        isEmergencyMode,
        nearbyHospitals: [],
      },
    },
  });
};

describe('EmergencyServicesButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    const store = createMockStore();
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <EmergencyServicesButton />
      </Provider>,
    );

    expect(getByTestId('emergency-services-button')).toBeTruthy();
    expect(getByText('EMERGENCY')).toBeTruthy();
    expect(getByText('Call 911')).toBeTruthy();
    expect(getByTestId('emergency-icon')).toBeTruthy();
  });

  it('should display 911 badge', () => {
    const store = createMockStore();
    const { getByText } = render(
      <Provider store={store}>
        <EmergencyServicesButton />
      </Provider>,
    );

    expect(getByText('911')).toBeTruthy();
  });

  it('should show emergency mode text when in emergency mode', () => {
    const store = createMockStore(true);
    const { getByText } = render(
      <Provider store={store}>
        <EmergencyServicesButton />
      </Provider>,
    );

    expect(getByText('One-tap dialing active')).toBeTruthy();
  });

  it('should trigger haptic feedback on press', async () => {
    const store = createMockStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <EmergencyServicesButton />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(Vibration.vibrate).toHaveBeenCalled();
    });
  });

  it('should call onPress when provided', () => {
    const store = createMockStore();
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Provider store={store}>
        <EmergencyServicesButton onPress={onPress} />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    fireEvent.press(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should make emergency call when pressed without onPress handler', async () => {
    const store = createMockStore();
    const mockResult = { success: true, error: null };
    (PhoneService.makeEmergencyCall as jest.Mock).mockResolvedValue(mockResult);

    const onCallInitiated = jest.fn();
    const onCallCompleted = jest.fn();

    const { getByTestId } = render(
      <Provider store={store}>
        <EmergencyServicesButton
          onCallInitiated={onCallInitiated}
          onCallCompleted={onCallCompleted}
        />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(onCallInitiated).toHaveBeenCalled();
      expect(PhoneService.makeEmergencyCall).toHaveBeenCalledWith('911');
      expect(onCallCompleted).toHaveBeenCalledWith(true);
    });
  });

  it('should handle call failure', async () => {
    const store = createMockStore();
    const mockResult = { success: false, error: 'Call failed' };
    (PhoneService.makeEmergencyCall as jest.Mock).mockResolvedValue(mockResult);
    (PhoneService.handleCallError as jest.Mock).mockImplementation(() => {});

    const onCallCompleted = jest.fn();

    const { getByTestId } = render(
      <Provider store={store}>
        <EmergencyServicesButton onCallCompleted={onCallCompleted} />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(onCallCompleted).toHaveBeenCalledWith(false);
      expect(PhoneService.handleCallError).toHaveBeenCalledWith(
        'Call failed',
        'Emergency Services',
      );
    });
  });

  it('should be disabled when disabled prop is true', () => {
    const store = createMockStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <EmergencyServicesButton disabled={true} />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('should show calling indicator when dialing', async () => {
    const store = createMockStore();
    (PhoneService.makeEmergencyCall as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
    );

    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <EmergencyServicesButton />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('Calling...')).toBeTruthy();
    });
  });

  it('should have correct accessibility properties', () => {
    const store = createMockStore();
    const { getByTestId } = render(
      <Provider store={store}>
        <EmergencyServicesButton />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    expect(button.props.accessibilityLabel).toBe('Call emergency services 911');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityHint).toBe('Double tap to call 911');
  });

  it('should not trigger multiple calls when pressed multiple times', async () => {
    const store = createMockStore();
    (PhoneService.makeEmergencyCall as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
    );

    const { getByTestId } = render(
      <Provider store={store}>
        <EmergencyServicesButton />
      </Provider>,
    );

    const button = getByTestId('emergency-services-button');
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    await waitFor(() => {
      expect(PhoneService.makeEmergencyCall).toHaveBeenCalledTimes(1);
    });
  });
});
