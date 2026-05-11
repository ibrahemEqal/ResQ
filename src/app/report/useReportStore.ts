import { auth, storage } from "@/config/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRef, useState } from "react";
import { Alert, Animated } from "react-native";
import * as Location from 'expo-location';
import { CATEGORIES } from "@/app/ـcomponents/report-components/CategoryGrid";
import { submitReport } from "@/services/reportService";
import { EmergencyType, ReportPriority } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query"; 

export type MediaFile = {
  name: string;
  type: "image" | "audio";
  url?: string;
};

export function useReportStore() {
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategoryRaw] = useState<EmergencyType | null>(null);
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
      queryClient.invalidateQueries({ queryKey: ['myReports'] });

      Alert.alert("تم الإرسال ", "تم إرسال بلاغك بنجاح.", [
        { text: "حسناً", onPress: () => router.back() }
      ]);
    },
    onError: (err: any) => {
      Alert.alert("خطأ", err.message || "فشل إرسال البلاغ");
    }
  });

  const setSelectedCategory = (category: EmergencyType) => {
    setSelectedCategoryRaw(category);
    const match = CATEGORIES.find((c) => c.type === category);
    setPriority(match?.priority ?? null);
  };

  const handlePickMedia = async () => {
    setMediaLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const uid = auth.currentUser?.uid;

      if (!uid) return;

      const timestamp = Date.now();
      const fileName = `photo_${timestamp}.jpg`;
      const storageRef = ref(storage, `report-media/${uid}/${timestamp}_${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setMediaFile({ name: fileName, type: "image", url: downloadURL });
    } catch (e) {
      console.error(e);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleSubmit = async () => {
    Animated.sequence([
      Animated.timing(submitScale, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.timing(submitScale, { toValue: 1, duration: 80, useNativeDriver: true }),
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