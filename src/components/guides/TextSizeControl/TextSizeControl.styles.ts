import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@styles/theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 0,
  },
  containerHighContrast: {
    backgroundColor: '#333333',
  },
  label: {
    ...Typography.footnote,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  labelHighContrast: {
    color: '#CCCCCC',
  },
  sizeOptions: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  sizeButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    marginHorizontal: Spacing.xs,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sizeButtonHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#666666',
  },
  sizeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sizeButtonActiveHighContrast: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  sizeButtonText: {
    ...Typography.caption1,
    color: Colors.text,
    fontWeight: '500',
  },
  sizeButtonTextHighContrast: {
    color: '#FFFFFF',
  },
  sizeButtonTextActive: {
    color: '#FFFFFF',
  },
  sizeButtonTextActiveHighContrast: {
    color: '#000000',
  },
  sizeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sizePreview: {
    marginLeft: Spacing.xs,
  },
});
