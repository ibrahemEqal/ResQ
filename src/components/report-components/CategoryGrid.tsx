import { COLORS } from "@/constants/colors";
import { EmergencyType, ReportPriority } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PRIORITY_STYLE: Record<
  ReportPriority,
  { bg: string; text: string; label: string }
> = {
  Critical: { bg: "#FFEDED", text: "#EF4444", label: "Critical" },
  High: { bg: "#FEE2E2", text: "#DC2626", label: "High" },
  Medium: { bg: "#FFFBEB", text: "#F59E0B", label: "Medium" },
  Low: { bg: "#F3F4F6", text: "#6B7280", label: "Low" },
};

export const CATEGORIES: {
  type: EmergencyType;
  label: string;
  icon: string;
  color: string;
  bg: string;
  priority: ReportPriority;
}[] = [
  {
    type: "Fire",
    label: "حريق",
    icon: "flame",
    color: "#FF4B2B",
    bg: "#FFF0EE",
    priority: "Critical",
  },
  {
    type: "Fainting",
    label: "إغماء / إصابة",
    icon: "medical",
    color: "#0083B0",
    bg: "#EBF8FF",
    priority: "Medium",
  },
  {
    type: "Security",
    label: "تهديد أمني",
    icon: "shield-half",
    color: "#7B2FBE",
    bg: "#F5EEFF",
    priority: "Critical",
  },
  {
    type: "Electrical",
    label: "كهرباء",
    icon: "flash",
    color: "#F59E0B",
    bg: "#FFFBEB",
    priority: "Low",
  },
  {
    type: "Injury",
    label: "جرح / حادث",
    icon: "bandage",
    color: "#EF4444",
    bg: "#FFEDED",
    priority: "Medium",
  },
  {
    type: "Other",
    label: "أخرى",
    icon: "alert-circle",
    color: "#6B7280",
    bg: "#F3F4F6",
    priority: "Low",
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

            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: PRIORITY_STYLE[cat.priority].bg },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  { color: PRIORITY_STYLE[cat.priority].text },
                ]}
              >
                {PRIORITY_STYLE[cat.priority].label}
              </Text>
            </View>

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
  priorityBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
