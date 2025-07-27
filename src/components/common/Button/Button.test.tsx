import React from 'react';
import { render, fireEvent } from '@utils/test/test-utils';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Press Me" onPress={() => {}} />);

    expect(getByText('Press Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Press Me" onPress={onPressMock} testID="test-button" />,
    );

    fireEvent.press(getByTestId('test-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <Button title="Press Me" onPress={onPressMock} disabled={true} testID="test-button" />,
    );

    fireEvent.press(getByTestId('test-button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading', () => {
    const { queryByText, UNSAFE_getByType } = render(
      <Button title="Press Me" onPress={() => {}} loading={true} />,
    );

    expect(queryByText('Press Me')).toBeNull();
    expect(UNSAFE_getByType('ActivityIndicator')).toBeTruthy();
  });

  it('applies variant styles correctly', () => {
    const { getByTestId, rerender } = render(
      <Button title="Danger" onPress={() => {}} variant="danger" testID="test-button" />,
    );

    const button = getByTestId('test-button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#FF3B30' }),
    );

    rerender(
      <Button title="Secondary" onPress={() => {}} variant="secondary" testID="test-button" />,
    );

    expect(button.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#F2F2F7' }),
    );
  });

  it('applies size styles correctly', () => {
    const { getByTestId } = render(
      <Button title="Large Button" onPress={() => {}} size="large" testID="test-button" />,
    );

    const button = getByTestId('test-button');
    expect(button.props.style).toContainEqual(expect.objectContaining({ paddingVertical: 16 }));
  });
});
