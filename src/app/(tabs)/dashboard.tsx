import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { StatBox } from '@/app/ـcomponents/StatBox';
import { useDashboard } from '../incident/hooks/useDashboard';

export default function Dashboard() {
  const { stats, recentLogs } = useDashboard();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const totalReports = stats.critical + stats.open + stats.resolved;
  const isUrgent = stats.critical > 0;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#050B14', '#0A1428', '#050B14']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>مركز القيادة</Text>
          <Text style={styles.subTitle}>Najah Campus Security</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}>

        <View style={[styles.statusBanner, isUrgent ? styles.statusUrgent : styles.statusSafe]}>
          <View style={styles.statusHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.View style={[
                styles.pulseDot,
                isUrgent ? { backgroundColor: '#FF2A2A' } : { backgroundColor: '#00FF66' },
                { transform: [{ scale: pulseAnim }] }
              ]} />
              <Text style={[styles.statusText, isUrgent ? { color: '#FF2A2A' } : { color: '#00FF66' }]}>
                {isUrgent ? 'حالة تأهب قصوى' : 'المراقبة نشطة - الوضع مستقر'}
              </Text>
            </View>
          </View>
          <Text style={styles.statusDesc}>
            {isUrgent
              ? `تم رصد عدد (${stats.critical}) حالات حرجة تتطلب تدخلاً أمنياً فورياً.`
              : 'لا يوجد أي حالات حرجة في الحرم الجامعي في الوقت الحالي.'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox title="إجمالي البلاغات" count={totalReports} color="#00F0FF" icon="albums" trend="اليوم" />
          <StatBox title="حالات حرجة" count={stats.critical} color="#FF2A2A" icon="warning" trend={`+${stats.critical}`} />
          <StatBox title="قيد المعالجة" count={stats.open} color="#FFB800" icon="time" trend="نشط" />
          <StatBox title="تم الحل" count={stats.resolved} color="#00FF66" icon="shield-checkmark" trend={`+${stats.resolved}`} />
        </View>

        <Text style={styles.sectionTitle}>أحدث البلاغات (Live)</Text>

        {recentLogs.length > 0 ? (
          recentLogs.map((report) => (
            <View key={report.id} style={styles.logItem}>
              <View style={[styles.logIndicator, { backgroundColor: report.priority === 'High' ? '#FF2A2A' : '#FFB800' }]} />
              <View style={styles.logContent}>
                <View style={styles.logHeader}>
                  <Text style={styles.logType}>{report.type || 'بلاغ عام'}</Text>
                  <Text style={styles.logTime}>
                    {report.createdAt ? new Date(report.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                  </Text>
                </View>
                <Text style={styles.logLocation} numberOfLines={1}>
                  <Ionicons name="location-outline" size={12} color="#8BA3C9" /> {report.location || 'موقع غير محدد'}
                </Text>
              </View>
              <TouchableOpacity style={styles.actionBtn} onPress={() => router.push(`/incident/${report.id}` as any)}>
                <Text style={styles.actionBtnText}>معاينة</Text>
                <Ionicons name="chevron-back" size={12} color="#00F0FF" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyLogsContainer}>
            <Ionicons name="checkmark-circle-outline" size={40} color="#00FF66" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyLogsText}>لا توجد أي بلاغات مسجلة حديثاً.</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050B14' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0, 240, 255, 0.1)',
  },
  pageTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  subTitle: { fontSize: 12, color: '#00F0FF', fontWeight: '700', marginTop: 4, letterSpacing: 2 },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)',
  },
  reportBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },

  statusBanner: { marginTop: 20, padding: 16, borderRadius: 16, borderWidth: 1 },
  statusUrgent: { backgroundColor: 'rgba(255, 42, 42, 0.05)', borderColor: 'rgba(255, 42, 42, 0.3)' },
  statusSafe: { backgroundColor: 'rgba(0, 255, 102, 0.05)', borderColor: 'rgba(0, 255, 102, 0.2)' },
  statusHeader: { marginBottom: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  statusDesc: { color: '#8BA3C9', fontSize: 12, lineHeight: 18, fontWeight: '600' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1, marginTop: 10, marginBottom: 15 },

  logItem: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  logIndicator: { width: 4, height: '100%', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  logContent: { flex: 1, padding: 12 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  logType: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  logTime: { color: '#8BA3C9', fontSize: 11 },
  logLocation: { color: '#8BA3C9', fontSize: 12, fontWeight: '600' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: 'rgba(0, 240, 255, 0.1)', borderRadius: 8, marginRight: 12 },
  actionBtnText: { color: '#00F0FF', fontSize: 11, fontWeight: 'bold', marginRight: 4 },

  emptyLogsContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  emptyLogsText: { color: '#8BA3C9', fontSize: 13, marginTop: 10, fontWeight: '600' },
});