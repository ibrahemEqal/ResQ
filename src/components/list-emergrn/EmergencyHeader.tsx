import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface EmergencyHeaderProps {
  filteredCount: number;
  totalCount: number;
}

export function EmergencyHeader({ filteredCount, totalCount }: EmergencyHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>البلاغات الحية</Text>
      <Text style={styles.count}>{filteredCount} من {totalCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  count: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});