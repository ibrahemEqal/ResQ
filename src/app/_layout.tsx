import { auth, db } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { getUserLocally } from "@/services/authService";
import { router, Slot, useRootNavigationState } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  // undefined = لسا ما عرفنا، null = مو مسجّل، User = مسجّل
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [role, setRole] = useState<string | null>(null);
  const [localUser, setLocalUser] = useState<any>(null);
  const navigationState = useRootNavigationState();

  // تحقق من البيانات المحلية أولاً
  useEffect(() => {
    const checkLocalUser = async () => {
      const storedUser = await getUserLocally();
      console.log("✅ البيانات المحفوظة محلياً:", storedUser);
      setLocalUser(storedUser);
    };
    checkLocalUser();
  }, []);

  // راقب حالة الـ auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            setRole(snap.data().role ?? null);
          }
        } catch {}
        setUser(firebaseUser);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // انتظر لحد ما الـ navigation يصير جاهز والـ auth يرجع
  useEffect(() => {
    if (!navigationState?.key) return;

    // إذا كان هناك مستخدم محلي، توجيه فوراً
    if (localUser) {
      console.log("🔄 توجيه من البيانات المحلية:", localUser.email);
      if (localUser.role === "security" || localUser.role === "admin") {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
      return;
    }

    // إلا إذا كان user من Firebase جاهز
    if (user === undefined) return;

    if (user) {
      console.log("🔄 توجيه من Firebase Auth:", user.email);
      if (role === "security" || role === "admin") {
        router.replace("/(tabs)/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
    } else {
      console.log("🔄 لا توجد جلسة، توجيه للـ Login");
      router.replace("/auth/login");
    }
  }, [user, role, navigationState?.key, localUser]);

  // شاشة تحميل لحد ما نعرف حالة الـ auth
  if ((user === undefined && !localUser) || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Slot />;
}
