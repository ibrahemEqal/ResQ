

import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ViewToggleProps {
  value: 'list' | 'map';
  onChange: (mode: 'list' | 'map') => void;
}

const TOGGLE_OPTIONS = [
  { value: 'list', label: '☰ القائمة' },
  { value: 'map', label: '🗺️ الخريطة' },
] as const;

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <View style={styles.container}>
      {TOGGLE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.button, value === option.value && styles.buttonActive]}
          onPress={() => onChange(option.value)}
        >
          <Text style={[styles.buttonText, value === option.value && styles.buttonTextActive]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  button: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
});
