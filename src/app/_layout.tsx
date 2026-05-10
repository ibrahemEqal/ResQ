import { auth } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { clearUserLocally, getUserLocally } from "@/services/authService";
import { router, Slot, useRootNavigationState } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [role, setRole] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<StoredUser | null | undefined>(
    undefined,
  );
  const navigationState = useRootNavigationState();
  const pathname = usePathname();

  useEffect(() => {
    const checkLocalUser = async () => {
      const storedUser = await getUserLocally();
      console.log("البيانات المحفوظة محلياً:", storedUser);
      setLocalUser(storedUser);
    };
    checkLocalUser();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let nextRole: string | null = null;
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const rawRole = snap.data().role;
            setRole(typeof rawRole === "string" ? rawRole.trim() : null);
          }
        } catch {}
        setRole(nextRole);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;
    if (localUser === undefined) return;

    (async () => {
      if (user === undefined) return;

      if (user) {
        console.log("توجيه من Firebase Auth:", user.email);
        const localRole =
          typeof localUser?.role === "string" ? localUser.role.trim() : null;
        const effectiveRole = (role ?? localRole ?? null)?.trim?.() ?? null;
        if (effectiveRole === "security" || effectiveRole === "admin") {
          router.replace("/(tabs)/dashboard");
        } else {
          router.replace("/(tabs)/home");
        }
      } else {
        if (localUser) {
          await clearUserLocally();
          setLocalUser(null);
        }
        console.log("لا توجد جلسة، توجيه للـ Login");
        router.replace("/auth/login");
      }
    })();
  }, [user, role, navigationState?.key, localUser]);

  if ((user === undefined && !localUser) || !navigationState?.key) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Slot />;
}
