import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContactForm } from '../../../src/components/emergency/ContactForm';
import { ContactCategory, ContactRelationship } from '../../../src/types/emergencyContact';

describe('ContactForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    const { getByPlaceholderText, getByText } = render(
      <ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    expect(getByPlaceholderText('Enter contact name')).toBeTruthy();
    expect(getByPlaceholderText('Enter phone number')).toBeTruthy();
    expect(getByText('Relationship')).toBeTruthy();
    expect(getByText('Category')).toBeTruthy();
    expect(getByText('Primary Contact')).toBeTruthy();
    expect(getByPlaceholderText('Add any additional notes')).toBeTruthy();
  });

  it('shows validation errors for required fields', async () => {
    const { getByText } = render(<ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const submitButton = getByText('Add Contact');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Name is required')).toBeTruthy();
      expect(getByText('Phone number is required')).toBeTruthy();
    });
  });

  it('validates phone number format', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const phoneInput = getByPlaceholderText('Enter phone number');
    fireEvent.changeText(phoneInput, '123');

    const submitButton = getByText('Add Contact');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Invalid phone number')).toBeTruthy();
    });
  });

  it('formats phone number as user types', () => {
    const { getByPlaceholderText } = render(
      <ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const phoneInput = getByPlaceholderText('Enter phone number');
    fireEvent.changeText(phoneInput, '1234567890');

    expect(phoneInput.props.value).toBe('(123) 456-7890');
  });

  it('submits form with valid data', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const nameInput = getByPlaceholderText('Enter contact name');
    const phoneInput = getByPlaceholderText('Enter phone number');
    const notesInput = getByPlaceholderText('Add any additional notes');

    fireEvent.changeText(nameInput, 'John Doe');
    fireEvent.changeText(phoneInput, '1234567890');
    fireEvent.changeText(notesInput, 'Emergency contact');

    const submitButton = getByText('Add Contact');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        phone: '(123) 456-7890',
        relationship: ContactRelationship.OTHER,
        category: ContactCategory.OTHER,
        isPrimary: false,
        notes: 'Emergency contact',
      });
    });
  });

  it('pre-fills form when initialValues provided', () => {
    const initialValues = {
      name: 'Jane Doe',
      phone: '+1234567890',
      relationship: ContactRelationship.PARENT,
      category: ContactCategory.FAMILY,
      isPrimary: true,
      notes: 'Mom',
    };

    const { getByPlaceholderText, getByText } = render(
      <ContactForm initialValues={initialValues} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />,
    );

    const nameInput = getByPlaceholderText('Enter contact name');
    const phoneInput = getByPlaceholderText('Enter phone number');
    const notesInput = getByPlaceholderText('Add any additional notes');

    expect(nameInput.props.value).toBe('Jane Doe');
    expect(phoneInput.props.value).toBe('+1234567890');
    expect(notesInput.props.value).toBe('Mom');
    expect(getByText('Update Contact')).toBeTruthy();
  });

  it('calls onCancel when cancel button pressed', () => {
    const { getByText } = render(<ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    const { getByText } = render(
      <ContactForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />,
    );

    const submitButton = getByText('Add Contact');
    const cancelButton = getByText('Cancel');

    expect(submitButton.props.disabled).toBe(true);
    expect(cancelButton.props.disabled).toBe(true);
  });
});
