import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ReportsHeader() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>سجل بلاغاتي</Text>
        </View>

        {/* ADD BUTTON */}
        <TouchableOpacity
          onPress={() => router.push("/report")}
          style={styles.iconButton}
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
    paddingHorizontal: 20,
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
    color: COLORS.textPrimary,
    textAlign: "right",
  },

  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: "right",
    marginTop: 2,
  },

  iconButton: {
    backgroundColor: COLORS.primary,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
});
