import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";

import { Report, ReportStatus } from "../types";
import { getReportsByUser } from "../services/reportService";

import Filters from "../components/report/Filters";
import ReportCard from "../components/report/ReportCard";

//  مؤقت (بدل auth)
const CURRENT_USER_ID = "USER-123";

export default function MyReportHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportStatus | "All">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const data = await getReportsByUser(CURRENT_USER_ID);
      setReports(data);
      setError(null);
    } catch {
      setError("فشل في جلب التقارير");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports
      .filter((r) => (filter === "All" ? true : r.status === filter))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [reports, filter]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
    

      <Filters filter={filter} setFilter={setFilter} />

      {filteredReports.length === 0 ? (
        <Text style={styles.empty}>لا يوجد بلاغات</Text>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReportCard report={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f3f4f6",
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  error: {
    color: "red",
    fontSize: 16,
  },

  empty: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 20,
  },
});