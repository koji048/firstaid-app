import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { EmptyContactsState } from '../../../src/components/emergency/EmptyContactsState';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('EmptyContactsState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state with proper messaging', () => {
    const { getByText } = render(
      <NavigationContainer>
        <EmptyContactsState />
      </NavigationContainer>,
    );

    expect(getByText('No Emergency Contacts')).toBeTruthy();
    expect(getByText(/Add emergency contacts to quickly reach them/)).toBeTruthy();
    expect(getByText('Add Your First Contact')).toBeTruthy();
  });

  it('displays contact icon', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <EmptyContactsState />
      </NavigationContainer>,
    );

    expect(getByTestId('empty-state-icon')).toBeTruthy();
  });

  it('navigates to AddEmergencyContact screen when button pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <EmptyContactsState />
      </NavigationContainer>,
    );

    const addButton = getByText('Add Your First Contact');
    fireEvent.press(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('Home', {
      screen: 'AddEmergencyContact',
      params: {},
    });
  });
});
