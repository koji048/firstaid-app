import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@styles/theme';

export const createStyles = (textSize: 'normal' | 'large' | 'extra-large') => {
  const textSizeMultipliers = {
    normal: 1,
    large: 1.2,
    'extra-large': 1.4,
  };

  const multiplier = textSizeMultipliers[textSize];

  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: Spacing.xl,
      paddingVertical: Spacing.lg,
      backgroundColor: Colors.background,
    },
    containerHighContrast: {
      backgroundColor: '#000000',
    },
    stepHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    stepBadge: {
      width: 40,
      height: 40,
      borderRadius: 0,
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    stepBadgeHighContrast: {
      backgroundColor: '#FFFFFF',
    },
    stepNumber: {
      ...Typography.headline,
      fontSize: Typography.headline.fontSize * multiplier,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    stepNumberHighContrast: {
      color: '#000000',
    },
    stepTitle: {
      ...Typography.title2,
      fontSize: Typography.title2.fontSize * multiplier,
      color: Colors.text,
      fontWeight: '400',
      flex: 1,
    },
    stepTitleHighContrast: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    durationBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      backgroundColor: Colors.backgroundSecondary,
      marginTop: Spacing.sm,
    },
    durationBadgeHighContrast: {
      backgroundColor: '#333333',
    },
    durationText: {
      ...Typography.footnote,
      fontSize: Typography.footnote.fontSize * multiplier,
      color: Colors.textSecondary,
      marginLeft: Spacing.xs,
    },
    durationTextHighContrast: {
      color: '#CCCCCC',
    },
    contentContainer: {
      marginTop: Spacing.lg,
    },
    description: {
      ...Typography.body,
      fontSize: Typography.body.fontSize * multiplier,
      color: Colors.text,
      lineHeight: Typography.body.fontSize * multiplier * 1.6,
    },
    descriptionHighContrast: {
      color: '#FFFFFF',
      fontWeight: '400',
    },
    imagePlaceholder: {
      height: 200,
      backgroundColor: Colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: Spacing.lg,
    },
    imagePlaceholderHighContrast: {
      backgroundColor: '#333333',
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    imagePlaceholderText: {
      ...Typography.caption1,
      fontSize: Typography.caption1.fontSize * multiplier,
      color: Colors.textTertiary,
    },
    imagePlaceholderTextHighContrast: {
      color: '#CCCCCC',
    },
    transitionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: Colors.background,
    },
  });
};
