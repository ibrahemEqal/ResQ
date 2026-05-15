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

const PRIMARY = "#FF3B30";

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
                <Text
                  style={[
                    styles.optionText,
                    type === "fire" && styles.activeText,
                  ]}
                >
                  حريق
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, type === "electricity" && styles.active]}
                onPress={() => setType("electricity")}
              >
                <Text
                  style={[
                    styles.optionText,
                    type === "electricity" && styles.activeText,
                  ]}
                >
                  كهرباء
                </Text>
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
                  <Text
                    style={[
                      styles.collegeText,
                      location === college && styles.activeCollegeText,
                    ]}
                  >
                    {college}
                  </Text>
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
    padding: 16,
  },

  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
    color: PRIMARY,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 8,
    color: "#222",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },

  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  active: {
    backgroundColor: "#ffe5e3",
    borderColor: PRIMARY,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },

  activeText: {
    color: PRIMARY,
  },

  collegesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 14,
  },

  collegeCard: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  activeCollege: {
    backgroundColor: "#ffe5e3",
    borderColor: PRIMARY,
  },

  collegeText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
  },

  activeCollegeText: {
    color: PRIMARY,
    fontWeight: "700",
  },

  button: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },

  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  cancel: {
    marginTop: 12,
    textAlign: "center",
    color: PRIMARY,
    fontWeight: "600",
    fontSize: 14,
  },
});
