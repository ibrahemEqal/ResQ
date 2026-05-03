import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../constants/colors";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.surface,
          headerTitleStyle: { fontWeight: "bold" },
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="auth/signup"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="report"
          options={{ title: "إبلاغ عن طارئ" }}
        />

        <Stack.Screen
          name="incident/[id]"
          options={{ title: "تفاصيل البلاغ" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}