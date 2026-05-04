import { auth, db } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { Slot, router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const [authReady, setAuthReady] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const role = snap.data().role;
            if (role === "security" || role === "admin") {
              router.replace("/(tabs)/dashboard");
              setAuthReady(true);
              return;
            }
          }
        } catch {}
        router.replace("/(tabs)/home");
      } else {
        router.replace("/auth/login");
      }
      setAuthReady(user !== null);
    });

    return () => unsubscribe();
  }, []);

  if (authReady === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return <Slot />;
}