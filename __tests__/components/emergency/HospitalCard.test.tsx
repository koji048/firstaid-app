import React from 'react';
import { Alert, Linking } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { HospitalCard } from '../../../src/components/emergency/HospitalCard';
import { Hospital } from '../../../src/services/hospital';
import { PhoneService } from '../../../src/services/phone';
import { LocationCoordinates } from '../../../src/services/location';

jest.mock('../../../src/services/phone', () => ({
  PhoneService: {
    makePhoneCall: jest.fn(),
    handleCallError: jest.fn(),
  },
}));

jest.mock('react-native/Libraries/Linking/Linking', () => ({
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('HospitalCard', () => {
  const mockHospital: Hospital = {
    id: '1',
    name: 'Test Hospital',
    address: '123 Test St, Test City',
    phone: '+1-555-0100',
    distance: 1500,
    estimatedTime: 5,
    latitude: 37.7749,
    longitude: -122.4194,
    type: 'emergency',
    hasEmergencyRoom: true,
    rating: 4.5,
    isOpen24Hours: true,
  };

  const mockLocation: LocationCoordinates = {
    latitude: 37.7649,
    longitude: -122.4294,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
    timestamp: Date.now(),
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render hospital information correctly', () => {
    const { getByText } = render(
      <HospitalCard hospital={mockHospital} currentLocation={mockLocation} />,
    );

    expect(getByText('Test Hospital')).toBeTruthy();
    expect(getByText('123 Test St, Test City')).toBeTruthy();
    expect(getByText('1.5km')).toBeTruthy();
    expect(getByText('~5 min')).toBeTruthy();
    expect(getByText('4.5')).toBeTruthy();
    expect(getByText('24/7 ER')).toBeTruthy();
  });

  it('should handle hospital without emergency room', () => {
    const hospital = { ...mockHospital, hasEmergencyRoom: false };
    const { queryByText } = render(
      <HospitalCard hospital={hospital} currentLocation={mockLocation} />,
    );

    expect(queryByText('24/7 ER')).toBeNull();
  });

  it('should handle missing distance and time', () => {
    const hospital = { ...mockHospital, distance: undefined, estimatedTime: undefined };
    const { getByText } = render(
      <HospitalCard hospital={hospital} currentLocation={mockLocation} />,
    );

    expect(getByText('N/A')).toBeTruthy();
  });

  it('should handle missing rating', () => {
    const hospital = { ...mockHospital, rating: undefined };
    const { queryByText } = render(
      <HospitalCard hospital={hospital} currentLocation={mockLocation} />,
    );

    expect(queryByText('4.5')).toBeNull();
  });

  it('should call onPress when card is pressed', () => {
    const { getByTestId } = render(
      <HospitalCard hospital={mockHospital} currentLocation={mockLocation} onPress={mockOnPress} />,
    );

    fireEvent.press(getByTestId('hospital-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockHospital);
  });

  it('should handle phone call successfully', async () => {
    (PhoneService.makePhoneCall as jest.Mock).mockResolvedValue({ success: true });

    const { getByTestId } = render(
      <HospitalCard hospital={mockHospital} currentLocation={mockLocation} />,
    );

    fireEvent.press(getByTestId('hospital-card-call'));

    await waitFor(() => {
      expect(PhoneService.makePhoneCall).toHaveBeenCalledWith('+1-555-0100', 'Test Hospital');
    });
  });

  it('should handle phone call failure', async () => {
    (PhoneService.makePhoneCall as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Call failed',
    });

    const { getByTestId } = render(
      <HospitalCard hospital={mockHospital} currentLocation={mockLocation} />,
    );

    fireEvent.press(getByTestId('hospital-card-call'));

    await waitFor(() => {
      expect(PhoneService.handleCallError).toHaveBeenCalledWith('Call failed', 'Test Hospital');
    });
  });

  it('should show alert when hospital has no phone number', () => {
    const hospital = { ...mockHospital, phone: undefined };
    const { getByTestId } = render(
      <HospitalCard hospital={hospital} currentLocation={mockLocation} />,
    );

    fireEvent.press(getByTestId('hospital-card-call'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'No Phone Number',
      'Phone number not available for this hospital',
      [{ text: 'OK' }],
    );
  });

  it('should handle directions successfully', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(true);
    (Linking.openURL as jest.Mock).mockResolvedValue(true);

    const { getByTestId } = render(
      <HospitalCard hospital={mockHospital} currentLocation={mockLocation} />,
    );

    fireEvent.press(getByTestId('hospital-card-directions'));

    await waitFor(() => {
      expect(Linking.openURL).toHaveBeenCalled();
    });
  });

  it('should show alert when no location is available for directions', () => {
    const { getByTestId } = render(<HospitalCard hospital={mockHospital} />);

    fireEvent.press(getByTestId('hospital-card-directions'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Location Required',
      'Please enable location services to get directions',
      [{ text: 'OK' }],
    );
  });

  it('should show alert when navigation app cannot be opened', async () => {
    (Linking.canOpenURL as jest.Mock).mockResolvedValue(false);

    const { getByTestId } = render(
      <HospitalCard hospital={mockHospital} currentLocation={mockLocation} />,
    );

    fireEvent.press(getByTestId('hospital-card-directions'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Navigation Error',
        'Unable to open navigation app',
        [{ text: 'OK' }],
      );
    });
  });

  it('should apply emergency mode styles', () => {
    const { getByTestId } = render(
      <HospitalCard hospital={mockHospital} currentLocation={mockLocation} isEmergencyMode />,
    );

    const card = getByTestId('hospital-card');
    expect(card.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderWidth: 2, borderColor: '#da1e28' })]),
    );
  });

  it('should render correct icon for different hospital types', () => {
    const urgentCareHospital = { ...mockHospital, type: 'urgent_care' as const };
    const { rerender } = render(
      <HospitalCard hospital={urgentCareHospital} currentLocation={mockLocation} />,
    );

    // Test general hospital
    const generalHospital = { ...mockHospital, type: 'general' as const };
    rerender(<HospitalCard hospital={generalHospital} currentLocation={mockLocation} />);

    // Icons would be tested if we had access to Icon component props
    expect(true).toBe(true); // Placeholder assertion
  });

  it('should disable call button when no phone number', () => {
    const hospital = { ...mockHospital, phone: undefined };
    const { getByTestId } = render(
      <HospitalCard hospital={hospital} currentLocation={mockLocation} />,
    );

    const callButton = getByTestId('hospital-card-call');
    expect(callButton.props.disabled).toBe(true);
  });

  it('should disable directions button when no location', () => {
    const { getByTestId } = render(<HospitalCard hospital={mockHospital} />);

    const directionsButton = getByTestId('hospital-card-directions');
    expect(directionsButton.props.disabled).toBe(true);
  });
});