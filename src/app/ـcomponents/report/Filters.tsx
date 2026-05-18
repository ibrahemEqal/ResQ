import { useAppTheme } from "@/hooks/useAppTheme";
import { ReportStatus } from "@/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  filter: ReportStatus | "All";
  setFilter: (f: ReportStatus | "All") => void;
};

export default function Filters({ filter, setFilter }: Props) {
  const { colors } = useAppTheme();

  const tabs: (ReportStatus | "All")[] = [
    "All",
    "Open",
    "In Progress",
    "Resolved",
    "Critical",
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case "Open":
        return "مفتوح";
      case "In Progress":
        return "قيد المعالجة";
      case "Resolved":
        return "تم الحل";
      case "Critical":
        return "حرج";
      default:
        return "الكل";
    }
  };

  return (
    <View style={styles.filters}>
      {tabs.map((tab) => {
        const isActive = filter === tab;

        return (
          <TouchableOpacity
            key={tab}
            style={[
              styles.btn,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setFilter(tab)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.text,
                {
                  color: isActive ? "#fff" : colors.text,
                },
              ]}
            >
              {getStatusText(tab)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filters: {
    flexDirection: "row-reverse",
    flexWrap: "nowrap",
    marginBottom: 12,
    alignItems: "center",
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    marginLeft: 6,
  },

  text: {
    fontSize: 13,
    fontWeight: "600",
  },
});
