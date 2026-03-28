/**
 * useReportStore.ts
 * Single Responsibility: Own ALL state and business logic for the report screen.
 * No component file should import useState or call submitReport directly —
 * everything flows through this hook.
 */

import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import { submitReport } from "../../services/reportService";
import { EmergencyType } from "../../types";

// ─────────────────────────────────────────────
// Dummy helpers
// Replace with real implementations when ready:
//   expo-location  → Location.getCurrentPositionAsync()
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
// Types — exported so components can use them in props
// ─────────────────────────────────────────────
export type MediaFile = { name: string; type: "image" | "audio" };

export interface ReportStore {
  // State slices
  selectedCategory: EmergencyType | null;
  description: string;
  location: string | null;
  mediaFile: MediaFile | null;
  locationLoading: boolean;
  mediaLoading: boolean;
  submitting: boolean;

  // Animations (refs — passed to index.tsx for the entrance animation)
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  submitScale: Animated.Value;

  // Handlers
  setSelectedCategory: (category: EmergencyType) => void;
  setDescription: (text: string) => void;
  handleGetLocation: () => Promise<void>;
  handlePickMedia: () => Promise<void>;
  handleSubmit: () => Promise<void>;
}

// ─────────────────────────────────────────────
// The hook
// ─────────────────────────────────────────────
export function useReportStore(): ReportStore {
  // ── Form state ──────────────────────────────
  const [selectedCategory, setSelectedCategory] =
    useState<EmergencyType | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);

  // ── Async loading flags ──────────────────────
  const [locationLoading, setLocationLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Animation values ────────────────────────
  // Kept here so index.tsx can start the entrance animation after mounting
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const submitScale = useRef(new Animated.Value(1)).current;

  // ── Handlers ────────────────────────────────

  /** Fetches the device GPS location (currently mocked) */
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

  /** Opens the media picker (currently mocked) */
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

  /** Validates form, animates the button, and submits the report */
  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert("تنبيه", "يرجى اختيار نوع الطارئ أولاً.");
      return;
    }

    // Tactile press animation on the submit button
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

  return {
    // State
    selectedCategory,
    description,
    location,
    mediaFile,
    locationLoading,
    mediaLoading,
    submitting,
    // Animations
    fadeAnim,
    slideAnim,
    submitScale,
    // Handlers
    setSelectedCategory,
    setDescription,
    handleGetLocation,
    handlePickMedia,
    handleSubmit,
  };
}
