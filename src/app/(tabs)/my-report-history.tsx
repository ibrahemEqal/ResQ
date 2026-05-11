import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useLayoutEffect, useMemo, useState, useEffect } from "react";
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
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/report")}>
                    <Ionicons name="add-circle" size={28} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, router]);

    if (isLoading && !userId) return null;

    if (isLoading && !isRefetching) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>جاري تحميل بلاغاتك...</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={filteredReports}
            keyExtractor={(item) => item.id}
            refreshControl={
                <RefreshControl
                    refreshing={isRefetching}
                    onRefresh={refetch}
                    colors={[COLORS.primary]}
                />
            }
            renderItem={({ item }) => (
                <ReportCard
                    report={item}
                />
            )}
            ListHeaderComponent={
                <View>
                    <Text style={styles.count}>{reports.length} بلاغ خاص بك</Text>
                    <Filters filter={filter} setFilter={setFilter} />
                </View>
            }
            ListEmptyComponent={
                <Text style={styles.empty}>
                    {userId ? "لا يوجد بلاغات خاصة بك" : "يجب تسجيل الدخول لرؤية بلاغاتك"}
                </Text>
            }
        />
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    count: { textAlign: "right", margin: 10, fontWeight: "600" },
    empty: { textAlign: "center", marginTop: 20, color: "#999" },
});