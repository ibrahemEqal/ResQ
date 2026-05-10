import { COLORS } from '@/constants/colors';
import { Report } from '@/types';
import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ReportCard } from './ReportCard';
interface ReportListProps {
  reports: Report[];
  refreshing: boolean;
  onRefresh: () => void;
  expandedId: string | null;
  onCardPress: (id: string) => void;
  canResolveReports: boolean;
  onResolve: (id: string) => void;
}
export function ReportList({
  reports,
  refreshing,
  onRefresh,
  expandedId,
  onCardPress,
  canResolveReports,
  onResolve,
}: ReportListProps) {
  return (
    <FlatList
      style={{ flex: 1 }}
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ReportCard
          report={item}
          isExpanded={item.id === expandedId}
          onPress={() => onCardPress(item.id === expandedId ? '' : item.id)}
          canResolve={canResolveReports}
          onResolve={() => onResolve(item.id)}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      ListEmptyComponent={<EmptyState />}
    />
  );
}
function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>✅</Text>
      <Text style={styles.emptyTitle}>لا توجد بلاغات تطابق البحث</Text>
      <Text style={styles.emptySubtitle}>جرّب تغيير الفلاتر أو كلمة البحث</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
