/**
 * components/ViewToggle.tsx
 * --------------------------
 * Segmented control that switches between List view and Map view.
 *
 *   [ ☰ القائمة ]  [ 🗺️ الخريطة ]
 */

import { COLORS } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ViewToggleProps {
  value: 'list' | 'map';
  onChange: (mode: 'list' | 'map') => void;
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, value === 'list' && styles.buttonActive]}
        onPress={() => onChange('list')}
      >
        <Text style={[styles.buttonText, value === 'list' && styles.buttonTextActive]}>
          ☰ القائمة
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, value === 'map' && styles.buttonActive]}
        onPress={() => onChange('map')}
      >
        <Text style={[styles.buttonText, value === 'map' && styles.buttonTextActive]}>
          🗺️ الخريطة
        </Text>
      </TouchableOpacity>
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
