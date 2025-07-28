import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { LayoutAnimation } from 'react-native';
import Haptics from 'react-native-haptic-feedback';
import { GuideWarnings } from '../../../src/components/guides/GuideWarnings';

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native/Libraries/LayoutAnimation/LayoutAnimation', () => ({
  configureNext: jest.fn(),
  Presets: {
    easeInEaseOut: {},
  },
}));

describe('GuideWarnings', () => {
  const mockWarnings = [
    'Do not move victim unless in immediate danger',
    'Do not give anything by mouth if unconscious',
    'Do not attempt if untrained',
  ];

  const mockWhenToSeekHelp = [
    'Victim is unresponsive',
    'Breathing has stopped',
    "Heavy bleeding that won't stop",
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders both sections when data provided', () => {
    const { getByText } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    expect(getByText('Warnings')).toBeTruthy();
    expect(getByText('When to Call Emergency')).toBeTruthy();

    // Check all warning items
    mockWarnings.forEach((warning) => {
      expect(getByText(warning)).toBeTruthy();
    });

    // Check all emergency items
    mockWhenToSeekHelp.forEach((item) => {
      expect(getByText(item)).toBeTruthy();
    });
  });

  it('renders only warnings section when no emergency items', () => {
    const { getByText, queryByText } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={[]} />,
    );

    expect(getByText('Warnings')).toBeTruthy();
    expect(queryByText('When to Call Emergency')).toBeNull();
  });

  it('renders only emergency section when no warnings', () => {
    const { getByText, queryByText } = render(
      <GuideWarnings warnings={[]} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    expect(queryByText('Warnings')).toBeNull();
    expect(getByText('When to Call Emergency')).toBeTruthy();
  });

  it('returns null when no data provided', () => {
    const { container } = render(<GuideWarnings warnings={[]} whenToSeekHelp={[]} />);

    expect(container.children.length).toBe(0);
  });

  it('handles section collapse/expand with animation', () => {
    const { getByTestId, queryByText } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    // Initially expanded
    expect(queryByText(mockWarnings[0])).toBeTruthy();

    // Collapse warnings section
    fireEvent.press(getByTestId('warnings-header'));

    expect(LayoutAnimation.configureNext).toHaveBeenCalled();
    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
    expect(queryByText(mockWarnings[0])).toBeNull();

    // Expand warnings section
    fireEvent.press(getByTestId('warnings-header'));
    expect(queryByText(mockWarnings[0])).toBeTruthy();
  });

  it('shows collapse indicator when section collapsed', () => {
    const { getByTestId } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    const warningsHeader = getByTestId('warnings-header');

    // Initially no indicator (expanded)
    expect(warningsHeader.findAllByProps({ testID: 'indicator-dot' }).length).toBe(0);

    // Collapse section
    fireEvent.press(warningsHeader);

    // Should show indicator
    const expandIcon = warningsHeader.findByType('Icon');
    expect(expandIcon.props.name).toBe('expand-more');
  });

  it('applies high contrast styling', () => {
    const { getByText, getByTestId } = render(
      <GuideWarnings
        warnings={mockWarnings}
        whenToSeekHelp={mockWhenToSeekHelp}
        isHighContrast={true}
      />,
    );

    const warningsHeader = getByTestId('warnings-header');
    expect(warningsHeader.props.style).toMatchObject({
      backgroundColor: '#FFFFFF',
    });

    const warningText = getByText(mockWarnings[0]);
    expect(warningText.props.style).toMatchObject({
      color: '#FFFFFF',
      fontWeight: '400',
    });
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId, getByText } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    const warningsHeader = getByTestId('warnings-header');
    expect(warningsHeader.props.accessible).toBe(true);
    expect(warningsHeader.props.accessibilityLabel).toBe('Warnings, expanded, 3 items');
    expect(warningsHeader.props.accessibilityRole).toBe('button');
    expect(warningsHeader.props.accessibilityState).toEqual({ expanded: true });

    const warningItem = getByText(mockWarnings[0]);
    expect(warningItem.props.accessible).toBe(true);
    expect(warningItem.props.accessibilityLabel).toBe(`Warning: ${mockWarnings[0]}`);
  });

  it('updates accessibility state when collapsed', () => {
    const { getByTestId } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    const warningsHeader = getByTestId('warnings-header');

    // Collapse
    fireEvent.press(warningsHeader);

    expect(warningsHeader.props.accessibilityLabel).toBe('Warnings, collapsed, 3 items');
    expect(warningsHeader.props.accessibilityState).toEqual({ expanded: false });
  });

  it('renders bullet points for each item', () => {
    const { getAllByText } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    // Should have bullet points for all items
    const bullets = getAllByText('•');
    expect(bullets.length).toBe(mockWarnings.length + mockWhenToSeekHelp.length);
  });

  it('maintains separate expand state for each section', () => {
    const { getByTestId, queryByText } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    // Collapse warnings
    fireEvent.press(getByTestId('warnings-header'));
    expect(queryByText(mockWarnings[0])).toBeNull();
    expect(queryByText(mockWhenToSeekHelp[0])).toBeTruthy(); // Emergency still expanded

    // Collapse emergency
    fireEvent.press(getByTestId('emergency-header'));
    expect(queryByText(mockWarnings[0])).toBeNull();
    expect(queryByText(mockWhenToSeekHelp[0])).toBeNull();

    // Expand warnings
    fireEvent.press(getByTestId('warnings-header'));
    expect(queryByText(mockWarnings[0])).toBeTruthy();
    expect(queryByText(mockWhenToSeekHelp[0])).toBeNull(); // Emergency still collapsed
  });

  it('uses different styling for emergency section', () => {
    const { getByTestId } = render(
      <GuideWarnings warnings={mockWarnings} whenToSeekHelp={mockWhenToSeekHelp} />,
    );

    const emergencyHeader = getByTestId('emergency-header');
    const emergencySection = emergencyHeader.parent;

    // Emergency section should have error color styling
    expect(emergencySection.props.style).toMatchObject({
      borderColor: expect.any(String), // Should be error color
    });
  });
});
