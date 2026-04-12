import { Stack } from "expo-router";
import "react-native-gesture-handler";
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
          name="home"
          options={{ title: "الرئيسية", headerShown: false }}
        />
        <Stack.Screen name="tips" options={{ title: "نصائح الطوارئ" }} />
        <Stack.Screen name="dashboard" options={{ title: "لوحة التحكم" }} />
        <Stack.Screen name="report" options={{ title: "إبلاغ عن طارئ" }} />
        <Stack.Screen name="settings" options={{ title: "الإعدادات" }} />
        <Stack.Screen
          name="my-report-history"
          options={{ title: "سجل البلاغات" }}
        />
        <Stack.Screen
          name="incident/[id]"
          options={{ title: "تفاصيل البلاغ " }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
