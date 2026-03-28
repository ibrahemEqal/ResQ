/**
 * components/LocationButton.tsx
 * Single Responsibility: Render the "attach location" action button.
 * Shows a spinner while loading, and the resolved address once set.
 * Owns zero state — all data and the trigger handler come from props.
 */

import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { COLORS } from "../constants/colors";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface Props {
  location: string | null; // null = not yet fetched
  loading: boolean;
  onPress: () => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function LocationButton({ location, loading, onPress }: Props) {
  const isSet = location !== null;

  return (
    <TouchableOpacity
      style={[styles.btn, isSet && styles.btnActive]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {/* Spinner while fetching, icon otherwise */}
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

      {/* Resolved address shown below the label once available */}
      {isSet && (
        <Text style={styles.address} numberOfLines={2}>
          {location}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
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
