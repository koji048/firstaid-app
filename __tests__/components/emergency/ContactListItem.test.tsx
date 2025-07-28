import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ContactListItem } from '../../../src/components/emergency/ContactListItem';
import {
  ContactCategory,
  ContactRelationship,
  EmergencyContact,
} from '../../../src/types/emergencyContact';

const mockContact: EmergencyContact = {
  id: '1',
  name: 'John Doe',
  phone: '+1234567890',
  relationship: ContactRelationship.PARENT,
  category: ContactCategory.FAMILY,
  isPrimary: true,
  notes: 'Dad',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ContactListItem', () => {
  const mockOnPress = jest.fn();
  const mockOnEditPress = jest.fn();
  const mockOnDeletePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact information correctly', () => {
    const { getByText } = render(
      <ContactListItem
        contact={mockContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('+1234567890')).toBeTruthy();
    expect(getByText('Parent')).toBeTruthy();
  });

  it('shows primary contact indicator when isPrimary is true', () => {
    const { getByTestId } = render(
      <ContactListItem
        contact={mockContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    expect(getByTestId('primary-icon')).toBeTruthy();
  });

  it('does not show primary indicator when isPrimary is false', () => {
    const nonPrimaryContact = { ...mockContact, isPrimary: false };
    const { queryByTestId } = render(
      <ContactListItem
        contact={nonPrimaryContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    expect(queryByTestId('primary-icon')).toBeNull();
  });

  it('shows correct category color indicator', () => {
    const { getByTestId } = render(
      <ContactListItem
        contact={mockContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    const indicator = getByTestId('category-indicator');
    expect(indicator.props.style).toMatchObject({
      backgroundColor: '#0f62fe', // FAMILY color
    });
  });

  it('calls onPress when contact is tapped', () => {
    const { getByTestId } = render(
      <ContactListItem
        contact={mockContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    const container = getByTestId('contact-list-item');
    fireEvent.press(container);

    expect(mockOnPress).toHaveBeenCalled();
  });

  it('calls onEditPress when edit button is tapped', () => {
    const { getByTestId } = render(
      <ContactListItem
        contact={mockContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    const editButton = getByTestId('edit-button');
    fireEvent.press(editButton);

    expect(mockOnEditPress).toHaveBeenCalled();
  });

  it('calls onDeletePress when delete button is tapped', () => {
    const { getByTestId } = render(
      <ContactListItem
        contact={mockContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    const deleteButton = getByTestId('delete-button');
    fireEvent.press(deleteButton);

    expect(mockOnDeletePress).toHaveBeenCalled();
  });

  it('displays different relationship labels correctly', () => {
    const doctorContact = {
      ...mockContact,
      relationship: ContactRelationship.DOCTOR,
      category: ContactCategory.MEDICAL,
    };

    const { getByText } = render(
      <ContactListItem
        contact={doctorContact}
        onPress={mockOnPress}
        onEditPress={mockOnEditPress}
        onDeletePress={mockOnDeletePress}
      />,
    );

    expect(getByText('Doctor')).toBeTruthy();
  });
});
