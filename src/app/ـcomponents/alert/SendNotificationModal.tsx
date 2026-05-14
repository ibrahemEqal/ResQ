import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getStudentTokens,
  sendPushNotification,
} from "@/services/notificationService";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const COLLEGES = [
  "كلية الهندسة وتكنولوجيا المعلومات",
  "كلية الطب وعلوم الصحة",
  "كلية الصيدلة",
  "كلية القانون",
  "كلية العلوم",
  "كلية الفنون الجميلة",
  "كلية الدراسات العليا",
  "المعهد الكوري",
  "الساحة البيضاء",
  "البيتوين",
  "ساحة النافورة",
  "المدرج المكشوف",
  "كلية الرياضة",
  "المسجد",
  "النفق",
];

export default function SendNotificationModal({ visible, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<"fire" | "electricity">("fire");

  const [location, setLocation] = useState("كلية الهندسة وتكنولوجيا المعلومات");

  const handleSend = async () => {
    try {
      setLoading(true);

      const tokens = await getStudentTokens();

      if (!tokens.length) {
        alert("No students found");
        return;
      }

      const title =
        type === "fire"
          ? "🔥 يوجد حريق في الجامعة"
          : "⚡ يوجد خطر كهرباء في الجامعة";

      const body = "اضغط لمعرفة تفاصيل الحالة";

      await sendPushNotification(tokens, title, body, type, location);

      alert("تم إرسال التنبيه بنجاح");

      onClose();
    } catch (error) {
      console.log(error);
      alert("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>إرسال تنبيه</Text>

            <Text style={styles.sectionTitle}>اختر نوع الحالة</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.option, type === "fire" && styles.active]}
                onPress={() => setType("fire")}
              >
                <Text style={styles.optionText}>🔥 حريق</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, type === "electricity" && styles.active]}
                onPress={() => setType("electricity")}
              >
                <Text style={styles.optionText}>⚡ كهرباء</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>اختر الموقع</Text>

            <View style={styles.collegesContainer}>
              {COLLEGES.map((college) => (
                <TouchableOpacity
                  key={college}
                  style={[
                    styles.collegeCard,
                    location === college && styles.activeCollege,
                  ]}
                  onPress={() => setLocation(college)}
                >
                  <Text style={styles.collegeText}>{college}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>إرسال التنبيه</Text>
              )}
            </TouchableOpacity>

            {/* إلغاء */}
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>إلغاء</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "85%",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },

  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },

  active: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
  },

  optionText: {
    fontSize: 16,
    fontWeight: "600",
  },

  collegesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },

  collegeCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },

  activeCollege: {
    backgroundColor: "#dbeafe",
    borderColor: "#2563eb",
  },

  collegeText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  cancel: {
    marginTop: 15,
    textAlign: "center",
    color: "red",
    fontWeight: "600",
  },
});
