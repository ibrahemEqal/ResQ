import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MOCK_REPORTS_SUMMARY } from '../data/mockData';

const { width } = Dimensions.get('window');

export default function Dashboard() {
    const { open, critical, resolved, recent } = MOCK_REPORTS_SUMMARY;

    const radarAnim1 = useRef(new Animated.Value(0)).current;
    const radarAnim2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createRadarWave = (anim: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, { toValue: 1, duration: 3000, easing: Easing.out(Easing.cubic), useNativeDriver: true })
                ])
            );
        };
        createRadarWave(radarAnim1, 0).start();
        createRadarWave(radarAnim2, 1500).start();
    }, []);

    const chartData = [4, 7, 2, 9, 3, 5, critical + open];
    const maxChartValue = Math.max(...chartData);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#050B14', '#0A1428', '#050B14']} style={StyleSheet.absoluteFill} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.pageTitle}>مركز القيادة</Text>
                    <Text style={styles.subTitle}>Najah Campus Security</Text>
                </View>
                <TouchableOpacity style={styles.reportBtn}>
                    <Ionicons name="document-text" size={16} color="#FFF" />
                    <Text style={styles.reportBtnText}>تصدير تقرير</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}>

                {/* Campus Live Radar Section */}
                <BlurView intensity={20} tint="dark" style={styles.radarCard}>
                    <View style={styles.radarHeader}>
                        <Text style={styles.sectionTitle}>الرادار المباشر</Text>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>مسح نشط</Text>
                        </View>
                    </View>

                    <View style={styles.radarContainer}>
                        <Animated.View style={[styles.radarWave, {
                            transform: [{ scale: radarAnim1.interpolate({ inputRange: [0, 1], outputRange: [0.2, 2] }) }],
                            opacity: radarAnim1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.3, 0] })
                        }]} />
                        <Animated.View style={[styles.radarWave, {
                            transform: [{ scale: radarAnim2.interpolate({ inputRange: [0, 1], outputRange: [0.2, 2] }) }],
                            opacity: radarAnim2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.3, 0] })
                        }]} />

                        <View style={styles.radarCenter}>
                            <Ionicons name="location" size={24} color="#00F0FF" />
                        </View>

                        {critical > 0 && (
                            <View style={[styles.radarTarget, { top: 30, right: 50 }]}>
                                <View style={styles.targetDot} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.radarStatusText}>تم اكتشاف {critical} حالات حرجة في نطاق الجامعة</Text>
                </BlurView>

                <View style={styles.statsGrid}>
                    <StatBox title="حالات حرجة" count={critical} color="#FF2A2A" icon="warning" trend="+2" />
                    <StatBox title="قيد المعالجة" count={open} color="#FFB800" icon="time" trend="-1" />
                    <StatBox title="تم الحل" count={resolved} color="#00FF66" icon="shield-checkmark" trend="+14" />
                    <StatBox title="فرق الاستجابة" count={4} color="#00F0FF" icon="people" trend="نشط" />
                </View>

                <BlurView intensity={20} tint="dark" style={styles.chartCard}>
                    <Text style={styles.sectionTitle}>معدل البلاغات (آخر 7 أيام)</Text>
                    <View style={styles.chartContainer}>
                        {chartData.map((val, index) => {
                            const heightPercent = (val / maxChartValue) * 100;
                            const isToday = index === chartData.length - 1;
                            return (
                                <View key={index} style={styles.chartBarWrapper}>
                                    <View style={styles.chartBarBg}>
                                        <LinearGradient
                                            colors={isToday ? ['#FF2A2A', '#990000'] : ['#00F0FF', '#0055FF']}
                                            style={[styles.chartBarFill, { height: `${heightPercent}%` }]}
                                        />
                                    </View>
                                    <Text style={[styles.chartLabel, isToday && { color: '#FF2A2A', fontWeight: 'bold' }]}>
                                        {isToday ? 'اليوم' : `ي-${index + 1}`}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </BlurView>

                {/* Action Log / Recent Alerts */}
                <Text style={[styles.sectionTitle, { marginTop: 10, marginBottom: 15 }]}>سجل العمليات المباشر</Text>
                {recent.map((report) => (
                    <View key={report.id} style={styles.logItem}>
                        <View style={[styles.logIndicator, { backgroundColor: report.status === 'Critical' ? '#FF2A2A' : '#FFB800' }]} />
                        <View style={styles.logContent}>
                            <View style={styles.logHeader}>
                                <Text style={styles.logType}>[ {report.type.toUpperCase()} ]</Text>
                                <Text style={styles.logTime}>{report.time}</Text>
                            </View>
                            <Text style={styles.logLocation}>{report.location}</Text>
                        </View>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Text style={styles.actionBtnText}>تفاصيل</Text>
                        </TouchableOpacity>
                    </View>
                ))}

            </ScrollView>
        </View>
    );
}

const StatBox = ({ title, count, color, icon, trend }: any) => (
    <View style={[styles.statBox, { borderColor: `${color}40` }]}>
        <View style={styles.statBoxHeader}>
            <Ionicons name={icon} size={20} color={color} />
            <Text style={[styles.trendText, { color: trend.includes('-') ? '#00FF66' : color }]}>{trend}</Text>
        </View>
        <Text style={[styles.statCount, { color }]}>{count}</Text>
        <Text style={styles.statTitle}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050B14' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 240, 255, 0.1)' },
    pageTitle: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
    subTitle: { fontSize: 12, color: '#00F0FF', fontWeight: '700', marginTop: 4, letterSpacing: 2, textTransform: 'uppercase' },
    reportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0, 240, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.3)' },
    reportBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 6 },

    sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },

    /* Radar Section */
    radarCard: { marginTop: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.15)', overflow: 'hidden' },
    radarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 42, 42, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 42, 42, 0.3)' },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF2A2A', marginRight: 6 },
    liveText: { color: '#FF2A2A', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    radarContainer: { height: 160, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: 'rgba(0, 240, 255, 0.02)', borderRadius: 80, borderWidth: 1, borderColor: 'rgba(0, 240, 255, 0.1)' },
    radarWave: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#00F0FF', backgroundColor: 'rgba(0, 240, 255, 0.1)' },
    radarCenter: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 240, 255, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#00F0FF', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
    radarTarget: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255, 42, 42, 0.3)', justifyContent: 'center', alignItems: 'center' },
    targetDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF2A2A', shadowColor: '#FF2A2A', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8 },
    radarStatusText: { color: '#8BA3C9', fontSize: 12, textAlign: 'center', marginTop: 15, fontWeight: '600' },

    /* Stats Grid */
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
    statBox: { width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 15 },
    statBoxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    trendText: { fontSize: 12, fontWeight: 'bold' },
    statCount: { fontSize: 28, fontWeight: '900', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    statTitle: { fontSize: 12, color: '#8BA3C9', fontWeight: '700' },

    /* Chart Section */
    chartCard: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 20 },
    chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, marginTop: 20, paddingHorizontal: 10 },
    chartBarWrapper: { alignItems: 'center', width: 30 },
    chartBarBg: { width: 12, height: 90, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
    chartBarFill: { width: '100%', borderRadius: 6 },
    chartLabel: { color: '#8BA3C9', fontSize: 10, marginTop: 8, fontWeight: '600' },

    /* Action Log */
    logItem: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
    logIndicator: { width: 4, height: '100%', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
    logContent: { flex: 1, padding: 12 },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    logType: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    logTime: { color: '#8BA3C9', fontSize: 11 },
    logLocation: { color: '#8BA3C9', fontSize: 12, fontWeight: '600' },
    actionBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, marginRight: 12 },
    actionBtnText: { color: '#00F0FF', fontSize: 11, fontWeight: 'bold' }
});