import React from 'react';
import { Share } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import Haptics from 'react-native-haptic-feedback';
import { GuideHeader } from '../../../src/components/guides/GuideHeader';
import { FirstAidGuide } from '../../../src/types';
import { GuideCategory } from '../../../src/types/guideContent';

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

describe('GuideHeader', () => {
  const mockOnBookmarkToggle = jest.fn();
  const mockOnSharePress = jest.fn();

  const mockGuide: FirstAidGuide = {
    id: '1',
    title: 'Adult CPR - Cardiopulmonary Resuscitation',
    category: GuideCategory.BASIC_LIFE_SUPPORT,
    severity: 'critical',
    summary: 'Learn how to perform CPR on adults',
    content: {
      steps: [
        { order: 1, title: 'Check responsiveness', description: 'Tap shoulders', duration: 30 },
        { order: 2, title: 'Call 911', description: 'Get help', duration: 60 },
        { order: 3, title: 'Start compressions', description: '30 compressions', duration: 120 },
      ],
      warnings: ['Do not move victim'],
      whenToSeekHelp: ['Victim unresponsive'],
    },
    searchTags: ['cpr', 'cardiac'],
    version: 1,
    isOfflineAvailable: true,
    viewCount: 0,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders guide header correctly', () => {
    const { getByText } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
      />,
    );

    expect(getByText('Adult CPR - Cardiopulmonary Resuscitation')).toBeTruthy();
    expect(getByText('basic life support')).toBeTruthy();
    expect(getByText('4 min read')).toBeTruthy(); // (30 + 60 + 120) / 60 = 3.5, rounded up to 4
  });

  it('shows correct bookmark icon state', () => {
    const { getByTestId, rerender } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
      />,
    );

    const bookmarkButton = getByTestId('bookmark-button');
    const unbookmarkedIcon = bookmarkButton.findByType('Icon');
    expect(unbookmarkedIcon.props.name).toBe('bookmark-outline');

    rerender(
      <GuideHeader guide={mockGuide} isBookmarked={true} onBookmarkToggle={mockOnBookmarkToggle} />,
    );

    const bookmarkedIcon = bookmarkButton.findByType('Icon');
    expect(bookmarkedIcon.props.name).toBe('bookmark');
  });

  it('handles bookmark toggle with haptic feedback', () => {
    const { getByTestId } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
      />,
    );

    fireEvent.press(getByTestId('bookmark-button'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    expect(mockOnBookmarkToggle).toHaveBeenCalledTimes(1);
  });

  it('handles share functionality', async () => {
    (Share.share as jest.Mock).mockResolvedValueOnce({ action: 'sharedAction' });

    const { getByTestId } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        onSharePress={mockOnSharePress}
      />,
    );

    fireEvent.press(getByTestId('share-button'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactLight');
    expect(Share.share).toHaveBeenCalledWith({
      message: expect.stringContaining('Adult CPR - Cardiopulmonary Resuscitation'),
      title: 'Adult CPR - Cardiopulmonary Resuscitation',
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockOnSharePress).toHaveBeenCalledTimes(1);
  });

  it('includes disclaimer in share content', async () => {
    const { getByTestId } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
      />,
    );

    fireEvent.press(getByTestId('share-button'));

    expect(Share.share).toHaveBeenCalledWith({
      message: expect.stringContaining('DISCLAIMER'),
      title: expect.any(String),
    });
  });

  it('applies high contrast styling', () => {
    const { getByText, getByTestId } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        isHighContrast={true}
        onBookmarkToggle={mockOnBookmarkToggle}
      />,
    );

    const container = getByTestId('guide-header');
    expect(container.props.style).toMatchObject({
      backgroundColor: '#000000',
    });

    const title = getByText('Adult CPR - Cardiopulmonary Resuscitation');
    expect(title.props.style).toMatchObject({
      color: '#FFFFFF',
      fontWeight: '400',
    });
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
      />,
    );

    const bookmarkButton = getByTestId('bookmark-button');
    expect(bookmarkButton.props.accessible).toBe(true);
    expect(bookmarkButton.props.accessibilityLabel).toBe('Add bookmark');
    expect(bookmarkButton.props.accessibilityRole).toBe('button');

    const shareButton = getByTestId('share-button');
    expect(shareButton.props.accessible).toBe(true);
    expect(shareButton.props.accessibilityLabel).toBe('Share guide');
    expect(shareButton.props.accessibilityRole).toBe('button');
  });

  it('calculates read time with default duration for steps without duration', () => {
    const guideWithMixedDurations = {
      ...mockGuide,
      content: {
        ...mockGuide.content,
        steps: [
          { order: 1, title: 'Step 1', description: 'Desc 1', duration: 30 },
          { order: 2, title: 'Step 2', description: 'Desc 2' }, // No duration, defaults to 60
          { order: 3, title: 'Step 3', description: 'Desc 3', duration: 90 },
        ],
      },
    };

    const { getByText } = render(
      <GuideHeader
        guide={guideWithMixedDurations}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
      />,
    );

    // (30 + 60 + 90) / 60 = 3 minutes
    expect(getByText('3 min read')).toBeTruthy();
  });

  it('displays correct severity color for category badge', () => {
    const { getByTestId } = render(
      <GuideHeader
        guide={mockGuide}
        isBookmarked={false}
        onBookmarkToggle={mockOnBookmarkToggle}
        testID="guide-header"
      />,
    );

    const header = getByTestId('guide-header');
    const categoryBadge = header.findByProps({ testID: 'category-badge' });

    // Basic life support is critical severity with red color
    expect(categoryBadge.props.style).toMatchObject({
      borderColor: '#da1e28',
    });
  });
});
