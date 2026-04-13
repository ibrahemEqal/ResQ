import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatBoxProps {
    title: string;
    count: number;
    color: string;
    icon: string;
    trend: string;
}

export function StatBox({ title, count, color, icon, trend }: StatBoxProps) {
    return (
        <View style={[styles.statBox, { borderColor: `${color}40` }]}>
            <View style={styles.statBoxHeader}>
                <Ionicons name={icon as any} size={20} color={color} />
                <Text style={[styles.trendText, { color: trend.includes('-') ? '#00FF66' : color }]}>
                    {trend}
                </Text>
            </View>
            <Text style={[styles.statCount, { color }]}>{count}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    statBox: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 15,
    },
    statBoxHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    trendText: { fontSize: 12, fontWeight: 'bold' },
    statCount: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 4,
    },
    statTitle: { fontSize: 12, color: '#8BA3C9', fontWeight: '700' },
});