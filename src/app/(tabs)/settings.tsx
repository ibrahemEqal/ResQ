import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors"
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

const APP_VERSION = "1.0.0";

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emergencySound, setEmergencySound] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.replace("/login");
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد أنك تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/login");
        },
      },
    ]);
  };

  const fullName = user?.displayName ?? "مستخدم";
  const email = user?.email ?? "";
  const uid = user?.uid?.slice(0, 8) ?? "—";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{fullName.charAt(0)}</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>طالب</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
            <Ionicons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <SectionHeader title="الحساب" icon="person-circle" />
        <View style={styles.group}>
          <SettingRow
            icon="id-card"
            iconBg="#E3F2FD"
            iconColor="#1565C0"
            title="معرّف المستخدم"
            subtitle={uid}
          />
        </View>

        <SectionHeader title="الإشعارات" icon="notifications" />
        <View style={styles.group}>
          <SettingRow
            icon="notifications"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="إشعارات الطوارئ"
            subtitle="تلقي تنبيهات الحوادث الجديدة"
            toggle
            toggleValue={pushNotifications}
            onToggle={setPushNotifications}
          />
          <Divider />
          <SettingRow
            icon="volume-high"
            iconBg="#FFF3E0"
            iconColor="#E65100"
            title="صوت الطوارئ"
            subtitle="تشغيل صوت تنبيه عند الحوادث الحرجة"
            toggle
            toggleValue={emergencySound}
            onToggle={setEmergencySound}
          />
        </View>

        <SectionHeader title="الخصوصية" icon="shield-checkmark" />
        <View style={styles.group}>
          <SettingRow
            icon="location"
            iconBg="#FFEBEE"
            iconColor="#C62828"
            title="مشاركة الموقع"
            subtitle="إرسال موقعك عند إرسال البلاغات"
            toggle
            toggleValue={locationSharing}
            onToggle={setLocationSharing}
          />
          <Divider />
          <SettingRow
            icon="bar-chart"
            iconBg="#F3F4F6"
            iconColor="#6B7280"
            title="تحسين التطبيق"
            subtitle="مشاركة بيانات الاستخدام مجهولة الهوية"
            toggle
            toggleValue={analyticsEnabled}
            onToggle={setAnalyticsEnabled}
          />
        </View>

        <SectionHeader title="حول التطبيق" icon="information-circle" />
        <View style={styles.group}>
          <SettingRow
            icon="document-text"
            iconBg="#E8F5E9"
            iconColor="#2E7D32"
            title="شروط الاستخدام"
            onPress={() =>
              Alert.alert("شروط الاستخدام", "سيتم فتح الشروط قريباً.")
            }
            showChevron
          />
          <Divider />
          <SettingRow
            icon="code-slash"
            iconBg="#E3F2FD"
            iconColor="#1565C0"
            title="إصدار التطبيق"
            subtitle={`v${APP_VERSION}`}
          />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out" size={20} color={COLORS.primary} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={section.row}>
      <Ionicons name={icon as any} size={15} color={COLORS.textSecondary} />
      <Text style={section.text}>{title}</Text>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
      }}
    />
  );
}

interface SettingRowProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

function SettingRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onPress,
  showChevron,
  toggle,
  toggleValue,
  onToggle,
}: SettingRowProps) {
  return (
    <TouchableOpacity
      style={row.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress && !toggle}
    >
      <View style={[row.iconWrapper, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>

      <View style={row.textBlock}>
        <Text style={row.title}>{title}</Text>
        {subtitle && <Text style={row.subtitle}>{subtitle}</Text>}
      </View>

      {showChevron && (
        <Ionicons
          name="chevron-back"
          size={18}
          color={COLORS.textSecondary}
          style={{ opacity: 0.5 }}
        />
      )}
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={toggleValue ? COLORS.primary : COLORS.surface}
        />
      )}
    </TouchableOpacity>
  );
}

const section = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

const row = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textBlock: { flex: 1 },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "right",
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { flex: 1 },
  content: {
    padding: 20,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "right",
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "right",
  },
  roleBadge: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  group: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    backgroundColor: "#FFF5F5",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
  },
});