import { CATEGORIES } from "@/app/ـcomponents/report-components/CategoryGrid";
import { auth } from "@/config/firebaseConfig";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { submitReport } from "@/services/reportService";
import { EmergencyType, ReportPriority } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Animated } from "react-native";

export type MediaFile = {
  name: string;
  type: "image";
  uri: string;
  url?: string;
  publicId?: string;
};

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

export function useReportStore() {
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategoryRaw] =
    useState<EmergencyType | null>(null);
  const [priority, setPriority] = useState<ReportPriority | null>(null);
  const [description, setDescription] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const submitScale = useRef(new Animated.Value(1)).current;

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCategory) throw new Error("يرجى اختيار نوع الطارئ");

      return await submitReport({
        userId: auth.currentUser?.uid ?? "unknown",
        type: selectedCategory,
        description: description.trim() || "لا يوجد وصف",
        location: selectedCollege ?? "غير محدد",
        ...(priority && { priority }),
        ...(mediaFile?.url && { imageUrl: mediaFile.url }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReports"] });

      Alert.alert("تم الإرسال ", "تم إرسال بلاغك بنجاح.", [
        { text: "حسناً", onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert("خطأ", err.message || "فشل إرسال البلاغ");
    },
  });

  const setSelectedCategory = (category: EmergencyType) => {
    setSelectedCategoryRaw(category);
    const match = CATEGORIES.find((c) => c.type === category);
    setPriority(match?.priority ?? null);
  };

  const handlePickMedia = async () => {
    setMediaLoading(true);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const timestamp = Date.now();
      const extension = getFileExtension(asset.fileName || asset.uri, "jpg");
      const fileName = asset.fileName || `photo_${timestamp}.${extension}`;
      const mimeType = getImageMimeType(extension, asset.mimeType);
      const uploadedImage = await uploadImageToCloudinary({
        uri: asset.uri,
        fileName,
        mimeType,
      });

      setMediaFile({
        name: fileName,
        type: "image",
        uri: asset.uri,
        url: uploadedImage.optimizedUrl,
        publicId: uploadedImage.publicId,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "فشل رفع الصورة";
      Alert.alert("خطأ", message, [
        {
          text: "الإعدادات",
          onPress: () => router.push("/(tabs)/settings" as any),
        },
        { text: "حسنًا", style: "cancel" },
      ]);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSubmit = async () => {
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

    reportMutation.mutate();
  };

  return {
    selectedCategory,
    priority,
    description,
    selectedCollege,
    mediaFile,
    mediaLoading,
    submitting: reportMutation.isPending,
    error: reportMutation.isError ? "فشل الإرسال" : null,
    clearError: () => reportMutation.reset(),
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
