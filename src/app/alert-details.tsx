import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const COLORS = {
  primary: "#dc2626",
  primaryLight: "#fecaca",
  secondary: "#991b1b",

  background: "#ffffff",
  surface: "#f3f4f6",

  textPrimary: "#111111",
  textSecondary: "#555555",

  success: "#22c55e",
  warning: "#ff4d4d",
  border: "#e5e5e5",
};

export default function AlertDetails() {
  const { type, location } = useLocalSearchParams();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [read, setRead] = useState(false);

  const typeValue = Array.isArray(type) ? type[0] : type;
  const locationValue = Array.isArray(location) ? location[0] : location;

  const isFire = typeValue === "حريق";

  const emergencyActions = isFire
    ? [
        "ابتعد فورًا عن مصدر الحريق",
        "اتصل بالدفاع المدني",
        "لا تستخدم المصعد",
        "قم بتنبيه الموجودين فورًا",
      ]
    : [
        "ابتعد عن مصدر الكهرباء",
        "لا تلمس الأسلاك المكشوفة",
        "افصل الكهرباء إن أمكن",
        "اتصل بالطوارئ فورًا",
      ];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleConfirm = () => {
    Vibration.vibrate([100, 200, 100]);
    setRead(true);

    Alert.alert("تم التأكيد", "تم تسجيل الاطلاع على التنبيه", [
      {
        text: "إغلاق",
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.Text
          style={[
            styles.title,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          Emergency Alert
        </Animated.Text>

        <Text style={styles.subtitle}>اضغط على الزر لتأكيد الاطلاع</Text>

        <View style={styles.center}>
          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => [
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <View style={styles.sosButton}>
              <Ionicons
                name={read ? "checkmark-done" : "shield-checkmark"}
                size={50}
                color="#fff"
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="alert-circle" size={20} color={COLORS.primary} />
            <Text style={styles.text}>{typeValue || "غير محدد"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Ionicons name="location" size={20} color={COLORS.success} />
            <Text style={styles.text}>{locationValue || "غير محدد"}</Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>إجراءات السلامة</Text>

          {emergencyActions.map((item, i) => (
            <View key={i} style={styles.actionRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.success}
              />
              <Text style={styles.actionText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* FOOTER */}
        {read && (
          <View style={styles.footer}>
            <Ionicons
              name="checkmark-done-circle"
              size={24}
              color={COLORS.success}
            />
            <Text style={styles.footerText}>تم الاطلاع على التنبيه</Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  safe: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    color: COLORS.primary,
    marginTop: 10,
  },

  subtitle: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 6,
  },

  center: {
    alignItems: "center",
    marginVertical: 30,
  },

  sosButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
    borderColor: COLORS.border,
  },

  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },

  text: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    color: COLORS.textPrimary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "right",
    color: COLORS.primary,
  },

  actionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  actionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "right",
  },

  footer: {
    marginTop: 30,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#ecfdf5",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.success,
    gap: 8,
  },

  footerText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
});
