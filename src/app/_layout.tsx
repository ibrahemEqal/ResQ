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
        name="(tabs)"
        options={{ headerShown: false }}
      />

      <Stack.Screen name="report" options={{ title: "إبلاغ عن طارئ" }} />
      <Stack.Screen name="incident/[id]" options={{ title: "تفاصيل البلاغ" }} />

      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: "إنشاء حساب", headerShown: false }} />
    </Stack>
  );
}