import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import Haptics from 'react-native-haptic-feedback';
import { CategoryCard } from '../../../src/components/guides/CategoryCard';
import { GuideCategory } from '../../../src/types/guideContent';

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

describe('CategoryCard', () => {
  const mockOnPress = jest.fn();

  const defaultProps = {
    category: GuideCategory.BASIC_LIFE_SUPPORT,
    guideCount: 5,
    onPress: mockOnPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with category information', () => {
    const { getByText, getByTestId } = render(<CategoryCard {...defaultProps} />);

    expect(getByText('Basic Life Support')).toBeTruthy();
    expect(getByText('CPR, choking, recovery position')).toBeTruthy();
    expect(getByText('5 guides')).toBeTruthy();
    expect(getByTestId('category-icon')).toBeTruthy();
  });

  it('displays correct severity indicator color for critical categories', () => {
    const { getByTestId, rerender } = render(<CategoryCard {...defaultProps} />);

    const severityIndicator = getByTestId('severity-indicator');
    expect(severityIndicator.props.style).toMatchObject({
      backgroundColor: '#da1e28',
    });

    rerender(<CategoryCard {...defaultProps} category={GuideCategory.MEDICAL_EMERGENCIES} />);
    expect(severityIndicator.props.style).toMatchObject({
      backgroundColor: '#f1620e',
    });
  });

  it('triggers haptic feedback and onPress when pressed', () => {
    const { getByTestId } = render(<CategoryCard {...defaultProps} />);

    fireEvent.press(getByTestId('category-card'));

    expect(Haptics.trigger).toHaveBeenCalledWith('impactMedium', {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    const { getByTestId } = render(<CategoryCard {...defaultProps} />);

    const card = getByTestId('category-card');
    expect(card.props.accessible).toBe(true);
    expect(card.props.accessibilityRole).toBe('button');
    expect(card.props.accessibilityLabel).toContain('Basic Life Support category with 5 guides');
    expect(card.props.accessibilityHint).toBe('Double tap to view guides in this category');
  });

  it('renders all category types correctly', () => {
    const categories = Object.values(GuideCategory);

    categories.forEach((category) => {
      const { getByText } = render(
        <CategoryCard category={category} guideCount={10} onPress={mockOnPress} />,
      );

      expect(getByText('10 guides')).toBeTruthy();
    });
  });

  it('meets minimum touch target size requirements', () => {
    const { getByTestId } = render(<CategoryCard {...defaultProps} />);

    const card = getByTestId('category-card');
    const cardStyle = card.props.style;

    const minHeight =
      cardStyle.find((style: { minHeight?: number }) => style.minHeight)?.minHeight || 0;
    expect(minHeight).toBeGreaterThanOrEqual(88);
  });

  it('renders child emergency category with appropriate color', () => {
    const { getByText, getByTestId } = render(
      <CategoryCard
        category={GuideCategory.PEDIATRIC_EMERGENCIES}
        guideCount={8}
        onPress={mockOnPress}
      />,
    );

    expect(getByText('Child Emergencies')).toBeTruthy();
    expect(getByText('Infant & child specific care')).toBeTruthy();

    const icon = getByTestId('category-icon');
    expect(icon.props.name).toBe('child-care');
    expect(icon.props.color).toBe('#24a148');
  });
});
