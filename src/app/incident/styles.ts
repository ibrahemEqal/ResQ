import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    paddingBottom: Theme.spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: Theme.spacing.md,
    color: Theme.colors.textPrimary,
    textAlign: 'left',
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  label: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
    textAlign: 'left',
  },
  value: {
    fontSize: 16,
    color: Theme.colors.textPrimary,
    fontWeight: '500',
    textAlign: 'right',
  },
  noImage: {
    fontSize: 15,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Theme.spacing.sm,
    color: Theme.colors.textPrimary,
    textAlign: 'left',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.sm,
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Theme.colors.primary,
    marginTop: 6,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
    textAlign: 'left',
  },
  timelineTime: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  timelineNote: {
    fontSize: 13,
    color: Theme.colors.textPrimary,
    marginTop: 4,
    textAlign: 'left',
  },
  assignButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  buttonText: {
    color: Theme.colors.surface,
    fontWeight: '700',
    fontSize: 15,
  },
  statusButtonsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.radius.sm,
  },
  reviewedButton: {
    backgroundColor: Theme.colors.border,
  },
  assignedButton: {
    backgroundColor: Theme.colors.primaryLight,
  },
  progressButton: {
    backgroundColor: Theme.colors.warning,
  },
  resolvedButton: {
    backgroundColor: Theme.colors.success,
  },
  statusButtonText: {
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    fontSize: 14,
  },
});