import { styles } from '@/lib/incident/styles';
import { Text, View } from 'react-native';

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