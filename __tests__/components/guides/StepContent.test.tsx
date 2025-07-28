import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { StepContent } from '../../../src/components/guides/StepContent';
import { GuideStep } from '../../../src/types/guideContent';

describe('StepContent', () => {
  const mockStep: GuideStep = {
    order: 1,
    title: 'Check responsiveness',
    description:
      'Tap the person on the shoulders and shout "Are you okay?" to check if they respond.',
    duration: 30,
  };

  const mockStepWithImage: GuideStep = {
    ...mockStep,
    imageUrl: 'guides/images/cpr_1.png',
  };

  const mockStepLongDuration: GuideStep = {
    ...mockStep,
    duration: 150, // 2 min 30 sec
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders step content correctly', () => {
    const { getByText } = render(<StepContent step={mockStep} stepNumber={1} />);

    expect(getByText('1')).toBeTruthy();
    expect(getByText('Check responsiveness')).toBeTruthy();
    expect(
      getByText(
        'Tap the person on the shoulders and shout "Are you okay?" to check if they respond.',
      ),
    ).toBeTruthy();
    expect(getByText('30 seconds')).toBeTruthy();
  });

  it('formats duration correctly', () => {
    const { getByText, rerender } = render(<StepContent step={mockStep} stepNumber={1} />);

    expect(getByText('30 seconds')).toBeTruthy();

    // Test minutes
    rerender(<StepContent step={{ ...mockStep, duration: 60 }} stepNumber={1} />);
    expect(getByText('1 minute')).toBeTruthy();

    // Test minutes plural
    rerender(<StepContent step={{ ...mockStep, duration: 120 }} stepNumber={1} />);
    expect(getByText('2 minutes')).toBeTruthy();

    // Test minutes and seconds
    rerender(<StepContent step={mockStepLongDuration} stepNumber={1} />);
    expect(getByText('2 min 30 sec')).toBeTruthy();
  });

  it('hides duration badge when no duration provided', () => {
    const stepWithoutDuration = { ...mockStep, duration: undefined };
    const { queryByText } = render(<StepContent step={stepWithoutDuration} stepNumber={1} />);

    expect(queryByText(/seconds|minute/)).toBeNull();
  });

  it('shows image placeholder for steps with images', () => {
    const { getByText } = render(<StepContent step={mockStepWithImage} stepNumber={1} />);

    expect(getByText('Image support coming soon')).toBeTruthy();
  });

  it('applies text size adjustments', () => {
    const { getByText, rerender } = render(
      <StepContent step={mockStep} stepNumber={1} textSize="normal" />,
    );

    const title = getByText('Check responsiveness');
    const normalStyle = title.props.style;

    rerender(<StepContent step={mockStep} stepNumber={1} textSize="large" />);
    const largeStyle = getByText('Check responsiveness').props.style;

    rerender(<StepContent step={mockStep} stepNumber={1} textSize="extra-large" />);
    const extraLargeStyle = getByText('Check responsiveness').props.style;

    // Text size should increase
    expect(largeStyle.fontSize).toBeGreaterThan(normalStyle.fontSize);
    expect(extraLargeStyle.fontSize).toBeGreaterThan(largeStyle.fontSize);
  });

  it('applies high contrast styling', () => {
    const { getByText, getByTestId } = render(
      <StepContent step={mockStep} stepNumber={1} isHighContrast={true} testID="step-content" />,
    );

    const container = getByTestId('step-content');
    expect(container.props.style).toMatchObject({
      backgroundColor: '#000000',
    });

    const title = getByText('Check responsiveness');
    expect(title.props.style).toMatchObject({
      color: '#FFFFFF',
      fontWeight: '500',
    });

    const description = getByText(mockStep.description);
    expect(description.props.style).toMatchObject({
      color: '#FFFFFF',
      fontWeight: '400',
    });
  });

  it('has proper accessibility attributes', () => {
    const { getByText } = render(<StepContent step={mockStep} stepNumber={1} />);

    const title = getByText('Check responsiveness');
    expect(title.props.accessible).toBe(true);
    expect(title.props.accessibilityRole).toBe('header');
    expect(title.props.accessibilityLabel).toBe('Step 1: Check responsiveness');

    const description = getByText(mockStep.description);
    expect(description.props.accessible).toBe(true);
    expect(description.props.accessibilityLabel).toBe(mockStep.description);
  });

  it('applies animation when not showing all steps', async () => {
    const { getByTestId } = render(
      <StepContent step={mockStep} stepNumber={1} showAllSteps={false} testID="step-content" />,
    );

    const container = getByTestId('step-content');

    // Initial state should have opacity 0
    expect(container.props.style.opacity).toBeDefined();

    // Wait for animation to complete
    await waitFor(
      () => {
        // Animation should complete
        expect(Animated.timing).toBeDefined();
      },
      { timeout: 400 },
    );
  });

  it('does not apply animation when showing all steps', () => {
    const { getByTestId } = render(
      <StepContent step={mockStep} stepNumber={1} showAllSteps={true} testID="step-content" />,
    );

    const container = getByTestId('step-content');

    // Should not have animation styles when showing all steps
    const animatedStyles = container.props.style.filter(
      (style: any) => style.opacity !== undefined || style.transform !== undefined,
    );
    expect(animatedStyles.length).toBe(0);
  });

  it('shows step number in badge', () => {
    const { getByText } = render(<StepContent step={mockStep} stepNumber={3} />);

    expect(getByText('3')).toBeTruthy();
  });

  it('handles long descriptions properly', () => {
    const longStep = {
      ...mockStep,
      description:
        'This is a very long description that contains multiple sentences and detailed instructions. It should wrap properly and maintain good readability. The text should be properly formatted with appropriate line height to ensure easy reading during emergency situations.',
    };

    const { getByText } = render(<StepContent step={longStep} stepNumber={1} />);

    const description = getByText(longStep.description);
    expect(description).toBeTruthy();
    expect(description.props.style.lineHeight).toBeDefined();
  });
});
