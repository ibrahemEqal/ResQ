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
  value: string;
  onChange: (value: string) => void;
  getActivePillStyle?: (value: string) => ViewStyle;
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
    flexShrink: 0,
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
  pillActiveDefault: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600', 
  },
  pillTextActiveDefault: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
