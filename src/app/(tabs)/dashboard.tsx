import { StatBox } from "@/app/ـcomponents/StatBox";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useDashboard } from "../incident/hooks/useDashboard";
import SendNotificationModal from "../ـcomponents/alert/SendNotificationModal";

export default function Dashboard() {
  const { stats, recentLogs } = useDashboard();

  const [modalVisible, setModalVisible] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const totalReports = stats.critical + stats.open + stats.resolved;
  const isUrgent = stats.critical > 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#050B14", "#0A1428", "#050B14"]}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>مركز القيادة</Text>
          <Text style={styles.subTitle}>Najah Campus Security</Text>
        </View>

        {/* 🔔 BUTTON */}
        <TouchableOpacity
          style={styles.alertBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="megaphone" size={16} color="#fff" />
          <Text style={styles.alertText}>Send Alert</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
      >
        {/* STATUS */}
        <View
          style={[
            styles.statusBanner,
            isUrgent ? styles.statusUrgent : styles.statusSafe,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Animated.View
              style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]}
            />
            <Text style={styles.statusText}>
              {isUrgent ? "حالة تأهب قصوى" : "المراقبة نشطة"}
            </Text>
          </View>

          <Text style={styles.statusDesc}>
            {isUrgent
              ? `يوجد ${stats.critical} بلاغات حرجة`
              : "الوضع مستقر حالياً"}
          </Text>
        </View>

        {/* STATS */}
        <View style={styles.statsGrid}>
          <StatBox
            title="إجمالي"
            count={totalReports}
            color="#00F0FF"
            icon="albums"
            trend={""}
          />
          <StatBox
            title="حرجة"
            count={stats.critical}
            color="#FF2A2A"
            icon="warning"
            trend={""}
          />
          <StatBox
            title="قيد المعالجة"
            count={stats.open}
            color="#FFB800"
            icon="time"
            trend={""}
          />
          <StatBox
            title="تم الحل"
            count={stats.resolved}
            color="#00FF66"
            icon="checkmark"
            trend={""}
          />
        </View>

        {/* LOGS */}
        <Text style={styles.sectionTitle}>أحدث البلاغات</Text>

        {recentLogs.map((report) => (
          <View key={report.id} style={styles.logItem}>
            <View style={styles.logContent}>
              <Text style={styles.logType}>{report.type}</Text>
              <Text style={styles.logLocation}>{report.location}</Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push(`/incident/${report.id}` as any)}
            >
              <Text style={{ color: "#00F0FF" }}>عرض</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 🔥 MODAL */}
      <SendNotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050B14" },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
  },
  alertText: { color: "#FFF", fontSize: 12, fontWeight: "bold", marginLeft: 6 },

  pageTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },

  subTitle: {
    color: "#00F0FF",
    marginBottom: 10,
  },

  statusBanner: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },

  statusUrgent: {
    backgroundColor: "rgba(255,0,0,0.1)",
  },

  statusSafe: {
    backgroundColor: "rgba(0,255,0,0.05)",
  },

  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF2A2A",
    marginRight: 8,
  },

  statusText: {
    color: "#fff",
    fontWeight: "700",
  },

  statusDesc: {
    color: "#aaa",
    marginTop: 5,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },

  sectionTitle: {
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "700",
  },

  logItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: 10,
    borderRadius: 10,
  },

  logContent: {},
  logType: { color: "#fff" },
  logLocation: { color: "#aaa", fontSize: 12 },
});
