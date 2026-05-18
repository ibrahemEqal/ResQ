import { auth, db } from "@/config/firebaseConfig";
import { useAppTheme } from "@/hooks/useAppTheme";
import { getReportsByUser } from "@/services/reportService";
import { Report, ReportStatus } from "@/types";
import { useFocusEffect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Filters from "../ـcomponents/report/Filters";
import ReportsHeader from "../ـcomponents/report/HeaderReport";
import ReportCard from "../ـcomponents/report/ReportCard";

export default function MyReportHistory() {
  const { colors } = useAppTheme();

  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(() => {
    return new Promise<string | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();

        if (!user?.uid) {
          setError("يجب تسجيل الدخول أولاً");
          resolve(null);
        } else {
          resolve(user.uid);
        }
      });
    });
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const uid = await loadUser();
      if (!uid) return;

      setError(null);

      const data = await getReportsByUser(uid);
      const myReports = data.filter((r) => r.userId === uid);

      setReports(myReports);
    } catch {
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

  if (loading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          جاري التحميل...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: "#EF4444", fontWeight: "600" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        style={{ flex: 1, backgroundColor: colors.background }}
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
          <View style={styles.headerContainer}>
            <ReportsHeader />

            <View style={styles.filtersContainer}>
              <Filters filter={filter} setFilter={setFilter} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: colors.subText }}>
              لا يوجد بلاغات خاصة بك
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  headerContainer: {
    marginBottom: 10,
  },

  filtersContainer: {
    marginTop: 10,
  },
});
