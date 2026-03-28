/**
 * report.tsx — Emergency Report Screen for ResQ
 *
 * This screen lets a user:
 *  1. Select an emergency category (Fire, Fainting, Security, etc.)
 *  2. Optionally attach a photo or audio note
 *  3. Attach their current GPS location
 *  4. Add a short description
 *  5. Submit the report
 *
 * Patterns followed from the existing codebase:
 *  - Functional component + hooks (useState, useEffect, useRef)
 *  - StyleSheet.create() for all styles
 *  - COLORS constants from '../../constants/colors'
 *  - Ionicons from '@expo/vector-icons'
 *  - expo-router for navigation
 *  - Arabic (RTL) UI text
 *
 * FILE LOCATION: src/app/report/index.tsx
 * The double ../ is needed because this file is TWO levels deep
 * inside src/app/report/, so we must go up twice to reach src/
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors"; // src/constants/colors.ts
import { submitReport } from "../../services/reportService"; // src/services/reportService.ts
import { EmergencyType } from "../../types"; // src/types/index.ts

// ─────────────────────────────────────────────
// Category configuration
// Each entry has: a type key, an Arabic label,
// an Ionicon name, and a theme color.
// ─────────────────────────────────────────────
const CATEGORIES: {
  type: EmergencyType;
  label: string;
  icon: string;
  color: string;
  bg: string;
}[] = [
  {
    type: "Fire",
    label: "حريق",
    icon: "flame",
    color: "#FF4B2B",
    bg: "#FFF0EE",
  },
  {
    type: "Fainting",
    label: "إغماء / إصابة",
    icon: "medical",
    color: "#0083B0",
    bg: "#EBF8FF",
  },
  {
    type: "Security",
    label: "تهديد أمني",
    icon: "shield-half",
    color: "#7B2FBE",
    bg: "#F5EEFF",
  },
  {
    type: "Electrical",
    label: "كهرباء",
    icon: "flash",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    type: "Injury",
    label: "جرح / حادث",
    icon: "bandage",
    color: "#EF4444",
    bg: "#FFEDED",
  },
  {
    type: "Other",
    label: "أخرى",
    icon: "alert-circle",
    color: "#6B7280",
    bg: "#F3F4F6",
  },
];

// ─────────────────────────────────────────────
// Dummy location & media helpers
// In production, replace these with:
//   expo-location  →  Location.getCurrentPositionAsync()
//   expo-image-picker → ImagePicker.launchImageLibraryAsync()
// ─────────────────────────────────────────────
const DUMMY_LOCATION = "مبنى الهندسة - الطابق الثاني، جامعة النجاح";

const fakeGetLocation = (): Promise<string> =>
  new Promise((resolve) => setTimeout(() => resolve(DUMMY_LOCATION), 1200));

const fakePickMedia = (): Promise<{ name: string; type: "image" | "audio" }> =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ name: "photo_20240615.jpg", type: "image" }),
      800,
    ),
  );

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ReportScreen() {
  // ── Form State ──────────────────────────────
  const [selectedCategory, setSelectedCategory] =
    useState<EmergencyType | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<{
    name: string;
    type: "image" | "audio";
  } | null>(null);

  // ── UI / Async State ────────────────────────
  const [locationLoading, setLocationLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Animation for the submit button ─────────
  const submitScale = useRef(new Animated.Value(1)).current;

  // Entrance animation — slides content up on mount
  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Handlers ────────────────────────────────

  /** Simulates fetching GPS coordinates */
  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const loc = await fakeGetLocation();
      setLocation(loc);
    } catch {
      Alert.alert("خطأ", "تعذر الوصول إلى الموقع. تحقق من صلاحيات التطبيق.");
    } finally {
      setLocationLoading(false);
    }
  };

  /** Simulates opening the media picker */
  const handlePickMedia = async () => {
    setMediaLoading(true);
    try {
      const file = await fakePickMedia();
      setMediaFile(file);
    } catch {
      Alert.alert("خطأ", "فشل تحميل الملف.");
    } finally {
      setMediaLoading(false);
    }
  };

  /** Validates the form and submits */
  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert("تنبيه", "يرجى اختيار نوع الطارئ أولاً.");
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(submitScale, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(submitScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();

    setSubmitting(true);
    try {
      await submitReport({
        userId: "USER-123", // Replace with real auth user ID
        type: selectedCategory,
        description: description.trim() || "لا يوجد وصف",
        location: location ?? "غير محدد",
      });

      Alert.alert(
        "تم الإرسال ✅",
        "تم إرسال بلاغك بنجاح. سيتم التواصل معك قريباً.",
        [{ text: "حسناً", onPress: () => router.back() }],
      );
    } catch {
      Alert.alert("خطأ", "فشل إرسال البلاغ. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Page Title ── */}
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>بلاغ طارئ</Text>
            <Text style={styles.pageSubtitle}>
              أدخل تفاصيل الحادث وأرسل البلاغ فوراً
            </Text>
          </View>

          {/* ════════════════════════════════════
                        SECTION 1 — Category Selection
                    ════════════════════════════════════ */}
          <SectionLabel icon="grid" title="نوع الطارئ" required />

          {/* 2-column grid of category cards */}
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.type;
              return (
                <TouchableOpacity
                  key={cat.type}
                  style={[
                    styles.categoryCard,
                    { borderColor: isActive ? cat.color : COLORS.border },
                    isActive && { backgroundColor: cat.bg },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedCategory(cat.type)}
                >
                  {/* Colored icon circle */}
                  <View
                    style={[
                      styles.catIconWrapper,
                      { backgroundColor: isActive ? cat.color : cat.bg },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={22}
                      color={isActive ? "#FFF" : cat.color}
                    />
                  </View>

                  <Text
                    style={[
                      styles.catLabel,
                      isActive && { color: cat.color, fontWeight: "800" },
                    ]}
                  >
                    {cat.label}
                  </Text>

                  {/* Checkmark shown when selected */}
                  {isActive && (
                    <View
                      style={[
                        styles.checkBadge,
                        { backgroundColor: cat.color },
                      ]}
                    >
                      <Ionicons name="checkmark" size={10} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ════════════════════════════════════
                        SECTION 2 — Description
                    ════════════════════════════════════ */}
          <SectionLabel icon="create" title="وصف الحادث" />

          <TextInput
            style={styles.textInput}
            placeholder="اكتب وصفاً مختصراً للحالة الطارئة..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            textAlign="right" // RTL alignment
            value={description}
            onChangeText={setDescription}
            maxLength={300}
          />
          {/* Character counter */}
          <Text style={styles.charCount}>{description.length} / 300</Text>

          {/* ════════════════════════════════════
                        SECTION 3 — Location & Media
                        Two side-by-side action buttons
                    ════════════════════════════════════ */}
          <SectionLabel icon="attach" title="الموقع والوسائط" />

          <View style={styles.actionRow}>
            {/* Location Button */}
            <TouchableOpacity
              style={[styles.actionBtn, location && styles.actionBtnActive]}
              onPress={handleGetLocation}
              disabled={locationLoading}
              activeOpacity={0.8}
            >
              {locationLoading ? (
                <ActivityIndicator color={COLORS.secondary} size="small" />
              ) : (
                <Ionicons
                  name={location ? "location" : "location-outline"}
                  size={26}
                  color={location ? COLORS.secondary : COLORS.textSecondary}
                />
              )}
              <Text
                style={[
                  styles.actionBtnLabel,
                  location && { color: COLORS.secondary },
                ]}
              >
                {location ? "تم تحديد الموقع" : "إرفاق الموقع"}
              </Text>

              {/* Show the resolved location address */}
              {location && (
                <Text style={styles.locationText} numberOfLines={2}>
                  {location}
                </Text>
              )}
            </TouchableOpacity>

            {/* Media Upload Button */}
            <TouchableOpacity
              style={[
                styles.actionBtn,
                mediaFile && styles.actionBtnMediaActive,
              ]}
              onPress={handlePickMedia}
              disabled={mediaLoading}
              activeOpacity={0.8}
            >
              {mediaLoading ? (
                <ActivityIndicator color={COLORS.warning} size="small" />
              ) : (
                <Ionicons
                  name={mediaFile ? "image" : "camera-outline"}
                  size={26}
                  color={mediaFile ? COLORS.warning : COLORS.textSecondary}
                />
              )}
              <Text
                style={[
                  styles.actionBtnLabel,
                  mediaFile && { color: COLORS.warning },
                ]}
              >
                {mediaFile ? "تم الإرفاق" : "إرفاق صورة / صوت"}
              </Text>

              {/* Show uploaded file name */}
              {mediaFile && (
                <View style={styles.fileChip}>
                  <Ionicons
                    name={
                      mediaFile.type === "image"
                        ? "image-outline"
                        : "mic-outline"
                    }
                    size={12}
                    color={COLORS.warning}
                  />
                  <Text style={styles.fileChipText} numberOfLines={1}>
                    {mediaFile.name}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ════════════════════════════════════
                        Submit Button
                    ════════════════════════════════════ */}
          <Animated.View
            style={{ transform: [{ scale: submitScale }], marginTop: 32 }}
          >
            <TouchableOpacity
              style={[
                styles.submitBtn,
                !selectedCategory && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting || !selectedCategory}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons
                    name="send"
                    size={22}
                    color="#FFF"
                    style={{ marginLeft: 8 }}
                  />
                  <Text style={styles.submitText}>إرسال البلاغ</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Cancel / Go back */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>إلغاء</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Small reusable section header label
// ─────────────────────────────────────────────
function SectionLabel({
  icon,
  title,
  required,
}: {
  icon: string;
  title: string;
  required?: boolean;
}) {
  return (
    <View style={sectionStyles.row}>
      <Ionicons name={icon as any} size={16} color={COLORS.primary} />
      <Text style={sectionStyles.title}>{title}</Text>
      {required && <Text style={sectionStyles.required}>*</Text>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 24,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  required: { fontSize: 15, color: COLORS.primary, fontWeight: "900" },
});

// ─────────────────────────────────────────────
// Main Styles
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 24,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },

  /* ── Page title ── */
  titleBlock: { marginBottom: 8, marginTop: 10 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    textAlign: "right",
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },

  /* ── Category Grid ── */
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryCard: {
    width: "47%",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
    alignItems: "center",
    position: "relative",
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  catIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  catLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  // Green check badge at top-right when selected
  checkBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Description TextInput ── */
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 110,
    fontWeight: "600",
  },
  charCount: {
    textAlign: "left", // left so it appears at trailing edge (RTL context)
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: "600",
  },

  /* ── Action Buttons Row (Location + Media) ── */
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    padding: 18,
    alignItems: "center",
    minHeight: 110,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  // Highlighted state when location is set
  actionBtnActive: {
    borderColor: COLORS.secondary,
    borderStyle: "solid",
    backgroundColor: "#EBF5FF",
  },
  // Highlighted state when media is attached
  actionBtnMediaActive: {
    borderColor: COLORS.warning,
    borderStyle: "solid",
    backgroundColor: "#FFFBEB",
  },
  actionBtnLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: "center",
  },
  // Small text showing resolved address under location button
  locationText: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 16,
  },
  // Chip showing the attached file name
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3CD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
    gap: 4,
  },
  fileChipText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "700",
    maxWidth: 80,
  },

  /* ── Submit Button ── */
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  submitBtnDisabled: {
    backgroundColor: "#C0C0C8",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },

  /* ── Cancel Link ── */
  cancelBtn: { alignItems: "center", marginTop: 16, paddingVertical: 8 },
  cancelText: { fontSize: 15, color: COLORS.textSecondary, fontWeight: "700" },
});
