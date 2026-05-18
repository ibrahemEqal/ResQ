import { useTheme } from "@/context/ThemeContext";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { deleteToken } from "@/services/notificationService";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/firebaseConfig";
import { COLORS } from "../../constants/colors";

export default function Settings() {
  const [user, setUser] = useState<User | null>(null);

  const [fullNameInput, setFullNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const getFileExtension = (uri: string, fallback = "jpg") => {
    const cleanUri = uri.split("?")[0].split("#")[0];
    const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
    return (match?.[1] ?? fallback).toLowerCase();
  };

  const getImageMimeType = (extension: string, mimeType?: string | null) => {
    if (mimeType) return mimeType;
    if (extension === "jpg") return "image/jpeg";
    return `image/${extension}`;
  };

  const uploadProfilePickedAsset = async (
    asset: ImagePicker.ImagePickerAsset,
  ) => {
    const u = auth.currentUser;
    if (!u) return;

    setAvatarUploading(true);
    try {
      const extension = getFileExtension(asset.fileName || asset.uri, "jpg");
      const fileName = asset.fileName || `profile_${Date.now()}.${extension}`;
      const mimeType = getImageMimeType(extension, asset.mimeType);
      const uploaded = await uploadImageToCloudinary({
        uri: asset.uri,
        fileName,
        mimeType,
      });
      const url = uploaded.optimizedUrl;
      await updateProfile(u, { photoURL: url });
      await setDoc(doc(db, "users", u.uid), { photoURL: url }, { merge: true });
      if (auth.currentUser) {
        setUser(auth.currentUser);
        setProfilePhotoUrl(url);
      }
      Alert.alert("تم", "تم تحديث صورة البروفايل.");
    } catch (e) {
      const message = e instanceof Error ? e.message : "فشل رفع الصورة";
      Alert.alert("خطأ", message, [{ text: "حسنًا", style: "cancel" }]);
    } finally {
      setAvatarUploading(false);
    }
  };

  const pickProfileFromLibrary = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("تنبيه", "يلزم السماح بالوصول إلى معرض الصور.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.length) return;
      await uploadProfilePickedAsset(result.assets[0]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "فشل اختيار الصورة";
      Alert.alert("خطأ", message);
    }
  };

  const pickProfileFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("تنبيه", "يلزم السماح باستخدام الكاميرا.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (result.canceled || !result.assets?.length) return;
      await uploadProfilePickedAsset(result.assets[0]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "فشل التقاط الصورة";
      Alert.alert("خطأ", message);
    }
  };

  const handleChangeProfilePhoto = () => {
    Alert.alert("صورة البروفايل", "اختر مصدر الصورة", [
      { text: "إلغاء", style: "cancel" },
      { text: "من المعرض", onPress: () => void pickProfileFromLibrary() },
      { text: "التقاط صورة", onPress: () => void pickProfileFromCamera() },
    ]);
  };

  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setFullNameInput(firebaseUser.displayName ?? "");
        setEmailInput(firebaseUser.email ?? "");
        let photo: string | null = firebaseUser.photoURL ?? null;
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists()) {
            const d = snap.data();
            if (typeof d.photoURL === "string" && d.photoURL.length > 0) {
              photo = d.photoURL;
            }
          }
        } catch {}
        setProfilePhotoUrl(photo);
      } else {
        router.replace("./login");
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
          try {
            if (!user) return;

            await deleteToken(user.uid);
            await signOut(auth);
            router.replace("./login");
          } catch (error) {
            console.log(error);
          }
        },
      },
    ]);
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;

    const trimmedName = fullNameInput.trim();
    const trimmedEmail = emailInput.trim();

    if (!trimmedName) {
      Alert.alert("تنبيه", "الاسم لا يمكن أن يكون فارغًا.");
      return;
    }
    if (!trimmedEmail) {
      Alert.alert("تنبيه", "البريد الإلكتروني لا يمكن أن يكون فارغًا.");
      return;
    }

    setSavingProfile(true);
    try {
      if (trimmedName !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }

      if (trimmedEmail !== auth.currentUser.email) {
        if (!currentPassword) {
          Alert.alert(
            "تنبيه",
            "اكتب كلمة المرور الحالية لتغيير البريد الإلكتروني.",
          );
          setSavingProfile(false);
          return;
        }

        const credential = EmailAuthProvider.credential(
          auth.currentUser.email ?? "",
          currentPassword,
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, trimmedEmail);
      }

      const updatedUser = auth.currentUser;
      if (updatedUser) {
        setUser(updatedUser);
        setFullNameInput(updatedUser.displayName ?? "");
        setEmailInput(updatedUser.email ?? "");
      }

      Alert.alert("نجاح", "تم تحديث بيانات الحساب بنجاح.");
      setCurrentPassword("");
    } catch (error: any) {
      console.error(error);
      Alert.alert("خطأ", error.message || "فشل تحديث الحساب.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;

    if (!currentPassword.trim()) {
      Alert.alert("تنبيه", "اكتب كلمة المرور الحالية.");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("تنبيه", "اكتب كلمة مرور جديدة.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("تنبيه", "كلمة المرور الجديدة وتأكيدها غير متطابقين.");
      return;
    }

    setSavingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email ?? "",
        currentPassword,
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert("نجاح", "تم تحديث كلمة المرور بنجاح.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      Alert.alert("خطأ", error.message || "فشل تغيير كلمة المرور.");
    } finally {
      setSavingPassword(false);
    }
  };

  const fullName = user?.displayName ?? "مستخدم";
  const email = user?.email ?? "";
  const uid = user?.uid?.slice(0, 8) ?? "-";

  const theme = {
    background: isDark ? "#0F172A" : "#F8F9FA",
    surface: isDark ? "#1E293B" : "#FFFFFF",
    textPrimary: isDark ? "#F8FAFC" : "#1E293B",
    textSecondary: isDark ? "#94A3B8" : "#64748B",
    border: isDark ? "#334155" : "#E2E8F0",
    cardShadow: isDark ? "transparent" : "#000",
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.surface, shadowColor: theme.cardShadow },
          ]}
        >
          <TouchableOpacity
            style={styles.avatarTouchable}
            onPress={handleChangeProfilePhoto}
            disabled={avatarUploading}
            activeOpacity={0.85}
            accessibilityLabel="تغيير صورة البروفايل"
          >
            <View style={styles.avatar}>
              {avatarUploading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : profilePhotoUrl ? (
                <Image
                  source={{ uri: profilePhotoUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <Text style={styles.avatarText}>{fullName.charAt(0)}</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.textPrimary }]}>
              {fullName}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {email}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>طالب</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={handleChangeProfilePhoto}
            disabled={avatarUploading}
            accessibilityLabel="تغيير صورة البروفايل"
          >
            <Ionicons name="camera" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <SectionHeader
          title="المظهر"
          icon="color-palette"
          color={theme.textSecondary}
        />
        <View style={[styles.group, { backgroundColor: theme.surface }]}>
          <SettingRow
            icon={isDark ? "moon" : "sunny"}
            iconBg={isDark ? "#334155" : "#FFF3E0"}
            iconColor={isDark ? "#38BDF8" : "#F59E0B"}
            title="الوضع الليلي"
            subtitle="تبديل مظهر التطبيق بالكامل"
            toggle
            toggleValue={isDark}
            onToggle={toggleTheme}
            theme={theme}
          />
        </View>

        <SectionHeader
          title="الحساب"
          icon="person-circle"
          color={theme.textSecondary}
        />
        <View style={[styles.group, { backgroundColor: theme.surface }]}>
          <SettingRow
            icon="id-card"
            iconBg={isDark ? "#334155" : "#E3F2FD"}
            iconColor={isDark ? "#38BDF8" : "#1565C0"}
            title="معرّف المستخدم"
            subtitle={uid}
            theme={theme}
          />
        </View>

        <SectionHeader
          title="تحديث الحساب"
          icon="create"
          color={theme.textSecondary}
        />
        <View
          style={[
            styles.group,
            { backgroundColor: theme.surface, paddingBottom: 16 },
          ]}
        >
          <CloudinaryInput
            label="الاسم الكامل"
            value={fullNameInput}
            onChangeText={setFullNameInput}
            placeholder="ادخل الاسم الجديد"
            theme={theme}
          />
          <View style={styles.divider} />
          <CloudinaryInput
            label="البريد الإلكتروني"
            value={emailInput}
            onChangeText={setEmailInput}
            placeholder="ادخل البريد الجديد"
            theme={theme}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.divider} />
          <CloudinaryInput
            label="كلمة المرور الحالية"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="اكتب كلمة المرور الحالية"
            theme={theme}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.saveBtn, savingProfile && styles.btnDisabled]}
            onPress={handleUpdateProfile}
            disabled={savingProfile}
          >
            {savingProfile ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>حفظ الاسم والإيميل</Text>
            )}
          </TouchableOpacity>
        </View>

        <SectionHeader
          title="تغيير كلمة المرور"
          icon="lock-closed"
          color={theme.textSecondary}
        />
        <View
          style={[
            styles.group,
            { backgroundColor: theme.surface, paddingBottom: 16 },
          ]}
        >
          <CloudinaryInput
            label="كلمة المرور الجديدة"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="اكتب كلمة مرور جديدة"
            theme={theme}
            secureTextEntry
          />
          <View style={styles.divider} />
          <CloudinaryInput
            label="تأكيد كلمة المرور"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="أعد كتابة كلمة المرور"
            theme={theme}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.saveBtn, savingPassword && styles.btnDisabled]}
            onPress={handleChangePassword}
            disabled={savingPassword}
          >
            {savingPassword ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>تغيير كلمة المرور</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.logoutBtn,
            isDark && { backgroundColor: "#2D1B1B", borderColor: "#451A1A" },
          ]}
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

