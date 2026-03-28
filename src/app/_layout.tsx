import { Stack } from "expo-router";
import { COLORS } from "../constants/colors";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.surface,
        headerTitleStyle: { fontWeight: "bold" },
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="home"
        options={{ title: "الرئيسية", headerShown: false }}
      />
      <Stack.Screen name="tips" options={{ title: "نصائح الطوارئ" }} />
      <Stack.Screen name="dashboard" options={{ title: "لوحة التحكم" }} />
      <Stack.Screen name="report" options={{ title: "إبلاغ عن طارئ" }} />
    </Stack>
  );
}
