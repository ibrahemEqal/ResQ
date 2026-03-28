/**
 * components/SubmitButton.tsx
 * Single Responsibility: Render the animated submit button and the cancel link.
 * The scale animation ref is passed in from useReportStore so the press
 * animation is triggered by the store's handleSubmit, not inside this component.
 */

import { Ionicons } from "@expo/vector-icons";
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";
import { COLORS } from "../constants/colors";

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface Props {
  submitting: boolean;
  disabled: boolean; // true when no category is selected
  submitScale: Animated.Value; // animated ref from useReportStore
  onSubmit: () => void;
  onCancel: () => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function SubmitButton({
  submitting,
  disabled,
  submitScale,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <>
      {/* Wrap button in Animated.View so submitScale drives the press effect */}
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
            // Spinner replaces content while the network call is in-flight
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

      {/* Cancel navigates back without submitting */}
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

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
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
  // Greyed-out when no category has been chosen yet
  btnDisabled: {
    backgroundColor: "#C0C0C8",
    shadowOpacity: 0,
    elevation: 0,
  },
  icon: {
    marginLeft: 8, // RTL: icon sits to the left of the text
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
