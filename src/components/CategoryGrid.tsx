import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/colors";
import { EmergencyType } from "../types";

export const CATEGORIES: {
  type: EmergencyType;
  label: string;
  icon: string;
  color: string;
  bg: string;
}[] = [
  {
    type: "Fire",
    label: "حريق",
    icon: "flame",
    color: "#FF4B2B",
    bg: "#FFF0EE",
  },
  {
    type: "Fainting",
    label: "إغماء / إصابة",
    icon: "medical",
    color: "#0083B0",
    bg: "#EBF8FF",
  },
  {
    type: "Security",
    label: "تهديد أمني",
    icon: "shield-half",
    color: "#7B2FBE",
    bg: "#F5EEFF",
  },
  {
    type: "Electrical",
    label: "كهرباء",
    icon: "flash",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    type: "Injury",
    label: "جرح / حادث",
    icon: "bandage",
    color: "#EF4444",
    bg: "#FFEDED",
  },
  {
    type: "Other",
    label: "أخرى",
    icon: "alert-circle",
    color: "#6B7280",
    bg: "#F3F4F6",
  },
];

interface Props {
  selectedCategory: EmergencyType | null;
  onSelect: (category: EmergencyType) => void;
}

export default function CategoryGrid({ selectedCategory, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategory === cat.type;

        return (
          <TouchableOpacity
            key={cat.type}
            style={[
              styles.card,
              { borderColor: isActive ? cat.color : COLORS.border },
              isActive && { backgroundColor: cat.bg },
            ]}
            activeOpacity={0.75}
            onPress={() => onSelect(cat.type)}
          >
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: isActive ? cat.color : cat.bg },
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={22}
                color={isActive ? "#FFF" : cat.color}
              />
            </View>

            <Text
              style={[
                styles.label,
                isActive && { color: cat.color, fontWeight: "800" },
              ]}
            >
              {cat.label}
            </Text>

            {isActive && (
              <View style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
});
