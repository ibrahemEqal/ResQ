import { auth, db } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { clearUserLocally, getUserLocally, saveUserLocally } from "@/services/authService";
import { getRoleForUser } from "@/services/roleService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  onAuthStateChanged,
  reload,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APP_VERSION = "1.0.0";

function getRoleLabel(role?: string | null) {
  switch (String(role === "admin" ? "admin" : "student")) {
    case "admin":
      return "أدمن";
    case "__legacy_1":
      return "أمن";
    case "__legacy_2":
      return "استجابة";
    case "__legacy_3":
      return "موظف";
    default:
      return "طالب";
  }
}

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emergencySound, setEmergencySound] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [storedName, setStoredName] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const local = await getUserLocally();
        const role = await getRoleForUser(firebaseUser);

        if (!active) return;

        setUser(firebaseUser);
        setStoredName(
          local?.uid === firebaseUser.uid && typeof local.fullName === "string"
            ? local.fullName.trim()
            : "",
        );
        setUserRole(role);
      } else {
        router.replace("/auth/login");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const openEditModal = () => {
    setEditName(user?.displayName ?? "");
    setEditModalVisible(true);
  };

  const handleSaveName = async () => {
    if (!user) return;
    if (!editName.trim()) {
      Alert.alert("خطأ", "الاسم لا يمكن أن يكون فارغاً");
      return;
    }
    try {
      setSaving(true);
      await updateProfile(user, { displayName: editName.trim() });
      await setDoc(
        doc(db, "users", user.uid),
        { fullName: editName.trim(), updatedAt: new Date().toISOString() },
        { merge: true },
      ).catch(() => undefined);
      await saveUserLocally({
        ...((await getUserLocally()) ?? { uid: user.uid, email: user.email ?? "" }),
        uid: user.uid,
        email: user.email ?? "",
        fullName: editName.trim(),
        role: userRole ?? undefined,
      });
      await reload(user);
      setUser(auth.currentUser);
      setStoredName(editName.trim());
      setEditModalVisible(false);
    } catch {
      Alert.alert("خطأ", "فشل تحديث الاسم، حاول مجدداً");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد أنك تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          await clearUserLocally();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const fullName = user?.displayName || storedName || "مستخدم";
  const email = user?.email ?? "";
  const uid = user?.uid?.slice(0, 8) ?? "-";
  const photoURL = user?.photoURL;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{fullName.charAt(0)}</Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName}</Text>
            <Text style={styles.profileEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{getRoleLabel(userRole)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={openEditModal}
          >
            <Ionicons name="pencil" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <SectionHeader title="الحساب" icon="person-circle" />
        <View style={styles.group}>
          <SettingRow
            icon="id-card"
            iconBg="#E3F2FD"
            iconColor="#1565C0"
            title="معرف المستخدم"
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

        <SectionHeader title="حول التطبيق" icon="information-circle" />
        <View style={styles.group}>
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

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={modal.overlay}>
          <View style={modal.card}>
            <Text style={modal.title}>تعديل الاسم</Text>
            <TextInput
              style={modal.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="الاسم الكامل"
              placeholderTextColor={COLORS.textSecondary}
              textAlign="right"
              autoFocus
            />
            <View style={modal.actions}>
              <TouchableOpacity
                style={modal.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={modal.cancelText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modal.saveBtn}
                onPress={handleSaveName}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={modal.saveText}>حفظ</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    letterSpacing: 0,
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

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  actions: { flexDirection: "row", gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelText: { fontSize: 15, fontWeight: "700", color: COLORS.textSecondary },
  saveBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  saveText: { fontSize: 15, fontWeight: "800", color: "#fff" },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { flex: 1 },
  content: { padding: 20, width: "100%", maxWidth: 450, alignSelf: "center" },
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
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: { width: 56, height: 56, borderRadius: 28 },
  avatarText: { fontSize: 22, fontWeight: "900", color: COLORS.primary },
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
  roleBadgeText: { fontSize: 11, fontWeight: "800", color: COLORS.primary },
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
  logoutText: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
});
