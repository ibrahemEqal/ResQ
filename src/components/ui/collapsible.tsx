import { SymbolView } from "expo-symbols";
import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Spacing, Theme } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export function Collapsible({
  children,
  title,
}: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.heading,
          pressed && styles.pressedHeading,
        ]}
        onPress={() => setIsOpen((value) => !value)}
      >
        <View style={styles.button}>
          <SymbolView
            name="chevron.right"
            size={14}
            weight="bold"
            tintColor={theme.textPrimary}
            style={{ transform: [{ rotate: isOpen ? "-90deg" : "90deg" }] }}
          />
        </View>

        <Text style={{ color: theme.textPrimary }}>{title}</Text>
      </Pressable>

      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pressedHeading: {
    opacity: 0.7,
  },
  button: {
    width: Theme.spacing.md,
    height: Theme.spacing.md,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginTop: Theme.spacing.sm,
    borderRadius: Theme.radius.sm,
    marginLeft: Theme.spacing.md,
    padding: Theme.spacing.md,
  },
});
