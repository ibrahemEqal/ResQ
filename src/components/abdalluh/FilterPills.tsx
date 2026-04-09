/**
 * components/FilterPills.tsx
 * ---------------------------
 * GENERIC horizontal pill-row filter.
 * Used for BOTH the emergency-type filter AND the status filter —
 * the parent decides the options and how active pills look.
 *
 * Usage (type filter):
 *   <FilterPills
 *     options={TYPE_FILTERS.map(t => ({ label: getTypeLabel(t), value: t }))}
 *     value={selectedType}
 *     onChange={setSelectedType}
 *   />
 *
 * Usage (status filter with custom active color per value):
 *   <FilterPills
 *     options={STATUS_FILTERS.map(s => ({ label: getStatusLabel(s), value: s }))}
 *     value={selectedStatus}
 *     onChange={setSelectedStatus}
 *     getActivePillStyle={(v) => ({
 *       backgroundColor: getStatusColor(v as ReportStatus) + '22',
 *       borderColor:     getStatusColor(v as ReportStatus),
 *     })}
 *     getActiveTextStyle={(v) => ({
 *       color: getStatusColor(v as ReportStatus),
 *     })}
 *   />
 */

import { COLORS } from '@/constants/colors';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface PillOption {
  label: string;
  value: string;
}

interface FilterPillsProps {
  options: PillOption[];
  /** Currently selected value */
  value: string;
  onChange: (value: string) => void;
  /**
   * Optional: return a custom ViewStyle for the active pill container.
   * Useful when each status value has its own brand color.
   * Falls back to the default red active style when not provided.
   */
  getActivePillStyle?: (value: string) => ViewStyle;
  /**
   * Optional: return a custom TextStyle for the active pill label.
   */
  getActiveTextStyle?: (value: string) => TextStyle;
}

export function FilterPills({
  options,
  value,
  onChange,
  getActivePillStyle,
  getActiveTextStyle,
}: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
    >
      {options.map((option) => {
        const isActive = option.value === value;

        // Merge default active style with any custom style from the parent
        const pillStyle: ViewStyle[] = [
          styles.pill,
          isActive ? styles.pillActiveDefault : undefined,
          isActive && getActivePillStyle ? getActivePillStyle(option.value) : undefined,
        ].filter(Boolean) as ViewStyle[];

        const textStyle: TextStyle[] = [
          styles.pillText,
          isActive ? styles.pillTextActiveDefault : undefined,
          isActive && getActiveTextStyle ? getActiveTextStyle(option.value) : undefined,
        ].filter(Boolean) as TextStyle[];

        return (
          <TouchableOpacity
            key={option.value}
            style={pillStyle}
            onPress={() => onChange(option.value)}
          >
            <Text style={textStyle}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 42,
    marginBottom: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Default active style — overridden by getActivePillStyle when provided
  pillActiveDefault: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  // Default active text style — overridden by getActiveTextStyle when provided
  pillTextActiveDefault: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
