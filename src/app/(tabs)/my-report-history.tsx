import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import Filters from "@/app/ـcomponents/report/Filters";
import ReportCard from "@/app/ـcomponents/report/ReportCard";
import { auth, db } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { getReportsByUser } from "@/services/reportService";
import { Report, ReportStatus } from "@/types";
import { onAuthStateChanged } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";

function sortByNewest(list: Report[]): Report[] {
    return [...list].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
}

export default function ReportsScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const [reports, setReports] = useState<Report[]>([]);
    const [filter, setFilter] = useState<ReportStatus | "All">("All");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [userId, setUserId] = useState<string | null>(null);

    const fetchReports = async (uid: string) => {
        try {
            const data = await getReportsByUser(uid);
            const myReports = data.filter((r) => r.userId === uid);
            setReports(sortByNewest(myReports));
        } catch {
            setError("تعذّر تحميل البلاغات");
        }
    };

    useFocusEffect(
        useCallback(() => {
            let cancelled = false;
            setLoading(true);

            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (cancelled) return;

                if (user && user.uid) {
                    setUserId(user.uid);
                    setError(null);
                    await fetchReports(user.uid);
                } else {
                    setError("يجب تسجيل الدخول أولاً");
                    setUserId(null);
                    setReports([]);
                }

                if (!cancelled) setLoading(false);
            });

            return () => {
                cancelled = true;
                unsubscribe();
            };
        }, [])
    );

    const onRefresh = useCallback(async () => {
        if (!userId) return;
        setRefreshing(true);
        await fetchReports(userId);
        setRefreshing(false);
    }, [userId]);

    const filteredReports = useMemo(() => {
        return reports.filter((r) =>
            filter === "All" ? true : r.status === filter,
        );
    }, [reports, filter]);

    const handleDelete = async (id: string) => {
        await deleteDoc(doc(db, "reports", id));
        setReports((prev) => prev.filter((r) => r.id !== id));
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push("/report")}>
                    <Ionicons name="add-circle" size={28} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, router]);

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text>جاري التحميل...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={filteredReports}
            keyExtractor={(item) => item.id}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
                <ReportCard report={item} onDelete={handleDelete} />
            )}
            ListHeaderComponent={
                <View>
                    <Text style={styles.count}>{reports.length} بلاغ خاص بك</Text>
                    <Filters filter={filter} setFilter={setFilter} />
                </View>
            }
            ListEmptyComponent={
                <Text style={styles.empty}>لا يوجد بلاغات خاصة بك</Text>
            }
        />
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    count: {
        textAlign: "right",
        margin: 10,
        fontWeight: "600",
    },
    empty: {
        textAlign: "center",
        marginTop: 20,
        color: "#999",
    },
});