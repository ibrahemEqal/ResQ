//MyReportHistory
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

import { deleteDoc, doc } from "firebase/firestore";
import Filters from "../components/report/Filters";
import ReportCard from "../components/report/ReportCard";
import { db } from "../config/firebaseConfig";
import { COLORS } from "../constants/colors";
import { getUserLocally } from "../services/authService";
import { getReportsByUser } from "../services/reportService";
import { Report, ReportStatus } from "../types";

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

  const loadUser = useCallback(async () => {
    const user = await getUserLocally();
    if (!user?.uid) {
      setError("يجب تسجيل الدخول أولاً");
      return null;
    }
    setUserId(user.uid);
    return user.uid;
  }, []);

  const loadReports = useCallback(async () => {
    const uid = await loadUser();
    if (!uid) return;

    setError(null);
    try {
      const data = await getReportsByUser(uid);

      const myReports = data.filter((r) => r.userId === uid);

      setReports(sortByNewest(myReports));
    } catch {
      setError("تعذّر تحميل البلاغات");
    }
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        await loadReports();
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
    }, [loadReports]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  }, [loadReports]);

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
