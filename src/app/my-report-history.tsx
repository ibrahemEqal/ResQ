// MyReportHistory
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

export default function ReportsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    const user = await getUserLocally();
    if (!user?.uid) {
      setError("يجب تسجيل الدخول أولاً");
      return null;
    }
    return user.uid;
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const uid = await loadUser();
      if (!uid) return;

      setError(null);

      const data = await getReportsByUser(uid);

      const myReports = data.filter((r) => r.userId === uid);

      setReports(myReports);
    } catch (e) {
      setError("تعذّر تحميل البلاغات");
    }
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        setLoading(true);
        await loadReports();
        if (active) setLoading(false);
      })();

      return () => {
        active = false;
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
    try {
      await deleteDoc(doc(db, "reports", id));
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.log("Delete error:", e);
    }
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
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredReports}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ReportCard report={item} onDelete={handleDelete} />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={[
        styles.listContainer,
        filteredReports.length === 0 && { flex: 1 },
      ]}
      ListHeaderComponent={
        <View style={styles.header}>
          <Filters filter={filter} setFilter={setFilter} />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.empty}>لا يوجد بلاغات خاصة بك</Text>
        </View>
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

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 10,
  },

  count: {
    textAlign: "right",
    marginBottom: 10,
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
  },

  errorText: {
    color: "red",
  },
});
