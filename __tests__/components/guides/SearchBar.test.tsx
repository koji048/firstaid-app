import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import Voice from '@react-native-voice/voice';
import Haptics from 'react-native-haptic-feedback';
import { SearchBar } from '../../../src/components/guides/SearchBar';

jest.mock('@react-native-voice/voice', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn().mockResolvedValue(undefined),
  removeAllListeners: jest.fn(),
  onSpeechStart: jest.fn(),
  onSpeechEnd: jest.fn(),
  onSpeechError: jest.fn(),
  onSpeechResults: jest.fn(),
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe('SearchBar', () => {
  const mockOnChangeText = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnSuggestionPress = jest.fn();

  const defaultProps = {
    value: '',
    onChangeText: mockOnChangeText,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with placeholder', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);

    const input = getByTestId('search-bar');
    expect(input.props.placeholder).toBe('Search: choking, bleeding, burns...');
  });

  it('handles text input and shows clear button', () => {
    const { getByTestId, queryByTestId, rerender } = render(<SearchBar {...defaultProps} />);

    expect(queryByTestId('clear-button')).toBeNull();

    rerender(<SearchBar {...defaultProps} value="choking" />);

    const input = getByTestId('search-bar');
    fireEvent.changeText(input, 'choking');

    expect(mockOnChangeText).toHaveBeenCalledWith('choking');
    expect(getByTestId('clear-button')).toBeTruthy();
  });

  it('corrects common misspellings', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);

    const input = getByTestId('search-bar');
    fireEvent.changeText(input, 'hart attack');

    expect(mockOnChangeText).toHaveBeenCalledWith('heart attack');
  });

  it('handles voice input button press', async () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);

    const voiceButton = getByTestId('voice-button');
    fireEvent.press(voiceButton);

    expect(Voice.start).toHaveBeenCalledWith('en-US');
    expect(Haptics.trigger).toHaveBeenCalledWith('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  });

  it('shows voice error when voice recognition fails', async () => {
    const { getByTestId, queryByTestId } = render(<SearchBar {...defaultProps} />);

    (Voice.start as jest.Mock).mockRejectedValueOnce(new Error('Voice error'));

    const voiceButton = getByTestId('voice-button');
    fireEvent.press(voiceButton);

    await waitFor(() => {
      expect(queryByTestId('voice-error')).toBeTruthy();
    });
  });

  it('handles clear button press', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} value="test search" />);

    const clearButton = getByTestId('clear-button');
    fireEvent.press(clearButton);

    expect(mockOnChangeText).toHaveBeenCalledWith('');
    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
  });

  it('shows suggestions when provided', () => {
    const suggestions = ['CPR', 'Choking', 'Burns'];
    const { getByText, getByTestId } = render(
      <SearchBar {...defaultProps} value="c" suggestions={suggestions} />,
    );

    const input = getByTestId('search-bar');
    fireEvent(input, 'focus');

    suggestions.forEach((suggestion) => {
      expect(getByText(suggestion)).toBeTruthy();
    });
  });

  it('shows recent searches when no value entered', () => {
    const recentSearches = ['heart attack', 'broken bone'];
    const { getByText, getByTestId } = render(
      <SearchBar {...defaultProps} recentSearches={recentSearches} />,
    );

    const input = getByTestId('search-bar');
    fireEvent(input, 'focus');

    expect(getByText('Recent searches')).toBeTruthy();
  });

  it('handles suggestion press', () => {
    const suggestions = ['CPR'];
    const { getByTestId } = render(
      <SearchBar
        {...defaultProps}
        value="c"
        suggestions={suggestions}
        onSuggestionPress={mockOnSuggestionPress}
      />,
    );

    const input = getByTestId('search-bar');
    fireEvent(input, 'focus');

    const suggestionItem = getByTestId('suggestion-CPR');
    fireEvent.press(suggestionItem);

    expect(mockOnChangeText).toHaveBeenCalledWith('CPR');
    expect(mockOnSuggestionPress).toHaveBeenCalledWith('CPR');
    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);

    const input = getByTestId('search-bar');
    expect(input.props.accessible).toBe(true);
    expect(input.props.accessibilityLabel).toBe('Search for first aid guides');
    expect(input.props.accessibilityHint).toBe('Type to search or use voice input');

    const voiceButton = getByTestId('voice-button');
    expect(voiceButton.props.accessible).toBe(true);
    expect(voiceButton.props.accessibilityLabel).toBe('Start voice input');
    expect(voiceButton.props.accessibilityRole).toBe('button');
  });

  it('meets minimum touch target size for voice and clear buttons', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} value="test" />);

    const voiceButton = getByTestId('voice-button');
    const voiceButtonStyle = voiceButton.props.style;
    const minSize =
      voiceButtonStyle.find((style: { minWidth?: number }) => style.minWidth)?.minWidth || 0;
    expect(minSize).toBeGreaterThanOrEqual(44);

    const clearButton = getByTestId('clear-button');
    expect(clearButton.props.hitSlop).toEqual({
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    });
  });

  it('shows symptom aliases when matching input', () => {
    const { getByText, getByTestId } = render(<SearchBar {...defaultProps} value="chest pain" />);

    const input = getByTestId('search-bar');
    fireEvent(input, 'focus');

    expect(getByText('Try: heart attack')).toBeTruthy();
    expect(getByText('Try: cardiac emergency')).toBeTruthy();
  });

  it('submits search on keyboard submit', () => {
    const { getByTestId } = render(<SearchBar {...defaultProps} />);

    const input = getByTestId('search-bar');
    fireEvent(input, 'submitEditing');

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });
});
