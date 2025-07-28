import { StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '@styles/theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  containerHighContrast: {
    backgroundColor: '#000000',
    borderBottomColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text,
    fontWeight: '300',
    marginBottom: Spacing.xs,
  },
  titleHighContrast: {
    color: '#FFFFFF',
    fontWeight: '400',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    marginRight: Spacing.xs,
  },
  categoryText: {
    ...Typography.caption1,
    textTransform: 'lowercase',
    color: Colors.textSecondary,
  },
  categoryTextHighContrast: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeEstimate: {
    ...Typography.caption1,
    color: Colors.textSecondary,
  },
  timeEstimateHighContrast: {
    color: '#FFFFFF',
  },
  bookmarked: {
    color: Colors.warning,
  },
});
