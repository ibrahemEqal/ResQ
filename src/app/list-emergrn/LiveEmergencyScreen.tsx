import React, { useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { ReportStatus } from '../../types';
import {
  FilterStatus,
  FilterType,
  STATUS_FILTERS,
  TYPE_FILTERS,
  getStatusColor,
  getStatusLabel,
  getTypeLabel,
  useLiveEmergencyStore,
} from './store';
import { EmergencyHeader } from '@/components/list-emergrn/EmergencyHeader';
import { FilterPills } from '@/components/list-emergrn/FilterPills';
import { EmergencyMapView } from '@/components/list-emergrn/MapView';
import { ReportList } from '@/components/list-emergrn/ReportList';
import { SearchBar } from '@/components/list-emergrn/SearchBar';
import { ViewToggle } from '@/components/list-emergrn/ViewToggle';

export function LiveEmergencyScreen() {
  const store = useLiveEmergencyStore();

  const typeOptions = useMemo(() => TYPE_FILTERS.map((t: FilterType) => ({
    value: t,
    label: t === 'All' ? '🔎 الكل' : getTypeLabel(t as Exclude<FilterType, 'All'>),
  })), []);

  const statusOptions = useMemo(() => STATUS_FILTERS.map((s: FilterStatus) => ({
    value: s,
    label: s === 'All' ? 'كل الحالات' : getStatusLabel(s as Exclude<FilterStatus, 'All'>),
  })), []);

  const getStatusPillStyle = useCallback((value: string): ViewStyle => ({
    backgroundColor: getStatusColor(value as ReportStatus) + '22',
    borderColor: getStatusColor(value as ReportStatus),
  }), []);

  const getActiveTextStyle = useCallback((v: string) => ({
    color: getStatusColor(v === 'All' ? 'Open' : v as ReportStatus)
  }), []);


  if (store.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل البلاغات...</Text>
      </View>
    );
  }

  if (store.error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.bigEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{store.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={store.loadReports}>
          <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <EmergencyHeader
        filteredCount={store.filteredReports.length}
        totalCount={store.reports.length}
      />

      <SearchBar
        value={store.searchQuery}
        onChangeText={store.setSearchQuery}
      />

      <ViewToggle
        value={store.viewMode}
        onChange={store.setViewMode}
      />

      <FilterPills
        options={typeOptions}
        value={store.selectedType}
        onChange={(v) => store.setSelectedType(v as FilterType)}
      />

      <FilterPills
        options={statusOptions}
        value={store.selectedStatus}
        onChange={(v) => store.setSelectedStatus(v as FilterStatus)}
        getActivePillStyle={getStatusPillStyle}
        getActiveTextStyle={getActiveTextStyle}
      />

      {store.viewMode === 'list' ? (
        <ReportList
          reports={store.filteredReports}
          refreshing={store.refreshing}
          onRefresh={store.handleRefresh}
          expandedId={store.expandedId}
          onCardPress={store.setExpandedId}
        />
      ) : (
        <EmergencyMapView
          reports={store.filteredReports}
          expandedId={store.expandedId}
          onMarkerPress={store.setExpandedId}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  bigEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
});