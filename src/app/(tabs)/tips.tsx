import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MOCK_TIPS } from '../../data/mockData';
import { initTipsDb, getTipsFromDb } from '@/services/tipsDb';
import { useAppTheme } from "@/hooks/useAppTheme";

const { width } = Dimensions.get('window');
const CATEGORIES = ['الكل', 'Fire', 'Fainting', 'Security', 'Electrical'];

export default function Tips() {
    const { colors, isDark } = useAppTheme();
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [tips, setTips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        const loadOfflineData = async () => {
            try {
                await initTipsDb(MOCK_TIPS);
                const data = await getTipsFromDb();
                setTips(data);
            } catch (error) {
                console.error("SQLite Error:", error);
                setTips(MOCK_TIPS);
            } finally {
                setLoading(false);
            }
        };

        loadOfflineData();

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
        ]).start();
    }, []);

    const handleCategoryPress = (cat: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveCategory(cat);
    };

    const getCategoryConfig = (category: string) => {
        switch (category.toLowerCase()) {
            case 'fire': return { icon: 'flame', colors: ['#FF4B2B', '#FF416C'] };
            case 'fainting': return { icon: 'medical', colors: ['#00B4DB', '#0083B0'] };
            case 'security': return { icon: 'shield-half', colors: ['#8E2DE2', '#4A00E0'] };
            default: return { icon: 'alert-circle', colors: ['#F7971E', '#FFD200'] };
        }
    };

    const filteredTips = activeCategory === 'الكل'
        ? tips
        : tips.filter(tip => tip.category.toLowerCase() === activeCategory.toLowerCase());

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* التدرج اللوني يتغير بناءً على الثيم */}
            <LinearGradient
                colors={isDark ? ['#0F172A', '#020617'] : ['#F8F9FA', '#E2E8F0']}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                <View style={styles.header}>
                    <Text style={[styles.pageTitle, { color: colors.text }]}>بروتوكول الطوارئ</Text>
                    <Text style={[styles.pageSubtitle, { color: colors.subText }]}>دليل الاستجابة السريعة (S.R.G)</Text>
                </View>

                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {CATEGORIES.map((cat, index) => {
                            const isActive = activeCategory === cat;
                            return (
                                <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => handleCategoryPress(cat)}>
                                    <View style={[
                                        styles.filterPill,
                                        { backgroundColor: isActive ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') },
                                        isActive && styles.filterPillActive
                                    ]}>
                                        <Text style={[
                                            styles.filterText,
                                            { color: isActive ? '#FFF' : colors.subText }
                                        ]}>{cat}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
                    {filteredTips.map((tip) => {
                        const config = getCategoryConfig(tip.category);
                        return (
                            <View
                                style={[
                                    styles.glassCard,
                                    { backgroundColor: colors.surface, borderColor: colors.border }
                                ]}
                                key={tip.id}
                            >
                                <LinearGradient colors={config.colors as any} style={styles.glowLine} />
                                <View style={styles.cardHeader}>
                                    <LinearGradient colors={config.colors as any} style={styles.iconWrapper} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                        <Ionicons name={config.icon as any} size={24} color="#FFF" />
                                    </LinearGradient>
                                    <View style={styles.titleWrapper}>
                                        <Text style={[styles.cardTitle, { color: colors.text }]}>{tip.title}</Text>
                                        <Text style={[styles.cardCategory, { color: colors.subText }]}>{tip.category} Protocol</Text>
                                    </View>
                                </View>

                                <View style={styles.actionBlock}>
                                    <View style={styles.blockTitleRow}>
                                        <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
                                        <Text style={[styles.blockTitle, { color: '#10B981' }]}>الإجراءات الفورية</Text>
                                    </View>
                                    {tip.do.map((item: string, idx: number) => (
                                        <View key={idx} style={styles.listItem}>
                                            <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
                                            <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={[styles.actionBlock, styles.dangerBlock, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }]}>
                                    <View style={styles.blockTitleRow}>
                                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                                        <Text style={[styles.blockTitle, { color: '#EF4444' }]}>لا تفعل !</Text>
                                    </View>
                                    {tip.dont.map((item: string, idx: number) => (
                                        <View key={idx} style={styles.listItem}>
                                            <View style={[styles.bullet, { backgroundColor: '#EF4444', borderRadius: 0, transform: [{ rotate: '45deg' }] }]} />
                                            <Text style={[styles.listText, { color: isDark ? '#FEE2E2' : '#7F1D1D' }]}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ height: 60 }} />
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    pageTitle: { fontSize: 32, fontWeight: '900', letterSpacing: 1, textAlign: 'right' },
    pageSubtitle: { fontSize: 14, fontWeight: '700', marginTop: 4, letterSpacing: 2, textAlign: 'right' },
    filterContainer: { marginBottom: 20 },
    filterScroll: { paddingHorizontal: 20, gap: 10, flexDirection: 'row-reverse' },
    filterPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
    filterPillActive: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    filterText: { fontWeight: '700', fontSize: 15 },
    cardsContainer: { paddingHorizontal: 20, width: '100%', maxWidth: 500, alignSelf: 'center' },
    glassCard: { borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    glowLine: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 4 },
    cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 24 },
    iconWrapper: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    titleWrapper: { marginRight: 16, flex: 1 },
    cardTitle: { fontSize: 22, fontWeight: '900', marginBottom: 4, textAlign: 'right' },
    cardCategory: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' },
    actionBlock: { marginBottom: 16 },
    dangerBlock: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)' },
    blockTitleRow: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 12 },
    blockTitle: { fontSize: 16, fontWeight: 'bold', marginRight: 8, letterSpacing: 0.5 },
    listItem: { flexDirection: 'row-reverse', alignItems: 'flex-start', marginBottom: 12 },
    bullet: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginLeft: 12 },
    listText: { fontSize: 15, fontWeight: '600', lineHeight: 24, flex: 1, textAlign: 'right' }
});