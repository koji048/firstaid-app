import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { ContactSearchBar } from '../../../src/components/emergency/ContactSearchBar';

describe('ContactSearchBar', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly with placeholder', () => {
    const { getByPlaceholderText } = render(
      <ContactSearchBar value="" onChangeText={mockOnChangeText} />,
    );

    expect(getByPlaceholderText('Search contacts...')).toBeTruthy();
  });

  it('displays custom placeholder when provided', () => {
    const { getByPlaceholderText } = render(
      <ContactSearchBar value="" onChangeText={mockOnChangeText} placeholder="Find a contact" />,
    );

    expect(getByPlaceholderText('Find a contact')).toBeTruthy();
  });

  it('debounces search input', async () => {
    const { getByPlaceholderText } = render(
      <ContactSearchBar value="" onChangeText={mockOnChangeText} />,
    );

    const input = getByPlaceholderText('Search contacts...');

    fireEvent.changeText(input, 'John');
    expect(mockOnChangeText).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(mockOnChangeText).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(mockOnChangeText).toHaveBeenCalledWith('John');
  });

  it('shows clear button when text is entered', () => {
    const { queryByTestId } = render(
      <ContactSearchBar value="John" onChangeText={mockOnChangeText} />,
    );

    expect(queryByTestId('clear-button')).toBeTruthy();
  });

  it('clears search when clear button is pressed', () => {
    const { getByTestId } = render(
      <ContactSearchBar value="John" onChangeText={mockOnChangeText} />,
    );

    const clearButton = getByTestId('clear-button');
    fireEvent.press(clearButton);

    expect(mockOnChangeText).toHaveBeenCalledWith('');
  });

  it('updates local value when prop value changes', () => {
    const { getByPlaceholderText, rerender } = render(
      <ContactSearchBar value="John" onChangeText={mockOnChangeText} />,
    );

    const input = getByPlaceholderText('Search contacts...');
    expect(input.props.value).toBe('John');

    rerender(<ContactSearchBar value="Jane" onChangeText={mockOnChangeText} />);

    expect(input.props.value).toBe('Jane');
  });
});
