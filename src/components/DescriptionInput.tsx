/**
 * components/DescriptionInput.tsx
 * Single Responsibility: Render the multiline Arabic text input and
 * its character counter. Owns zero state — value and onChange come from props.
 */

import { StyleSheet, Text, TextInput } from "react-native";
import { COLORS } from "../constants/colors";

const MAX_LENGTH = 300;

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
interface Props {
  value: string;
  onChange: (text: string) => void;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function DescriptionInput({ value, onChange }: Props) {
  return (
    <>
      <TextInput
        style={styles.input}
        placeholder="اكتب وصفاً مختصراً للحالة الطارئة..."
        placeholderTextColor={COLORS.textSecondary}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        textAlign="right" // RTL: text starts from the right
        value={value}
        onChangeText={onChange}
        maxLength={MAX_LENGTH}
      />

      {/* Character counter — aligned left to sit at the trailing RTL edge */}
      <Text style={styles.counter}>
        {value.length} / {MAX_LENGTH}
      </Text>
    </>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 110,
    fontWeight: "600",
  },
  counter: {
    textAlign: "left", // trailing edge in RTL
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: "600",
  },
});
