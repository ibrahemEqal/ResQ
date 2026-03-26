import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { MOCK_TIPS } from '../data/mockData';

const { width } = Dimensions.get('window');

const CATEGORIES = ['الكل', 'Fire', 'Fainting', 'Security', 'Electrical'];

export default function Tips() {
    const [activeCategory, setActiveCategory] = useState('الكل');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
        ]).start();
    }, []);

    const filteredTips = activeCategory === 'الكل'
        ? MOCK_TIPS
        : MOCK_TIPS.filter(tip => tip.category.toLowerCase() === activeCategory.toLowerCase());

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

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0F172A', '#1E293B', '#020617']} style={StyleSheet.absoluteFill} />

            <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>بروتوكول الطوارئ</Text>
                    <Text style={styles.pageSubtitle}>دليل الاستجابة السريعة (S.R.G)</Text>
                </View>

                {/* Interactive Categories Filter */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {CATEGORIES.map((cat, index) => {
                            const isActive = activeCategory === cat;
                            return (
                                <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => handleCategoryPress(cat)}>
                                    <BlurView intensity={isActive ? 40 : 10} tint={isActive ? "light" : "dark"} style={[styles.filterPill, isActive && styles.filterPillActive]}>
                                        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{cat}</Text>
                                    </BlurView>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Tips Cards */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.cardsContainer}>
                    {filteredTips.map((tip, index) => {
                        const config = getCategoryConfig(tip.category);
                        return (
                            <BlurView intensity={25} tint="dark" style={styles.glassCard} key={tip.id}>

                                <LinearGradient colors={config.colors as any} style={styles.glowLine} />

                                {/* Card Header */}
                                <View style={styles.cardHeader}>
                                    <LinearGradient colors={config.colors as any} style={styles.iconWrapper} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                                        <Ionicons name={config.icon as any} size={24} color="#FFF" />
                                    </LinearGradient>
                                    <View style={styles.titleWrapper}>
                                        <Text style={styles.cardTitle}>{tip.title}</Text>
                                        <Text style={styles.cardCategory}>{tip.category} Protocol</Text>
                                    </View>
                                </View>

                                <View style={styles.actionBlock}>
                                    <View style={styles.blockTitleRow}>
                                        <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
                                        <Text style={[styles.blockTitle, { color: '#10B981' }]}>الإجراءات الفورية</Text>
                                    </View>
                                    {tip.do.map((item, idx) => (
                                        <View key={idx} style={styles.listItem}>
                                            <View style={[styles.bullet, { backgroundColor: '#10B981', shadowColor: '#10B981' }]} />
                                            <Text style={styles.listText}>{item}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={[styles.actionBlock, styles.dangerBlock]}>
                                    <View style={styles.blockTitleRow}>
                                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                                        <Text style={[styles.blockTitle, { color: '#EF4444' }]}>محاذير شديدة</Text>
                                    </View>
                                    {tip.dont.map((item, idx) => (
                                        <View key={idx} style={styles.listItem}>
                                            <View style={[styles.bullet, { backgroundColor: '#EF4444', shadowColor: '#EF4444', borderRadius: 0, transform: [{ rotate: '45deg' }] }]} />
                                            <Text style={[styles.listText, { color: '#FEE2E2' }]}>{item}</Text>
                                        </View>
                                    ))}
                                </View>

                            </BlurView>
                        );
                    })}
                    <View style={{ height: 60 }} />
                </ScrollView>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20 },
    pageTitle: { fontSize: 32, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },
    pageSubtitle: { fontSize: 14, color: '#94A3B8', fontWeight: '700', marginTop: 4, letterSpacing: 2 },

    filterContainer: { marginBottom: 20 },
    filterScroll: { paddingHorizontal: 20, gap: 10 },
    filterPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
    filterPillActive: { borderColor: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.1)' },
    filterText: { color: '#94A3B8', fontWeight: '700', fontSize: 15 },
    filterTextActive: { color: '#FFF', fontWeight: '900' },

    cardsContainer: { paddingHorizontal: 20, width: '100%', maxWidth: 500, alignSelf: 'center' },
    glassCard: { borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
    glowLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },

    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    iconWrapper: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#FFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    titleWrapper: { marginLeft: 16, flex: 1 },
    cardTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', marginBottom: 4 },
    cardCategory: { fontSize: 12, color: '#94A3B8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },

    actionBlock: { marginBottom: 16 },
    dangerBlock: { backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)' },
    blockTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    blockTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, letterSpacing: 0.5 },

    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingRight: 10 },
    bullet: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6 },
    listText: { fontSize: 15, color: '#E2E8F0', fontWeight: '600', lineHeight: 24, flex: 1 }
});