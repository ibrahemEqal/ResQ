import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { ResponderPickerModal } from './ResponderPickerModal';
import { auth, db } from '@/config/firebaseConfig'; 
import { doc, getDoc } from 'firebase/firestore';

import { InfoCard } from '@/app/ـcomponents/InfoCard';
import { IncidentAudioPlayer } from './IncidentAudioPlayer';
import { ReportActions } from '@/app/ـcomponents/ReportActions';
import { TimelineSection } from '@/app/ـcomponents/TimelineSection';
import { useIncidentDetails } from './hooks/useIncidentDetails';
import { styles } from './styles';
import { formatDate } from './utils/formatDate';
import { statusArabic } from './utils/statusMap';

export default function IncidentDetailsPage() {
  const { id } = useLocalSearchParams();
  const [userRole, setUserRole] = useState<string>('student');
  const [isResponderModalVisible, setIsResponderModalVisible] = useState(false);

  const {
    report,
    currentStatus,
    assignedResponder,
    timeline,
    handleAssignResponder,
    handleUpdateStatus,
    loading,
  } = useIncidentDetails(id);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'student');
        }
      }
    };
    fetchUserRole();
  }, []);

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

      {report.imageUrl ? (
        <View style={styles.card}>
          <Text style={styles.label}>صورة البلاغ</Text>
          <Image
            source={{ uri: report.imageUrl }}
            style={styles.reportImage}
            contentFit="contain"
            accessibilityLabel="صورة مرفقة مع البلاغ"
          />
          <Pressable
            onPress={() => Linking.openURL(report.imageUrl!)}
            accessibilityRole="link"
          >
            <Text style={styles.reportImageLink}>فتح الرابط في المتصفح</Text>
          </Pressable>
        </View>
      ) : (
        <InfoCard label="الصورة" value="لا يوجد صورة" isMuted />
      )}

      {report.audioUrl ? (
        <View style={styles.card}>
          <Text style={styles.label}>التسجيل الصوتي</Text>
          <IncidentAudioPlayer audioUrl={report.audioUrl} />
          <Pressable
            onPress={() => Linking.openURL(report.audioUrl!)}
            accessibilityRole="link"
          >
            <Text style={styles.reportImageLink}>فتح الرابط في المتصفح</Text>
          </Pressable>
        </View>
      ) : (
        <InfoCard label="التسجيل الصوتي" value="لا يوجد تسجيل" isMuted />
      )}

      <TimelineSection timeline={timeline} />

      {(userRole === 'admin' || userRole === 'responder') && (
        <ReportActions
          onAssignResponder={() => setIsResponderModalVisible(true)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      <ResponderPickerModal
        visible={isResponderModalVisible}
        onClose={() => setIsResponderModalVisible(false)}
        onSelect={(uid, fullName) => {
          handleAssignResponder(uid, fullName);
          setIsResponderModalVisible(false);
        }}
      />
    </ScrollView>
  );
}