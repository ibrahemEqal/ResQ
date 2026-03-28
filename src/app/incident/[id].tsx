import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { MOCK_REPORTS } from '../../data/mockData';
import { InfoCard } from './components/InfoCard';
import { TimelineSection } from './components/TimelineSection';
import { ReportActions } from './components/ReportActions';
import { useIncidentDetails } from './hooks/useIncidentDetails';
import { statusArabic } from './utils/statusMap';
import { formatDate } from './utils/formatDate';
import { styles } from './styles';

export default function IncidentDetailsPage() {
  const { id } = useLocalSearchParams();

  const report = MOCK_REPORTS.find(
    (item) => item.id === (Array.isArray(id) ? id[0] : id)
  );

  if (!report) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>البلاغ غير موجود</Text>
      </View>
    );
  }

  const {
    currentStatus,
    assignedResponder,
    timeline,
    handleAssignResponder,
    handleUpdateStatus,
  } = useIncidentDetails(report);

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
      <InfoCard label="الأولوية" value={report.priority } />
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