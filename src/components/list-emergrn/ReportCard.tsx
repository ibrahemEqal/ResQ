import { COLORS } from '@/constants/colors';
import { EmergencyType, Report } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getStatusColor, getStatusLabel, getTimeAgo, getTypeLabel } from '../../app/list-emergrn/store';
interface ReportCardProps {
  report: Report;
  isExpanded: boolean;
  onPress: () => void;
}
export function ReportCard({ report, isExpanded, onPress }: ReportCardProps) {
  const statusColor = getStatusColor(report.status);
  return (
    <TouchableOpacity
      style={[styles.card, isExpanded && styles.cardExpanded]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {}
      <View style={styles.header}>
        <Text style={styles.typeText}>
          {getTypeLabel(report.type as EmergencyType)}
        </Text>
        {}
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(report.status)}
          </Text>
        </View>
      </View>
      {}
      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {report.location}
        </Text>
      </View>
      {}
      {isExpanded && (
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>
      )}
      {}
      <View style={styles.footer}>
        <Text style={styles.reportId}>{report.id}</Text>
        <Text style={styles.timeText}>{getTimeAgo(report.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  cardExpanded: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationIcon: {
    fontSize: 13,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  descriptionBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
  },
  descriptionText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportId: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
