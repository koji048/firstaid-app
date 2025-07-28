import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Haptics from 'react-native-haptic-feedback';
import { TextSizeControl } from '../../../src/components/guides/TextSizeControl';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

describe('TextSizeControl', () => {
  const mockOnSizeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all size options', () => {
    const { getByText, getByTestId } = render(
      <TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />,
    );

    expect(getByText('Text Size:')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
    expect(getByText('A+')).toBeTruthy();
    expect(getByText('A++')).toBeTruthy();
    expect(getByTestId('size-button-normal')).toBeTruthy();
    expect(getByTestId('size-button-large')).toBeTruthy();
    expect(getByTestId('size-button-extra-large')).toBeTruthy();
  });

  it('highlights current size option', () => {
    const { getByTestId } = render(
      <TextSizeControl currentSize="large" onSizeChange={mockOnSizeChange} />,
    );

    const normalButton = getByTestId('size-button-normal');
    const largeButton = getByTestId('size-button-large');
    const extraLargeButton = getByTestId('size-button-extra-large');

    expect(normalButton.props.accessibilityState).toEqual({ selected: false });
    expect(largeButton.props.accessibilityState).toEqual({ selected: true });
    expect(extraLargeButton.props.accessibilityState).toEqual({ selected: false });
  });

  it('handles size change with haptic feedback', async () => {
    const { getByTestId } = render(
      <TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />,
    );

    fireEvent.press(getByTestId('size-button-large'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
    expect(mockOnSizeChange).toHaveBeenCalledWith('large');

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@text_size_preference', 'large');
    });
  });

  it('loads saved preference on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('extra-large');

    render(<TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@text_size_preference');
      expect(mockOnSizeChange).toHaveBeenCalledWith('extra-large');
    });
  });

  it('ignores invalid saved preferences', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid-size');

    render(<TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
      expect(mockOnSizeChange).not.toHaveBeenCalled();
    });
  });

  it('handles AsyncStorage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading text size preference:',
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it('applies different font sizes to buttons', () => {
    const { getByText } = render(
      <TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />,
    );

    const normalButton = getByText('A');
    const largeButton = getByText('A+');
    const extraLargeButton = getByText('A++');

    expect(normalButton.props.style.fontSize).toBe(14);
    expect(largeButton.props.style.fontSize).toBe(14 * 1.2);
    expect(extraLargeButton.props.style.fontSize).toBe(14 * 1.4);
  });

  it('applies high contrast styling', () => {
    const { getByTestId, getByText } = render(
      <TextSizeControl
        currentSize="normal"
        isHighContrast={true}
        onSizeChange={mockOnSizeChange}
        testID="text-size-control"
      />,
    );

    const container = getByTestId('text-size-control');
    expect(container.props.style).toMatchObject({
      backgroundColor: '#333333',
    });

    const label = getByText('Text Size:');
    expect(label.props.style).toMatchObject({
      color: '#CCCCCC',
    });
  });

  it('shows current size in indicator', () => {
    const { getByText, rerender } = render(
      <TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />,
    );

    expect(getByText('normal')).toBeTruthy();

    rerender(<TextSizeControl currentSize="extra-large" onSizeChange={mockOnSizeChange} />);

    expect(getByText('extra large')).toBeTruthy();
  });

  it('has proper accessibility attributes', () => {
    const { getByText, getByTestId } = render(
      <TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />,
    );

    const label = getByText('Text Size:');
    expect(label.props.accessible).toBe(true);
    expect(label.props.accessibilityLabel).toBe('Text size control');

    const normalButton = getByTestId('size-button-normal');
    expect(normalButton.props.accessible).toBe(true);
    expect(normalButton.props.accessibilityLabel).toBe('Text size normal');
    expect(normalButton.props.accessibilityRole).toBe('button');
  });

  it('persists size change to storage', async () => {
    const { getByTestId } = render(
      <TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />,
    );

    fireEvent.press(getByTestId('size-button-extra-large'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@text_size_preference', 'extra-large');
    });
  });

  it('handles storage save errors gracefully', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Save error'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByTestId } = render(
      <TextSizeControl currentSize="normal" onSizeChange={mockOnSizeChange} />,
    );

    fireEvent.press(getByTestId('size-button-large'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving text size preference:',
        expect.any(Error),
      );
    });

    // Should still call onSizeChange even if storage fails
    expect(mockOnSizeChange).toHaveBeenCalledWith('large');

    consoleSpy.mockRestore();
  });
});
