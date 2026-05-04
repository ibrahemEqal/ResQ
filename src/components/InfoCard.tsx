import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '@/app/incident/styles';

type InfoCardProps = {
  label: string;
  value: string | number;
  isMuted?: boolean;
};

export function InfoCard({ label, value, isMuted = false }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={isMuted ? styles.noImage : styles.value}>{value}</Text>
    </View>
  );
}