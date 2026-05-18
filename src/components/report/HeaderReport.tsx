import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReportsHeader() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            سجل بلاغاتي
          </Text>

          <Text style={[styles.subtitle, { color: colors.subText }]}>
            تابع جميع البلاغات الخاصة بك
          </Text>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity
          onPress={() => router.push("/report")}
          style={[styles.iconButton, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 40,
    marginBottom: 10,
  },

  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },

  textContainer: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "right",
  },

  subtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
});
