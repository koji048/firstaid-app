import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from '../../../src/store';
import EmergencyContactsScreen from '../../../src/screens/home/EmergencyContactsScreen';
import { PhoneService } from '../../../src/services/phone';
import { LocationService } from '../../../src/services/location';
import { emergencyContactsSlice } from '../../../src/store/slices/emergencyContactsSlice';

// Mock dependencies
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../../src/services/phone', () => ({
  PhoneService: {
    makePhoneCall: jest.fn(),
    validatePhoneNumber: jest.fn().mockReturnValue(true),
    formatPhoneNumber: jest.fn((phone) => phone),
    showCallErrorAlert: jest.fn(),
  },
}));

jest.mock('../../../src/services/location', () => ({
  LocationService: {
    requestLocationPermission: jest.fn().mockResolvedValue(true),
    getCurrentLocation: jest.fn().mockResolvedValue({
      success: true,
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: Date.now(),
      },
    }),
    startLocationWatch: jest.fn().mockResolvedValue(123),
    stopLocationWatch: jest.fn(),
    generateShareUrl: jest.fn().mockReturnValue('https://maps.google.com/?q=37.7749,-122.4194'),
    createShareData: jest.fn().mockReturnValue({
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
      shareUrl: 'https://maps.google.com/?q=37.7749,-122.4194',
      timestamp: Date.now(),
    }),
    formatLocation: jest.fn().mockReturnValue('37.7749, -122.4194 (±10m)'),
    clearLocationData: jest.fn(),
    getLastKnownLocation: jest.fn().mockReturnValue(null),
    showPermissionDeniedAlert: jest.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <NavigationContainer>{component}</NavigationContainer>
    </Provider>,
  );
};

describe('Emergency Quick Dial Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    store.dispatch(emergencyContactsSlice.actions.clearContacts());
    store.dispatch(emergencyContactsSlice.actions.setEmergencyMode(false));

    // Add test contacts
    store.dispatch(
      emergencyContactsSlice.actions.addContact({
        id: '1',
        name: 'Emergency Contact 1',
        phoneNumber: '555-123-4567',
        relationship: 'Parent',
        isPrimary: true,
      }),
    );

    store.dispatch(
      emergencyContactsSlice.actions.addContact({
        id: '2',
        name: 'Emergency Contact 2',
        phoneNumber: '555-987-6543',
        relationship: 'Spouse',
        isPrimary: false,
      }),
    );
  });

  describe('Normal Mode Call Flow', () => {
    it('should show call confirmation before dialing in normal mode', async () => {
      (PhoneService.makePhoneCall as jest.Mock).mockResolvedValue({ success: true });

      const { getByTestId, getByText } = renderWithProviders(<EmergencyContactsScreen />);

      // Find and tap the primary contact's dial button
      const primaryDialButton = getByTestId('quick-dial-button-1');
      fireEvent.press(primaryDialButton);

      // Confirmation modal should appear
      await waitFor(() => {
        expect(getByText(/call emergency contact 1/i)).toBeTruthy();
        expect(getByText('555-123-4567')).toBeTruthy();
      });

      // Confirm the call
      const confirmButton = getByText('Call');
      fireEvent.press(confirmButton);

      // Phone service should be called
      await waitFor(() => {
        expect(PhoneService.makePhoneCall).toHaveBeenCalledWith('555-123-4567');
      });
    });

    it('should cancel call when user declines confirmation', async () => {
      const { getByTestId, getByText } = renderWithProviders(<EmergencyContactsScreen />);

      // Find and tap the dial button
      const dialButton = getByTestId('quick-dial-button-2');
      fireEvent.press(dialButton);

      // Wait for modal and cancel
      await waitFor(() => {
        const cancelButton = getByText('Cancel');
        fireEvent.press(cancelButton);
      });

      // Phone service should not be called
      expect(PhoneService.makePhoneCall).not.toHaveBeenCalled();
    });
  });

  describe('Emergency Mode Call Flow', () => {
    it('should enable emergency mode and make direct calls', async () => {
      (PhoneService.makePhoneCall as jest.Mock).mockResolvedValue({ success: true });

      const { getByTestId, queryByText } = renderWithProviders(<EmergencyContactsScreen />);

      // Toggle emergency mode
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      // Verify emergency mode is active
      await waitFor(() => {
        const state = store.getState();
        expect(state.emergencyContacts.isEmergencyMode).toBe(true);
      });

      // Press dial button - should call directly without confirmation
      const dialButton = getByTestId('quick-dial-button-1');
      fireEvent.press(dialButton);

      // No confirmation modal should appear
      expect(queryByText(/call emergency contact/i)).toBeNull();

      // Direct call should be made
      await waitFor(() => {
        expect(PhoneService.makePhoneCall).toHaveBeenCalledWith('555-123-4567');
      });
    });

    it('should show enlarged UI elements in emergency mode', async () => {
      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      // Enable emergency mode
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      // Check if contact list items have emergency mode styling
      await waitFor(() => {
        const contactItem = getByTestId('contact-list-item-1');
        const styles = contactItem.props.style;
        // Emergency mode should have larger touch targets
        expect(styles).toEqual(
          expect.objectContaining({
            minHeight: 64, // Emergency mode height
          }),
        );
      });
    });
  });

  describe('Location Sharing in Emergency Mode', () => {
    it('should enable location sharing when toggled', async () => {
      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      // Enable emergency mode first
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      // Wait for location toggle to appear
      await waitFor(() => {
        const locationToggle = getByTestId('location-share-toggle');
        expect(locationToggle).toBeTruthy();
      });

      // Enable location sharing
      const locationToggle = getByTestId('location-share-toggle');
      fireEvent(locationToggle, 'onValueChange', true);

      // Verify location permission is requested
      await waitFor(() => {
        expect(LocationService.requestLocationPermission).toHaveBeenCalled();
      });

      // Verify location tracking starts
      await waitFor(() => {
        expect(LocationService.startLocationWatch).toHaveBeenCalled();
      });
    });

    it('should stop location sharing when emergency mode exits', async () => {
      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      // Enable emergency mode and location sharing
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      await waitFor(() => {
        const locationToggle = getByTestId('location-share-toggle');
        fireEvent(locationToggle, 'onValueChange', true);
      });

      // Disable emergency mode
      fireEvent(emergencyToggle, 'onValueChange', false);

      // Verify location tracking stops
      await waitFor(() => {
        expect(LocationService.stopLocationWatch).toHaveBeenCalled();
        expect(LocationService.clearLocationData).toHaveBeenCalled();
      });
    });

    it('should handle location permission denial', async () => {
      (LocationService.requestLocationPermission as jest.Mock).mockResolvedValue(false);

      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      // Enable emergency mode
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      // Try to enable location sharing
      await waitFor(() => {
        const locationToggle = getByTestId('location-share-toggle');
        fireEvent(locationToggle, 'onValueChange', true);
      });

      // Verify permission denied alert is shown
      await waitFor(() => {
        expect(LocationService.showPermissionDeniedAlert).toHaveBeenCalled();
      });

      // Location should not be tracked
      expect(LocationService.startLocationWatch).not.toHaveBeenCalled();
    });
  });

  describe('Primary Contact Quick Access', () => {
    it('should display primary contact prominently', async () => {
      const { getByTestId, getByText } = renderWithProviders(<EmergencyContactsScreen />);

      // Primary contact card should be visible
      const primaryCard = getByTestId('primary-contact-card');
      expect(primaryCard).toBeTruthy();

      // Should show primary badge
      expect(getByText('PRIMARY')).toBeTruthy();

      // Should show contact details
      expect(getByText('Emergency Contact 1')).toBeTruthy();
      expect(getByText('Parent')).toBeTruthy();
    });

    it('should allow quick dial from primary contact card', async () => {
      (PhoneService.makePhoneCall as jest.Mock).mockResolvedValue({ success: true });

      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      // Enable emergency mode for direct dial
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      // Dial from primary contact card
      const primaryDialButton = getByTestId('primary-contact-dial-button');
      fireEvent.press(primaryDialButton);

      // Should make direct call
      await waitFor(() => {
        expect(PhoneService.makePhoneCall).toHaveBeenCalledWith('555-123-4567');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle phone call failures gracefully', async () => {
      (PhoneService.makePhoneCall as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to initiate call',
      });

      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      // Enable emergency mode
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      // Try to make a call
      const dialButton = getByTestId('quick-dial-button-1');
      fireEvent.press(dialButton);

      // Error alert should be shown
      await waitFor(() => {
        expect(PhoneService.showCallErrorAlert).toHaveBeenCalledWith('Failed to initiate call');
      });
    });

    it('should handle missing phone numbers', async () => {
      // Add contact without phone number
      store.dispatch(
        emergencyContactsSlice.actions.addContact({
          id: '3',
          name: 'No Phone Contact',
          phoneNumber: '',
          relationship: 'Friend',
          isPrimary: false,
        }),
      );

      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      // Dial button should be disabled for contact without phone
      const dialButton = getByTestId('quick-dial-button-3');
      expect(dialButton.props.disabled).toBe(true);
    });
  });

  describe('Performance and State Persistence', () => {
    it('should maintain emergency mode state during navigation', async () => {
      const { getByTestId, rerender } = renderWithProviders(<EmergencyContactsScreen />);

      // Enable emergency mode
      const emergencyToggle = getByTestId('emergency-mode-toggle');
      fireEvent(emergencyToggle, 'onValueChange', true);

      // Verify state is set
      await waitFor(() => {
        expect(store.getState().emergencyContacts.isEmergencyMode).toBe(true);
      });

      // Simulate navigation away and back
      rerender(
        <Provider store={store}>
          <NavigationContainer>
            <EmergencyContactsScreen />
          </NavigationContainer>
        </Provider>,
      );

      // Emergency mode should still be active
      expect(store.getState().emergencyContacts.isEmergencyMode).toBe(true);
    });

    it('should handle rapid toggle changes', async () => {
      const { getByTestId } = renderWithProviders(<EmergencyContactsScreen />);

      const emergencyToggle = getByTestId('emergency-mode-toggle');

      // Rapidly toggle emergency mode
      fireEvent(emergencyToggle, 'onValueChange', true);
      fireEvent(emergencyToggle, 'onValueChange', false);
      fireEvent(emergencyToggle, 'onValueChange', true);
      fireEvent(emergencyToggle, 'onValueChange', false);

      // Final state should be off
      await waitFor(() => {
        expect(store.getState().emergencyContacts.isEmergencyMode).toBe(false);
      });

      // Location should be cleaned up
      expect(LocationService.clearLocationData).toHaveBeenCalled();
    });
  });
});
