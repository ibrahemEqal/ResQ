import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

interface Props {
  submitting: boolean;
  disabled: boolean;
  submitScale: Animated.Value;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function SubmitButton({
  submitting,
  disabled,
  submitScale,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <>
      <Animated.View
        style={[styles.wrapper, { transform: [{ scale: submitScale }] }]}
      >
        <TouchableOpacity
          style={[styles.btn, disabled && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={submitting || disabled}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Ionicons
                name="send"
                size={22}
                color="#FFF"
                style={styles.icon}
              />
              <Text style={styles.label}>إرسال البلاغ</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        activeOpacity={0.7}
      >
        <Text style={styles.cancelLabel}>إلغاء</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 32,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  btnDisabled: {
    backgroundColor: "#C0C0C8",
    shadowOpacity: 0,
    elevation: 0,
  },
  icon: {
    marginLeft: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  cancelBtn: {
    alignItems: "center",
    marginTop: 16,
    paddingVertical: 8,
  },
  cancelLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "700",
  },
});