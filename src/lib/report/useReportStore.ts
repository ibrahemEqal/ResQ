import { auth, storage } from "@/config/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRef, useState } from "react";
import { Alert, Animated } from "react-native";

import { CATEGORIES } from "@/components/report-components/CategoryGrid";
import { submitReport } from "../../services/reportService";
import { EmergencyType, ReportPriority } from "../../types";

export type MediaFile = {
  name: string;
  type: "image" | "audio";
  url?: string;
};

export interface ReportStore {
  selectedCategory: EmergencyType | null;
  priority: ReportPriority | null;
  description: string;
  selectedCollege: string | null;
  mediaFile: MediaFile | null;
  mediaLoading: boolean;
  submitting: boolean;
  error: string | null;
  clearError: () => void;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  submitScale: Animated.Value;

  setSelectedCategory: (category: EmergencyType) => void;
  setDescription: (text: string) => void;
  setSelectedCollege: (college: string) => void;
  handlePickMedia: () => Promise<void>;
  handleSubmit: () => Promise<void>;
}

export function useReportStore(): ReportStore {
  const [selectedCategory, setSelectedCategoryRaw] =
    useState<EmergencyType | null>(null);
  const [priority, setPriority] = useState<ReportPriority | null>(null);
  const [description, setDescription] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const submitScale = useRef(new Animated.Value(1)).current;

  const clearError = () => setError(null);

  const setSelectedCategory = (category: EmergencyType) => {
    setSelectedCategoryRaw(category);
    const match = CATEGORIES.find(
      (c: (typeof CATEGORIES)[number]) => c.type === category,
    );
    setPriority(match?.priority ?? null);
  };

  const handlePickMedia = async () => {
    setMediaLoading(true);
    clearError();
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("لا يوجد صلاحية للوصول إلى مكتبة الصور. تحقق من الإعدادات.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const uid = auth.currentUser?.uid;

      if (!uid) {
        setError("يجب تسجيل الدخول أولاً لرفع الملفات.");
        return;
      }

      const timestamp = Date.now();
      const fileName = asset.fileName ?? `photo_${timestamp}.jpg`;
      const storagePath = `report-media/${uid}/${timestamp}_${fileName}`;
      const storageRef = ref(storage, storagePath);
      
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const downloadURL = await getDownloadURL(storageRef);

      setMediaFile({ name: fileName, type: "image", url: downloadURL });
    } catch (error: any) {
      console.error("Upload error:", error);
      setError(error?.message || "فشل رفع الملف. تحقق من اتصالك بالإنترنت وحاول مجدداً.");
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      Alert.alert("تنبيه", "يرجى اختيار نوع الطارئ أولاً.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setError("يجب تسجيل الدخول أولاً لإرسال البلاغ.");
      return;
    }

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
    clearError();
    try {
      const result = await submitReport({
        userId: uid,
        type: selectedCategory,
        description: description.trim() || "لا يوجد وصف",
        location: selectedCollege ?? "غير محدد",
        ...(priority && { priority }),
        ...(mediaFile?.url && { imageUrl: mediaFile.url }),
      });

      if (!result.success) {
        setError(
          "فشل إرسال البلاغ. تحقق من اتصالك بالإنترنت وحاول مجدداً.",
        );
        return;
      }

      Alert.alert(
        "تم الإرسال ✅",
        "تم إرسال بلاغك بنجاح. سيتم التواصل معك قريباً.",
        [{ text: "حسناً", onPress: () => router.back() }],
      );
    } catch {
      setError("فشل إرسال البلاغ. تحقق من اتصالك بالإنترنت وحاول مجدداً.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    selectedCategory,
    priority,
    description,
    selectedCollege,
    mediaFile,
    mediaLoading,
    submitting,
    error,
    clearError,
    fadeAnim,
    slideAnim,
    submitScale,
    setSelectedCategory,
    setDescription,
    setSelectedCollege,
    handlePickMedia,
    handleSubmit,
  };
}
