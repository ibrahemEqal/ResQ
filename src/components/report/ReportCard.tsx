import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import {
  Alert,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Report } from "../../types";

export default function ReportCard({
  report,
  onDelete,
}: {
  report: Report;
  onDelete?: (id: string) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "Open":
        return "مفتوح";
      case "In Progress":
        return "قيد المعالجة";
      case "Resolved":
        return "مكتمل";
      case "Critical":
        return "حرج";
      default:
        return status;
    }
  };

  const handleDelete = () => {
    Alert.alert("تأكيد الحذف", "هل أنت متأكد من حذف البلاغ؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => onDelete?.(report.id),
      },
    ]);
  };

  const renderLeftActions = () => (
    <Pressable onPress={handleDelete} style={styles.deleteButton}>
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={styles.deleteText}>حذف</Text>
    </Pressable>
  );

  return (
    <Swipeable renderLeftActions={renderLeftActions} overshootLeft={false}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={() => router.push(`/incident/${report.id}`)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.card}
        >
          <View style={[styles.sideBar, { backgroundColor: "#C62828" }]} />

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.typeContainer}>
                <View
                  style={[styles.iconContainer, { backgroundColor: "#FFEBEE" }]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#C62828"
                  />
                </View>

                <Text style={[styles.title, { color: "#C62828" }]}>
                  تقرير {report.type}
                </Text>
              </View>

              <Text
                style={[
                  styles.status,
                  { backgroundColor: "#FFEBEE", color: "#C62828" },
                ]}
              >
                {getStatusText(report.status)}
              </Text>
            </View>

            {/* Date */}
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text style={styles.text}>
                {new Date(report.createdAt).toLocaleDateString("ar-EG")}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.row}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.text}>{report.location}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row-reverse",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    marginBottom: 14,
    shadowColor: "#1D3557",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  sideBar: {
    width: 5,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  content: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  status: {
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginTop: 4,
  },
  text: {
    marginRight: 6,
    fontSize: 13,
    color: "#6B7280",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 18,
    marginBottom: 14,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
});
