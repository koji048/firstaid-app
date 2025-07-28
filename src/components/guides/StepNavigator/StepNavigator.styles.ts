import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@styles/theme';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
    borderTopColor: '#FFFFFF',
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.backgroundSecondary,
    overflow: 'hidden',
  },
  progressBarHighContrast: {
    backgroundColor: '#333333',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressFillHighContrast: {
    backgroundColor: '#FFFFFF',
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  stepText: {
    ...Typography.headline,
    color: Colors.text,
    fontWeight: '500',
  },
  stepTextHighContrast: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewAllButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  viewAllText: {
    ...Typography.footnote,
    color: Colors.primary,
    fontWeight: '500',
  },
  viewAllTextHighContrast: {
    color: '#78a9ff',
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 56,
    minHeight: 56,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
  },
  navigationButtonHighContrast: {
    backgroundColor: '#333333',
  },
  navigationButtonDisabled: {
    opacity: 0.5,
  },
  navigationButtonText: {
    ...Typography.headline,
    color: Colors.text,
    fontWeight: '500',
    marginHorizontal: Spacing.xs,
  },
  navigationButtonTextHighContrast: {
    color: '#FFFFFF',
  },
  navigationButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  swipeHint: {
    ...Typography.caption1,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  swipeHintHighContrast: {
    color: '#CCCCCC',
  },
});
