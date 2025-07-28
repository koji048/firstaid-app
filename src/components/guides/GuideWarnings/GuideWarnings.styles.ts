import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@styles/theme';

export const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.danger,
    backgroundColor: Colors.background,
  },
  sectionHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.danger,
  },
  headerHighContrast: {
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    ...Typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  headerTitleHighContrast: {
    color: '#000000',
  },
  expandButton: {
    padding: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  warningBullet: {
    width: 20,
    alignItems: 'center',
  },
  warningText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  warningTextHighContrast: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  emergencySection: {
    borderColor: Colors.error,
  },
  emergencyHeader: {
    backgroundColor: Colors.error,
  },
  collapsedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: Spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: Spacing.xs,
  },
  indicatorDotHighContrast: {
    backgroundColor: '#000000',
  },
});
