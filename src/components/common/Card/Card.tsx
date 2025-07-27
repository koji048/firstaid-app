import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import { Card as ElementsCard, CardProps as ElementsCardProps } from 'react-native-elements';
import { useAppTheme } from '@styles/ThemeProvider';

interface CardProps extends Omit<ElementsCardProps, 'theme'> {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card = memo<CardProps>(
  ({ children, style, variant = 'elevated', containerStyle, ...props }) => {
    const { colors, isDarkMode } = useAppTheme();

    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        borderWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDarkMode ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      outlined: {
        borderWidth: 1,
        borderColor: colors.border,
        shadowOpacity: 0,
        elevation: 0,
      },
      filled: {
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    return (
      <ElementsCard
        containerStyle={[
          {
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 16,
          },
          variantStyles[variant],
          containerStyle,
          style,
        ]}
        {...props}
      >
        {children}
      </ElementsCard>
    );
  },
);

Card.displayName = 'Card';
