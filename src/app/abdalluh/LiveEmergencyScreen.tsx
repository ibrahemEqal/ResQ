import React from 'react';
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

// Store
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

// Components
import { EmergencyHeader } from '@/components/abdalluh/EmergencyHeader';
import { FilterPills } from '@/components/abdalluh/FilterPills';
import { EmergencyMapView } from '@/components/abdalluh/MapView';
import { ReportList } from '@/components/abdalluh/ReportList';
import { SearchBar } from '@/components/abdalluh/SearchBar';
import { ViewToggle } from '@/components/abdalluh/ViewToggle';

export function LiveEmergencyScreen() {
  // All state and business logic lives in the store
  const store = useLiveEmergencyStore();

  // ── Loading state ───────────────────────────────────────────────────────────
  if (store.loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>جارٍ تحميل البلاغات...</Text>
      </View>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
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

  // ── Build FilterPills option arrays ─────────────────────────────────────────
  const typeOptions = TYPE_FILTERS.map((t: FilterType) => ({
    value: t,
    label: t === 'All' ? '🔎 الكل' : getTypeLabel(t as Exclude<FilterType, 'All'>),
  }));

  const statusOptions = STATUS_FILTERS.map((s: FilterStatus) => ({
    value: s,
    label: s === 'All' ? 'كل الحالات' : getStatusLabel(s as Exclude<FilterStatus, 'All'>),
  }));

  // Custom active pill style for the status filter row:
  // each status value uses its own brand color instead of the default red.
  const getStatusPillStyle = (value: string): ViewStyle => ({
    backgroundColor: getStatusColor(value as ReportStatus) + '22',
    borderColor:     getStatusColor(value as ReportStatus),
  });

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Live badge + title + filtered count */}
      <EmergencyHeader
        filteredCount={store.filteredReports.length}
        totalCount={store.reports.length}
      />

      {/* Full-text search */}
      <SearchBar
        value={store.searchQuery}
        onChangeText={store.setSearchQuery}
      />

      {/* List / Map toggle */}
      <ViewToggle
        value={store.viewMode}
        onChange={store.setViewMode}
      />

      {/* Emergency type filter pills */}
      <FilterPills
        options={typeOptions}
        value={store.selectedType}
        onChange={(v) => store.setSelectedType(v as FilterType)}
      />

      {/* Status filter pills (each with its own brand color when active) */}
      <FilterPills
        options={statusOptions}
        value={store.selectedStatus}
        onChange={(v) => store.setSelectedStatus(v as FilterStatus)}
        getActivePillStyle={getStatusPillStyle}
        getActiveTextStyle={(v) => ({ color: getStatusColor(v === 'All' ? 'Open' : v as ReportStatus) })}
      />

      {/* Main content area: list or map depending on viewMode */}
      {store.viewMode === 'list' ? (
        <ReportList
          reports={store.filteredReports}
          refreshing={store.refreshing}
          onRefresh={store.handleRefresh}
          expandedId={store.expandedId}
          onCardPress={(id: string | null) => store.setExpandedId(id)}
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
