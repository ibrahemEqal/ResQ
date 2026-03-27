import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MOCK_REPORTS } from '../../data/mockData';

export default function EmergencyDetailsPage() {
  const report = MOCK_REPORTS[1];

  const [currentStatus, setCurrentStatus] = useState(report.status);
  const [assignedResponder, setAssignedResponder] = useState('غير معين');

  const [timeline, setTimeline] = useState([
    {
      status: 'تم إنشاء البلاغ',
      time: new Date(report.createdAt).toLocaleString(),
      note: 'تم إنشاء البلاغ من قبل المستخدم',
    },
    {
      status: 'تمت المراجعة',
      time: new Date(report.createdAt).toLocaleString(),
      note: 'تمت مراجعة البلاغ من قبل الإدارة',
    },
  ]);

  const priority = useMemo(() => {
    if (currentStatus === 'Critical') return 'عالية';
    if (currentStatus === 'Open') return 'متوسطة';
    return 'منخفضة';
  }, [currentStatus]);

  const statusArabic: any = {
    Open: 'مفتوح',
    Critical: 'حرج',
    Reviewed: 'تمت المراجعة',
    Assigned: 'تم التعيين',
    'In Progress': 'قيد المعالجة',
    Resolved: 'تم الحل',
  };

  const handleAssignResponder = () => {
    const responderName = 'فريق الطوارئ A';
    setAssignedResponder(responderName);

    setTimeline((prev) => [
      ...prev,
      {
        status: 'تم التعيين',
        time: new Date().toLocaleString(),
        note: `تم تعيين البلاغ إلى ${responderName}`,
      },
    ]);

    Alert.alert('تم التعيين', `تم تعيين ${responderName}`);
  };

  const handleUpdateStatus = (newStatus: string) => {
    setCurrentStatus(newStatus);

    setTimeline((prev) => [
      ...prev,
      {
        status: statusArabic[newStatus],
        time: new Date().toLocaleString(),
        note: `تم تحديث الحالة إلى ${statusArabic[newStatus]}`,
      },
    ]);

    Alert.alert('تم التحديث', `الحالة أصبحت ${statusArabic[newStatus]}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>تفاصيل البلاغ</Text>

      <View style={styles.card}>
        <Text style={styles.label}>رقم البلاغ</Text>
        <Text style={styles.value}>{report.id}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>نوع الطوارئ</Text>
        <Text style={styles.value}>{report.type}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الوصف</Text>
        <Text style={styles.value}>{report.description}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الموقع</Text>
        <Text style={styles.value}>{report.location}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الوقت</Text>
        <Text style={styles.value}>
          {new Date(report.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الحالة</Text>
        <Text style={styles.value}>{statusArabic[currentStatus]}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الأولوية</Text>
        <Text style={styles.value}>{priority}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>المسؤول</Text>
        <Text style={styles.value}>{assignedResponder}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>الصورة</Text>
        <Text style={styles.noImage}>لا يوجد صورة</Text>
      </View>

      {/* Timeline */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>تسلسل الحالة</Text>

        {timeline.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStatus}>{item.status}</Text>
              <Text style={styles.timelineTime}>{item.time}</Text>
              <Text style={styles.timelineNote}>{item.note}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Workflow */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>إدارة البلاغ</Text>

        <Pressable style={styles.assignButton} onPress={handleAssignResponder}>
          <Text style={styles.buttonText}>تعيين مسؤول</Text>
        </Pressable>

        <View style={styles.statusButtonsWrapper}>
          <Pressable
            style={[styles.statusButton, styles.reviewedButton]}
            onPress={() => handleUpdateStatus('Reviewed')}
          >
            <Text style={styles.statusButtonText}>تمت المراجعة</Text>
          </Pressable>

          <Pressable
            style={[styles.statusButton, styles.assignedButton]}
            onPress={() => handleUpdateStatus('Assigned')}
          >
            <Text style={styles.statusButtonText}>تم التعيين</Text>
          </Pressable>

          <Pressable
            style={[styles.statusButton, styles.progressButton]}
            onPress={() => handleUpdateStatus('In Progress')}
          >
            <Text style={styles.statusButtonText}>قيد المعالجة</Text>
          </Pressable>

          <Pressable
            style={[styles.statusButton, styles.resolvedButton]}
            onPress={() => handleUpdateStatus('Resolved')}
          >
            <Text style={styles.statusButtonText}>تم الحل</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 16,
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '500',
  },
  noImage: {
    fontSize: 15,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginTop: 6,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineTime: {
    fontSize: 12,
    color: '#64748B',
  },
  timelineNote: {
    fontSize: 13,
    color: '#334155',
  },
  assignButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statusButtonsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    padding: 10,
    borderRadius: 10,
  },
  reviewedButton: {
    backgroundColor: '#E2E8F0',
  },
  assignedButton: {
    backgroundColor: '#DBEAFE',
  },
  progressButton: {
    backgroundColor: '#FEF3C7',
  },
  resolvedButton: {
    backgroundColor: '#DCFCE7',
  },
  statusButtonText: {
    fontWeight: '600',
  },
});