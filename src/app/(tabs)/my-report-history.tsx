import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useLayoutEffect, useMemo, useState, useEffect } from "react";
import { useAppTheme } from "@/hooks/useAppTheme"; 
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";

import Filters from "@/app/ـcomponents/report/Filters";
import ReportCard from "@/app/ـcomponents/report/ReportCard";
import { auth } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { getReportsByUser } from "@/services/reportService";
import { Report, ReportStatus } from "@/types";
import { onAuthStateChanged } from "firebase/auth";

export default function ReportsScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { colors, isDark } = useAppTheme();

    const [userId, setUserId] = useState<string | null>(null);
    const [filter, setFilter] = useState<ReportStatus | "All">("All");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserId(user?.uid || null);
        });
        return unsubscribe;
    }, []);

    const {
        data: reports = [],
        isLoading,
        isRefetching,
        refetch
    } = useQuery({
        queryKey: ['myReports', userId],
        queryFn: async () => {
            if (!userId) return [];
            const data = await getReportsByUser(userId);
            return [...data]
                .filter((r) => r.userId === userId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });

    const filteredReports = useMemo(() => {
        return reports.filter((r) =>
            filter === "All" ? true : r.status === filter,
        );
    }, [reports, filter]);

    useLayoutEffect(() => {
        navigation.setOptions({
            // تخصيص الهيدر بناءً على الثيم
            headerStyle: {
                backgroundColor: isDark ? colors.surface : colors.primary,
            },
            headerTintColor: "#fff",
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/report")} style={{ marginRight: 15 }}>
                    <Ionicons name="add-circle" size={28} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, router, isDark, colors]);

    if (isLoading && !userId) return null;

    if (isLoading && !isRefetching) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 10 }}>جاري تحميل بلاغاتك...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={filteredReports}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={refetch}
                        colors={[colors.primary]}
                        tintColor={colors.primary} // للـ iOS
                    />
                }
                renderItem={({ item }) => (
                    <ReportCard
                        report={item}
                    // الـ ReportCard يفترض أن يأخذ ثيمه داخلياً أو عبر الـ Context
                    />
                )}
                ListHeaderComponent={
                    <View style={{ paddingHorizontal: 10 }}>
                        <Text style={[styles.count, { color: colors.text }]}>
                            {reports.length} بلاغ خاص بك
                        </Text>
                        <Filters filter={filter} setFilter={setFilter} />
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Ionicons name="document-text-outline" size={50} color={colors.subText} style={{ marginBottom: 10 }} />
                        <Text style={[styles.empty, { color: colors.subText }]}>
                            {userId ? "لا يوجد بلاغات خاصة بك" : "يجب تسجيل الدخول لرؤية بلاغاتك"}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    count: { textAlign: "right", marginVertical: 15, fontWeight: "700", fontSize: 16 },
    empty: { textAlign: "center", fontSize: 16, fontWeight: "500" },
});