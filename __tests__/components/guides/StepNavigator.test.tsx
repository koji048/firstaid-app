import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { PanResponder } from 'react-native';
import Haptics from 'react-native-haptic-feedback';
import { StepNavigator } from '../../../src/components/guides/StepNavigator';

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

describe('StepNavigator', () => {
  const mockOnStepChange = jest.fn();
  const mockOnToggleViewAll = jest.fn();

  const defaultProps = {
    currentStep: 2,
    totalSteps: 5,
    onStepChange: mockOnStepChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step information correctly', () => {
    const { getByText } = render(<StepNavigator {...defaultProps} />);

    expect(getByText('Step 2 of 5')).toBeTruthy();
    expect(getByText('Swipe to navigate')).toBeTruthy();
  });

  it('displays progress bar with correct fill', () => {
    const { getByTestId } = render(<StepNavigator {...defaultProps} testID="step-navigator" />);

    const navigator = getByTestId('step-navigator');
    const progressBar = navigator.findByProps({ testID: 'progress-bar' });
    const progressFill = progressBar.children[0];

    // Progress should be 40% (2/5)
    expect(progressFill.props.style).toMatchObject({
      width: expect.any(Object), // Animated value
    });
  });

  it('handles previous button press', () => {
    const { getByTestId } = render(<StepNavigator {...defaultProps} />);

    fireEvent.press(getByTestId('previous-button'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
    expect(mockOnStepChange).toHaveBeenCalledWith(1);
  });

  it('handles next button press', () => {
    const { getByTestId } = render(<StepNavigator {...defaultProps} />);

    fireEvent.press(getByTestId('next-button'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
    expect(mockOnStepChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first step', () => {
    const { getByTestId } = render(<StepNavigator {...defaultProps} currentStep={1} />);

    const previousButton = getByTestId('previous-button');
    expect(previousButton.props.disabled).toBe(true);
    expect(previousButton.props.accessibilityState).toEqual({ disabled: true });

    fireEvent.press(previousButton);
    expect(mockOnStepChange).not.toHaveBeenCalled();
  });

  it('disables and shows "Done" on last step', () => {
    const { getByTestId, getByText } = render(<StepNavigator {...defaultProps} currentStep={5} />);

    const nextButton = getByTestId('next-button');
    expect(nextButton.props.disabled).toBe(true);
    expect(nextButton.props.accessibilityLabel).toBe('Last step');
    expect(getByText('Done')).toBeTruthy();

    fireEvent.press(nextButton);
    expect(mockOnStepChange).not.toHaveBeenCalled();
  });

  it('handles view all toggle', () => {
    const { getByTestId } = render(
      <StepNavigator {...defaultProps} onToggleViewAll={mockOnToggleViewAll} />,
    );

    fireEvent.press(getByTestId('view-all-button'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
    expect(mockOnToggleViewAll).toHaveBeenCalledTimes(1);
  });

  it('shows correct view all button text based on state', () => {
    const { getByText, rerender } = render(
      <StepNavigator
        {...defaultProps}
        showAllSteps={false}
        onToggleViewAll={mockOnToggleViewAll}
      />,
    );

    expect(getByText('View All Steps')).toBeTruthy();

    rerender(
      <StepNavigator {...defaultProps} showAllSteps={true} onToggleViewAll={mockOnToggleViewAll} />,
    );

    expect(getByText('Hide All')).toBeTruthy();
  });

  it('applies high contrast styling', () => {
    const { getByTestId, getByText } = render(
      <StepNavigator {...defaultProps} isHighContrast={true} testID="step-navigator" />,
    );

    const container = getByTestId('step-navigator');
    expect(container.props.style).toMatchObject({
      backgroundColor: '#000000',
    });

    const stepText = getByText('Step 2 of 5');
    expect(stepText.props.style).toMatchObject({
      color: '#FFFFFF',
      fontWeight: '600',
    });
  });

  it('has proper accessibility attributes', () => {
    const { getByText, getByTestId } = render(
      <StepNavigator {...defaultProps} onToggleViewAll={mockOnToggleViewAll} />,
    );

    const stepText = getByText('Step 2 of 5');
    expect(stepText.props.accessible).toBe(true);
    expect(stepText.props.accessibilityLabel).toBe('Step 2 of 5');

    const previousButton = getByTestId('previous-button');
    expect(previousButton.props.accessible).toBe(true);
    expect(previousButton.props.accessibilityLabel).toBe('Previous step');
    expect(previousButton.props.accessibilityRole).toBe('button');

    const nextButton = getByTestId('next-button');
    expect(nextButton.props.accessible).toBe(true);
    expect(nextButton.props.accessibilityLabel).toBe('Next step');
    expect(nextButton.props.accessibilityRole).toBe('button');

    const viewAllButton = getByTestId('view-all-button');
    expect(viewAllButton.props.accessible).toBe(true);
    expect(viewAllButton.props.accessibilityLabel).toBe('View all steps');
    expect(viewAllButton.props.accessibilityRole).toBe('button');
  });

  it('responds to swipe gestures', () => {
    const { getByTestId } = render(<StepNavigator {...defaultProps} testID="step-navigator" />);

    const navigator = getByTestId('step-navigator');

    // Simulate swipe right (previous)
    const panHandlers = navigator.props;
    panHandlers.onStartShouldSetResponder();
    panHandlers.onMoveShouldSetResponder({}, { dx: 60 });
    panHandlers.onResponderMove({}, { dx: 60 });
    panHandlers.onResponderRelease({}, { dx: 60 });

    expect(mockOnStepChange).toHaveBeenCalledWith(1);

    // Reset mock
    mockOnStepChange.mockClear();

    // Simulate swipe left (next)
    panHandlers.onResponderMove({}, { dx: -60 });
    panHandlers.onResponderRelease({}, { dx: -60 });

    expect(mockOnStepChange).toHaveBeenCalledWith(3);
  });

  it('ignores small swipes below threshold', () => {
    const { getByTestId } = render(<StepNavigator {...defaultProps} testID="step-navigator" />);

    const navigator = getByTestId('step-navigator');
    const panHandlers = navigator.props;

    // Small swipe right
    panHandlers.onResponderRelease({}, { dx: 30 });
    expect(mockOnStepChange).not.toHaveBeenCalled();

    // Small swipe left
    panHandlers.onResponderRelease({}, { dx: -30 });
    expect(mockOnStepChange).not.toHaveBeenCalled();
  });

  it('does not navigate beyond boundaries with swipes', () => {
    const { getByTestId, rerender } = render(
      <StepNavigator {...defaultProps} currentStep={1} testID="step-navigator" />,
    );

    let navigator = getByTestId('step-navigator');
    let panHandlers = navigator.props;

    // Try to swipe right on first step
    panHandlers.onResponderRelease({}, { dx: 60 });
    expect(mockOnStepChange).not.toHaveBeenCalled();

    // Test last step
    rerender(<StepNavigator {...defaultProps} currentStep={5} testID="step-navigator" />);

    navigator = getByTestId('step-navigator');
    panHandlers = navigator.props;

    // Try to swipe left on last step
    panHandlers.onResponderRelease({}, { dx: -60 });
    expect(mockOnStepChange).not.toHaveBeenCalled();
  });
});
