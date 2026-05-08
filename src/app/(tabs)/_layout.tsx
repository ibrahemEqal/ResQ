import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useEffect, useState } from "react";

import { auth, db } from "@/config/firebaseConfig";
import { getUserLocally } from "@/services/authService";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const DASHBOARD_ROLES = new Set(["admin", "security", "responder"]);

function canAccessDashboard(role: string | null | undefined) {
  return typeof role === "string" && DASHBOARD_ROLES.has(role.trim());
}

export default function TabLayout() {
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;

      if (!user) {
        setShowDashboard(false);
        return;
      }

      const local = await getUserLocally();
      const localRole =
        typeof local?.role === "string" ? local.role.trim() : null;
      let remoteRole: string | null = null;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const rawRole = snap.data().role;
          remoteRole = typeof rawRole === "string" ? rawRole.trim() : null;
        }
      } catch {
        remoteRole = null;
      }

      if (active) {
        setShowDashboard(canAccessDashboard(remoteRole ?? localRole));
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "الرئيسية",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="dashboard"
          options={{
            title: "القيادة",
            ...(showDashboard ? {} : { href: null }),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "stats-chart" : "stats-chart-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="tips"
          options={{
            title: "الطوارئ",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "shield-checkmark" : "shield-checkmark-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "الإعدادات",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="my-report-history"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
