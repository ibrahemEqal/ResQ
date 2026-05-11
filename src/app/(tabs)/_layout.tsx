import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";
import { useAppTheme } from "@/hooks/useAppTheme"; 
import { UserRole } from "@/types";

export default function TabLayout() {
    const { colors, isDark } = useAppTheme();

    const userRole = "user" as UserRole;
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarStyle: {
                    backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                    borderTopWidth: 1,
                    borderTopColor: isDark ? "#334155" : "#E2E8F0",
                    height: 60,
                    paddingBottom: 8,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "الرئيسية",
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="dashboard"
                options={{
                    title: "الإدارة",
                    href: userRole === "admin" ? "/dashboard" : null,
                    tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="tips"
                options={{
                    title: "الإرشادات",
                    tabBarIcon: ({ color }) => <Ionicons name="bulb" size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    title: "الإعدادات",
                    tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
