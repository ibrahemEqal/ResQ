import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from "react-native";
import { COLORS } from "@/constants/colors";

import { auth, db } from "@/config/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("جاري التحميل...");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role);
            setUserName(data.fullName || "مستخدم");
          } else {
            setUserName("مستخدم");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserName("مستخدم");
        }
      } else {
        setUserName("زائر");
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('./login');
    } catch (error) {
      Alert.alert("خطأ", "حدثت مشكلة أثناء تسجيل الخروج");
      console.error(error);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>صباح الخير،</Text>
            <Text style={styles.userName}>{userName}</Text>
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={12} color={COLORS.secondary} />
              <Text style={styles.locationText}>جامعة النجاح الوطنية</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={() => router.push("./settings")}
              activeOpacity={0.7}
            >
              <Ionicons name="person" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileAvatar, { backgroundColor: '#FFEBEE' }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={24} color="#C62828" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sosContainer}>
          <Animated.View
            style={[
              styles.sosPulseCircle,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.15],
                  outputRange: [0.6, 0],
                }),
              },
            ]}
          />

          <TouchableOpacity
            style={styles.sosButton}
            activeOpacity={0.8}
            onLongPress={() => router.push('/report')}
            delayLongPress={800}
          >
            <Ionicons name="warning" size={48} color={COLORS.surface} />
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>

          <Text style={styles.sosInstruction}>
            اضغط مطولاً للإبلاغ عن حالة طارئة
          </Text>
        </View>

        <View style={styles.grid}>
          {/* Card 1: Tips */}
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => router.push("/tips")}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.iconWrapper, { backgroundColor: "#E8F5E9" }]}
              >
                <Ionicons name="shield-checkmark" size={24} color="#2E7D32" />
              </View>
              <Ionicons
                name="chevron-back"
                size={20}
                color={COLORS.textSecondary}
                style={{ opacity: 0.5 }}
              />
            </View>
            <Text style={styles.cardTitle}>دليل الطوارئ</Text>
            <Text style={styles.cardDesc}>كيف تتصرف؟</Text>
          </TouchableOpacity>

          {(userRole === 'security' || userRole === 'admin') && (
            <TouchableOpacity
              style={styles.premiumCard}
              onPress={() => router.push("/(tabs)/dashboard")}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[styles.iconWrapper, { backgroundColor: "#E3F2FD" }]}
                >
                  <Ionicons name="stats-chart" size={24} color="#1565C0" />
                </View>
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={COLORS.textSecondary}
                  style={{ opacity: 0.5 }}
                />
              </View>
              <Text style={styles.cardTitle}>المتابعة</Text>
              <Text style={styles.cardDesc}>لوحة التحكم</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.premiumCard}
            activeOpacity={0.8}
            onPress={() => router.push("/list-emergrn")}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.iconWrapper, { backgroundColor: "#FFF3E0" }]}
              >
                <Ionicons name="notifications" size={24} color="#EF6C00" />
              </View>
              <View style={styles.notificationDot} />
            </View>
            <Text style={styles.cardTitle}>الخريطة الحية</Text>
            <Text style={styles.cardDesc}>متابعة البلاغات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.premiumCard}
            activeOpacity={0.8}
            onPress={() => router.push("/my-report-history")}
          >
            <View style={styles.cardHeader}>
              <View
                style={[styles.iconWrapper, { backgroundColor: "#FFEBEE" }]}
              >
                <Ionicons name="time" size={24} color="#C62828" />
              </View>
            </View>
            <Text style={styles.cardTitle}>سجل البلاغات</Text>
            <Text style={styles.cardDesc}>بلاغاتك السابقة</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  container: {
    flex: 1,
    padding: 24,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },

  /* Header Styles */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 2,
  },
  userName: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  locationText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "700",
    marginLeft: 4,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.surface,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  /* SOS Button Styles */
  sosContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50,
    position: "relative",
    height: 220,
  },
  sosPulseCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 59, 48, 0.2)",
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.3)",
  },
  sosText: {
    color: COLORS.surface,
    fontSize: 32,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: 3,
  },
  sosInstruction: {
    position: "absolute",
    bottom: -15,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },

  /* Premium Cards Grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  premiumCard: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#1D3557",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 15,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconWrapper: { padding: 10, borderRadius: 14 },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    position: "absolute",
    top: 0,
    right: 0,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardDesc: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
});
