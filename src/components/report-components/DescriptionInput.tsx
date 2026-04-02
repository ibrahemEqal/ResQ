import { StyleSheet, Text, TextInput } from "react-native";
import { COLORS } from "../../constants/colors";

const MAX_LENGTH = 300;

interface Props {
  value: string;
  onChange: (text: string) => void;
}

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
        textAlign="right"
        value={value}
        onChangeText={onChange}
        maxLength={MAX_LENGTH}
      />

      <Text style={styles.counter}>
        {value.length} / {MAX_LENGTH}
      </Text>
    </>
  );
}

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
    textAlign: "left",
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: "600",
  },
});
