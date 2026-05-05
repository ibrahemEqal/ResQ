import { styles } from '@/lib/incident/styles';
import { Pressable, Text, View } from 'react-native';

type ReportActionsProps = {
  onAssignResponder: () => void;
  onUpdateStatus: (status: string) => void;
};

export function ReportActions({
  onAssignResponder,
  onUpdateStatus,
}: ReportActionsProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>إدارة البلاغ</Text>

      <Pressable style={styles.assignButton} onPress={onAssignResponder}>
        <Text style={styles.buttonText}>تعيين مسؤول</Text>
      </Pressable>

      <View style={styles.statusButtonsWrapper}>
        <Pressable
          style={[styles.statusButton, styles.reviewedButton]}
          onPress={() => onUpdateStatus('Reviewed')}
        >
          <Text style={styles.statusButtonText}>تمت المراجعة</Text>
        </Pressable>

        <Pressable
          style={[styles.statusButton, styles.assignedButton]}
          onPress={() => onUpdateStatus('Assigned')}
        >
          <Text style={styles.statusButtonText}>تم التعيين</Text>
        </Pressable>

        <Pressable
          style={[styles.statusButton, styles.progressButton]}
          onPress={() => onUpdateStatus('In Progress')}
        >
          <Text style={styles.statusButtonText}>قيد المعالجة</Text>
        </Pressable>

        <Pressable
          style={[styles.statusButton, styles.resolvedButton]}
          onPress={() => onUpdateStatus('Resolved')}
        >
          <Text style={styles.statusButtonText}>تم الحل</Text>
        </Pressable>
      </View>
    </View>
  );
}