import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { InfoCard } from '@/components/InfoCard';
import { ReportActions } from '@/components/ReportActions';
import { TimelineSection } from '@/components/TimelineSection';
import { useIncidentDetails } from './hooks/useIncidentDetails';
import { styles } from './styles';
import { formatDate } from './utils/formatDate';
import { statusArabic } from './utils/statusMap';

export default function IncidentDetailsPage() {
  const { id } = useLocalSearchParams();

  const {
    report,
    currentStatus,
    assignedResponder,
    timeline,
    handleAssignResponder,
    handleUpdateStatus,
    loading,
  } = useIncidentDetails(id);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>جاري تحميل البلاغ...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>البلاغ غير موجود</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>تفاصيل البلاغ</Text>

      <InfoCard label="رقم البلاغ" value={report.id} />
      <InfoCard label="نوع الطوارئ" value={report.type} />
      <InfoCard label="الوصف" value={report.description} />
      <InfoCard label="الموقع" value={report.location} />
      <InfoCard label="الوقت" value={formatDate(report.createdAt)} />
      <InfoCard
        label="الحالة"
        value={statusArabic[currentStatus] || currentStatus}
      />
      <InfoCard label="الأولوية" value={report.priority} />
      <InfoCard label="المسؤول" value={assignedResponder} />
      <InfoCard label="الصورة" value="لا يوجد صورة" isMuted />

      <TimelineSection timeline={timeline} />

      <ReportActions
        onAssignResponder={handleAssignResponder}
        onUpdateStatus={handleUpdateStatus}
      />
    </ScrollView>
  );
}