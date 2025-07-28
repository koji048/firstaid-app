import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Haptics from 'react-native-haptic-feedback';
import { GuideCard } from '../../../src/components/guides/GuideCard';
import { FirstAidGuide } from '../../../src/types';
import { GuideCategory } from '../../../src/types/guideContent';

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

describe('GuideCard', () => {
  const mockOnPress = jest.fn();
  const mockOnBookmarkToggle = jest.fn();

  const mockGuide: FirstAidGuide = {
    id: '1',
    title: 'Adult CPR - Cardiopulmonary Resuscitation',
    category: GuideCategory.BASIC_LIFE_SUPPORT,
    severity: 'critical',
    summary:
      'Learn how to perform CPR on adults when breathing stops. Life-saving technique for cardiac emergencies.',
    content: {
      steps: [
        { order: 1, title: 'Check responsiveness', description: 'Tap shoulders and shout' },
        { order: 2, title: 'Call 911', description: 'Get emergency help' },
        { order: 3, title: 'Start compressions', description: '30 chest compressions' },
      ],
      warnings: ['Do not move victim unless in danger'],
      whenToSeekHelp: ['Victim unresponsive', 'No breathing'],
    },
    searchTags: ['cpr', 'cardiac', 'arrest'],
    version: 1,
    isOfflineAvailable: true,
    viewCount: 0,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with guide information', () => {
    const { getByText, getByTestId } = render(
      <GuideCard guide={mockGuide} onPress={mockOnPress} />,
    );

    expect(getByText('Adult CPR - Cardiopulmonary Resuscitation')).toBeTruthy();
    expect(
      getByText(
        'Learn how to perform CPR on adults when breathing stops. Life-saving technique for cardiac emergencies.',
      ),
    ).toBeTruthy();
    expect(getByText('CRITICAL')).toBeTruthy();
    expect(getByText('OFFLINE')).toBeTruthy();
    expect(getByText('2 min read')).toBeTruthy();
    expect(getByTestId('offline-badge')).toBeTruthy();
  });

  it('displays correct severity indicator and badge', () => {
    const { getByTestId, getByText, rerender } = render(
      <GuideCard guide={mockGuide} onPress={mockOnPress} />,
    );

    const severityIndicator = getByTestId('severity-indicator');
    expect(severityIndicator.props.style).toMatchObject({
      backgroundColor: '#da1e28',
    });
    expect(getByText('CRITICAL')).toBeTruthy();

    const mediumGuide = { ...mockGuide, severity: 'medium' as const };
    rerender(<GuideCard guide={mediumGuide} onPress={mockOnPress} />);
    expect(getByText('MEDIUM')).toBeTruthy();
  });

  it('triggers haptic feedback and onPress when pressed', () => {
    const { getByTestId } = render(<GuideCard guide={mockGuide} onPress={mockOnPress} />);

    fireEvent.press(getByTestId('guide-card'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('handles bookmark toggle correctly', () => {
    const { getByTestId } = render(
      <GuideCard
        guide={mockGuide}
        onPress={mockOnPress}
        onBookmarkToggle={mockOnBookmarkToggle}
        isBookmarked={false}
      />,
    );

    fireEvent.press(getByTestId('bookmark-button'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    expect(mockOnBookmarkToggle).toHaveBeenCalledWith('1');
  });

  it('shows correct bookmark icon state', () => {
    const { getByTestId, rerender } = render(
      <GuideCard
        guide={mockGuide}
        onPress={mockOnPress}
        onBookmarkToggle={mockOnBookmarkToggle}
        isBookmarked={false}
      />,
    );

    const bookmarkButton = getByTestId('bookmark-button');
    const unbookmarkedIcon = bookmarkButton.findByType('Icon');
    expect(unbookmarkedIcon.props.name).toBe('bookmark-outline');

    rerender(
      <GuideCard
        guide={mockGuide}
        onPress={mockOnPress}
        onBookmarkToggle={mockOnBookmarkToggle}
        isBookmarked={true}
      />,
    );

    const bookmarkedIcon = bookmarkButton.findByType('Icon');
    expect(bookmarkedIcon.props.name).toBe('bookmark');
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId } = render(<GuideCard guide={mockGuide} onPress={mockOnPress} />);

    const card = getByTestId('guide-card');
    expect(card.props.accessible).toBe(true);
    expect(card.props.accessibilityRole).toBe('button');
    expect(card.props.accessibilityLabel).toContain('Adult CPR');
    expect(card.props.accessibilityLabel).toContain('CRITICAL severity');
    expect(card.props.accessibilityLabel).toContain('2 minute read');
    expect(card.props.accessibilityHint).toBe('Double tap to view full guide');
  });

  it('calculates read time correctly', () => {
    const { getByText } = render(<GuideCard guide={mockGuide} onPress={mockOnPress} />);

    expect(getByText('2 min read')).toBeTruthy();

    const longGuide = {
      ...mockGuide,
      content: {
        steps: Array(10).fill({ order: 1, title: 'Step', description: 'Description' }),
        warnings: Array(5).fill('Warning'),
        whenToSeekHelp: Array(5).fill('Help'),
      },
    };

    const { getByText: getByTextLong } = render(
      <GuideCard guide={longGuide} onPress={mockOnPress} />,
    );

    expect(getByTextLong('10 min read')).toBeTruthy();
  });

  it('hides bookmark button when onBookmarkToggle is not provided', () => {
    const { queryByTestId } = render(<GuideCard guide={mockGuide} onPress={mockOnPress} />);

    expect(queryByTestId('bookmark-button')).toBeNull();
  });

  it('meets minimum touch target size requirements', () => {
    const { getByTestId } = render(<GuideCard guide={mockGuide} onPress={mockOnPress} />);

    const card = getByTestId('guide-card');
    const cardStyle = card.props.style;

    const minHeight =
      cardStyle.find((style: { minHeight?: number }) => style.minHeight)?.minHeight || 0;
    expect(minHeight).toBeGreaterThanOrEqual(120);
  });

  it('displays category name correctly formatted', () => {
    const { getByText } = render(<GuideCard guide={mockGuide} onPress={mockOnPress} />);

    expect(getByText('basic life support')).toBeTruthy();
  });
});
