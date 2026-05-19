import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  I18nManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

export default function AlertDetails() {
  const { type, location } = useLocalSearchParams();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const typeValue = Array.isArray(type) ? type[0] : type;
  const locationValue = Array.isArray(location) ? location[0] : location;

  const isFire = typeValue === "حريق";

  const iconName = isFire ? "flame" : "warning";

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleSeen = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Emergency Alert</Text>
        <Text style={styles.subtitle}>{typeValue || "غير محدد"}</Text>

        <View style={styles.center}>
          <Animated.View
            style={[styles.circle, { transform: [{ scale: pulseAnim }] }]}
          >
            <Ionicons name={iconName} size={80} color="#fff" />
          </Animated.View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="location" size={18} color="#dc2626" />
            <Text style={styles.text}>{locationValue || "غير محدد"}</Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="radio-button-on" size={18} color="#dc2626" />
            <Text style={styles.text}>{typeValue || "غير محدد"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>إجراءات السلامة</Text>

          {(isFire
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
              ]
          ).map((item, i) => (
            <View key={i} style={styles.actionRow}>
              <Ionicons name="checkmark-circle" size={16} color="#dc2626" />
              <Text style={styles.actionText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.button} onPress={handleSeen}>
          <Text style={styles.buttonText}>تم الاطلاع عليها</Text>
          <Ionicons name="checkmark-done" size={20} color="#fff" />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  safe: {
    flex: 1,
    padding: 20,
    alignItems: "flex-end",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    width: "100%",
  },

  subtitle: {
    textAlign: "center",
    width: "100%",
    marginTop: 6,
  },

  center: {
    alignItems: "center",
    marginVertical: 30,
    width: "100%",
  },

  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: "100%",
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f3f3f3",
  },

  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 6,
  },

  text: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    marginBottom: 10,
  },

  actionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 6,
  },

  actionText: {
    fontSize: 14,
    textAlign: "right",
  },

  button: {
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
});
