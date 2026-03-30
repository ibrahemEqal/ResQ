import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { COLORS } from "../constants/colors";

interface Props {
  location: string | null;
  loading: boolean;
  onPress: () => void;
}

export default function LocationButton({ location, loading, onPress }: Props) {
  const isSet = location !== null;

  return (
    <TouchableOpacity
      style={[styles.btn, isSet && styles.btnActive]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.secondary} size="small" />
      ) : (
        <Ionicons
          name={isSet ? "location" : "location-outline"}
          size={26}
          color={isSet ? COLORS.secondary : COLORS.textSecondary}
        />
      )}

      <Text style={[styles.label, isSet && styles.labelActive]}>
        {isSet ? "تم تحديد الموقع" : "إرفاق الموقع"}
      </Text>

      {isSet && (
        <Text style={styles.address} numberOfLines={2}>
          {location}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: 18,
    alignItems: "center",
    minHeight: 110,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  // Active state: solid border + blue tint background
  btnActive: {
    borderColor: COLORS.secondary,
    borderStyle: "solid",
    backgroundColor: "#EBF5FF",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: "center",
  },
  labelActive: {
    color: COLORS.secondary,
  },
  address: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 16,
  },
});
