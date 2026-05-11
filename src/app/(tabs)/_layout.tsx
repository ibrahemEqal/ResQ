import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/colors";

export default function TabLayout() {
    const userRole = "user" as string;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: COLORS.primary,
                tabBarStyle: { backgroundColor: "#0F172A", borderTopWidth: 0 },
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