function SectionHeader({
  title,
  icon,
  color,
}: {
  title: string;
  icon: string;
  color: string;
}) {
  return (
    <View style={section.row}>
      <Ionicons name={icon as any} size={15} color={color} />
      <Text style={[section.text, { color: color }]}>{title}</Text>
    </View>
  );
}

function Divider({ color }: { color: string }) {
  return (
    <View style={{ height: 1, backgroundColor: color, marginHorizontal: 16 }} />
  );
}

function CloudinaryInput({
  label,
  value,
  onChangeText,
  placeholder,
  theme,
  secureTextEntry,
  keyboardType,
  autoCapitalize = "none",
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  theme: any;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={cloudinary.row}>
      <Text style={[cloudinary.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        style={[
          cloudinary.input,
          {
            color: theme.textPrimary,
            borderColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}
      />
    </View>
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
  theme: any;
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
  theme,
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
        <Text style={[row.title, { color: theme.textPrimary }]}>{title}</Text>
        {subtitle && (
          <Text style={[row.subtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {showChevron && (
        <Ionicons
          name="chevron-back"
          size={18}
          color={theme.textSecondary}
          style={{ opacity: 0.5 }}
        />
      )}
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: theme.border, true: COLORS.primaryLight }}
          thumbColor={toggleValue ? COLORS.primary : "#F4F3F4"}
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
  title: { fontSize: 15, fontWeight: "700", textAlign: "right" },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "right",
  },
});

const cloudinary = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 13, gap: 8 },
  label: { fontSize: 12, fontWeight: "800", textAlign: "left" },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "left",
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, width: "100%", maxWidth: 450, alignSelf: "center" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    gap: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarTouchable: {
    borderRadius: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: COLORS.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: "900", textAlign: "right" },
  profileEmail: {
    fontSize: 12,
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
  group: { borderRadius: 20, overflow: "hidden", elevation: 2 },
  cloudinaryFooter: { padding: 16, gap: 12 },
  cloudinaryStatus: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  cloudinaryStatusText: {
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  saveCloudinaryBtn: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveCloudinaryText: { color: "#FFF", fontSize: 14, fontWeight: "900" },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
  saveBtn: {
    marginHorizontal: 16,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  saveBtnText: { color: "#FFF", fontSize: 15, fontWeight: "900" },
  btnDisabled: { opacity: 0.65 },
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
