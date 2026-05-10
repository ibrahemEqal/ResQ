import { auth, db, storage } from "@/config/firebaseConfig";
import { COLORS } from "@/constants/colors";
import { File } from "expo-file-system";
import { clearUserLocally, getUserLocally, saveUserLocally } from "@/services/authService";
import { getRoleForUser } from "@/services/roleService";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
  onAuthStateChanged,
  reload,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useRef, useState } from "react";
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

function getImageMimeType(uri: string, mimeType?: string | null) {
  if (mimeType?.startsWith("image/")) return mimeType;
  return uri.toLowerCase().includes(".png") ? "image/png" : "image/jpeg";
}

function getImageExtension(mimeType: string) {
  return mimeType.includes("png") ? "png" : "jpg";
}

async function getImageBlob(uri: string) {
  if (
    uri.startsWith("data:") ||
    uri.startsWith("blob:") ||
    uri.startsWith("http://") ||
    uri.startsWith("https://")
  ) {
    const response = await fetch(uri);
    return response.blob();
  }

  return new File(uri);
}

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
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emergencySound, setEmergencySound] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
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

  const handlePhotoOptions = () => {
    Alert.alert("صورة البروفايل", "اختر مصدر الصورة", [
      { text: "التقاط صورة", onPress: openCamera },
      { text: "اختيار من المعرض", onPress: pickImageFromGallery },
      { text: "إلغاء", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert(
          "صلاحية الكاميرا",
          "يجب السماح للتطبيق بالوصول للكاميرا حتى تستطيع التقاط صورة البروفايل.",
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const closeCamera = () => {
    if (!capturingPhoto) setShowCamera(false);
  };

  const takePhoto = async () => {
    if (!cameraRef.current || capturingPhoto) return;
    try {
      setCapturingPhoto(true);
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!result?.uri) return;
      setShowCamera(false);
      await uploadPhoto(result.uri);
    } catch (error: any) {
      console.log("Upload failed full error:", JSON.stringify(error, null, 2));
      console.log("Error message:", error?.message);
      console.log("Error code:", error?.code);
      console.log("Server response:", error?.serverResponse);
      setPhoto(null);
      Alert.alert("خطأ", "فشل رفع الصورة، حاول مجدداً");
    } finally {
      setCapturingPhoto(false);
    }
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "صلاحية المعرض",
        "يجب السماح للتطبيق بالوصول لمعرض الصور حتى تستطيع اختيار صورة البروفايل.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset?.uri) return;
    await uploadPhoto(asset.uri, asset.mimeType);
  };

  const uploadPhoto = async (uri: string, mimeType?: string | null) => {
    if (!user) {
      Alert.alert("خطأ", "يجب تسجيل الدخول قبل رفع صورة البروفايل");
      return;
    }
    try {
      setUploadingPhoto(true);
      setPhoto(uri);

      const normalizedMimeType = getImageMimeType(uri, mimeType);
      const extension = getImageExtension(normalizedMimeType);
      const storagePath = `profilePhotos/${user.uid}/avatar-${Date.now()}.${extension}`;
      const storageRef = ref(storage, storagePath);
      const imageBlob = await getImageBlob(uri);

      await uploadBytes(storageRef, imageBlob, {
        contentType: normalizedMimeType,
      });
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadURL });
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: downloadURL, updatedAt: new Date().toISOString() },
        { merge: true },
      ).catch(() => undefined);
      await saveUserLocally({
        ...((await getUserLocally()) ?? { uid: user.uid, email: user.email ?? "" }),
        uid: user.uid,
        email: user.email ?? "",
        fullName: user.displayName ?? storedName,
        role: userRole ?? undefined,
        photoURL: downloadURL,
      });
      await reload(user);
      setUser(auth.currentUser);
      setPhoto(null);
    } catch (error) {
      console.log("Upload failed:", error);
      setPhoto(null);
      Alert.alert("خطأ", "فشل رفع الصورة، حاول مجدداً");
    } finally {
      setUploadingPhoto(false);
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
  const photoURL = photo ?? user?.photoURL;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePhotoOptions}
            activeOpacity={0.8}
            disabled={uploadingPhoto}
          >
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{fullName.charAt(0)}</Text>
              </View>
            )}
            {uploadingPhoto && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

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

      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={closeCamera}
      >
        <SafeAreaView style={cameraModal.container}>
          <CameraView
            ref={cameraRef}
            style={cameraModal.camera}
            facing="front"
          />
          <View style={cameraModal.controls} pointerEvents="box-none">
            <View style={cameraModal.topBar}>
              <TouchableOpacity
                style={cameraModal.iconButton}
                onPress={closeCamera}
                disabled={capturingPhoto}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={cameraModal.bottomBar}>
              <TouchableOpacity
                style={[
                  cameraModal.captureButton,
                  capturingPhoto && cameraModal.disabledButton,
                ]}
                onPress={takePhoto}
                disabled={capturingPhoto}
                activeOpacity={0.8}
              >
                {capturingPhoto ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <View style={cameraModal.captureInner} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
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

const cameraModal = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { ...StyleSheet.absoluteFillObject },
  controls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 18,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  bottomBar: { alignItems: "center", paddingBottom: 34 },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.45)",
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  disabledButton: { opacity: 0.7 },
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
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "900", color: COLORS.primary },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
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
