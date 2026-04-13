import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "@/constants/colors";
import { MediaFile } from "@/app/report/useReportStore";

interface Props {
  mediaFile: MediaFile | null;
  loading: boolean;
  onPress: () => void;
}

export default function MediaButton({ mediaFile, loading, onPress }: Props) {
  const isSet = mediaFile !== null;

  return (
    <TouchableOpacity
      style={[styles.btn, isSet && styles.btnActive]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.warning} size="small" />
      ) : (
        <Ionicons
          name={isSet ? "image" : "camera-outline"}
          size={26}
          color={isSet ? COLORS.warning : COLORS.textSecondary}
        />
      )}

      <Text style={[styles.label, isSet && styles.labelActive]}>
        {isSet ? "تم الإرفاق" : "إرفاق صورة / صوت"}
      </Text>

      {isSet && mediaFile && (
        <View style={styles.chip}>
          <Ionicons
            name={mediaFile.type === "image" ? "image-outline" : "mic-outline"}
            size={12}
            color={COLORS.warning}
          />
          <Text style={styles.chipText} numberOfLines={1}>
            {mediaFile.name}
          </Text>
        </View>
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
  btnActive: {
    borderColor: COLORS.warning,
    borderStyle: "solid",
    backgroundColor: "#FFFBEB",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: "center",
  },
  labelActive: {
    color: COLORS.warning,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  chipText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "700",
    maxWidth: 80,
  },
});
