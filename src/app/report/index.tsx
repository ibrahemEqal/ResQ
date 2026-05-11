import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { EmergencyType, ReportPriority } from "../../types";

import CategoryGrid from "@/app/ـcomponents/report-components/CategoryGrid";
import DescriptionInput from "@/app/ـcomponents/report-components/DescriptionInput";
import CollegePicker from "@/app/ـcomponents/report-components/LocationButton";
import MediaButton from "@/app/ـcomponents/report-components/MediaButton";
import SubmitButton from "@/app/ـcomponents/report-components/SubmitButton";

import { useReportStore } from "./useReportStore";

export default function ReportScreen() {
  const {
    priority,
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
    handleSubmit: triggerMutation,
  } = useReportStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "" as unknown as EmergencyType,
      description: "",
      college: "",
    },
  });

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [audioBusy, setAudioBusy] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

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
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    return () => {
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
    };
  }, []);

  const startRecording = async () => {
    if (audioBusy || recordingRef.current) return;

    try {
      setAudioBusy(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("تنبيه", "يجب إعطاء صلاحية الميكروفون لتسجيل الصوت");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      await rec.startAsync();

      recordingRef.current = rec;
      setAudioUri(null);
      setRecording(rec);
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذر بدء التسجيل الصوتي");
    } finally {
      setAudioBusy(false);
    }
  };

  const stopRecording = async () => {
    const currentRecording = recordingRef.current ?? recording;
    if (!currentRecording || audioBusy) return;

    try {
      setAudioBusy(true);
      await currentRecording.stopAndUnloadAsync();
      const uri = currentRecording.getURI();

      setAudioUri(uri || null);
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذر حفظ التسجيل الصوتي");
    } finally {
      recordingRef.current = null;
      setRecording(null);
      setAudioBusy(false);
    }
  };

  const playSound = async () => {
    if (!audioUri || audioBusy) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.error(err);
      Alert.alert("خطأ", "تعذر تشغيل التسجيل الصوتي");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.flex,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {(error || errors.category || errors.description) && (
          <View style={bannerStyles.container}>
            <Ionicons name="alert-circle" size={18} color="#FFF" />
            <Text style={bannerStyles.text}>
              {error ||
                (errors.category
                  ? "يرجى اختيار نوع الطارئ"
                  : "يرجى كتابة وصف للحادث (5 أحرف على الأقل)")}
            </Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>بلاغ طارئ</Text>
            <Text style={styles.pageSubtitle}>
              أدخل تفاصيل الحادث وأرسل البلاغ فوراً
            </Text>
          </View>

          <SectionLabel icon="grid" title="نوع الطارئ" required />
          <Controller
            control={control}
            name="category"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <CategoryGrid
                selectedCategory={value as any}
                onSelect={(val) => {
                  onChange(val);
                  setSelectedCategory(val as any);
                }}
              />
            )}
          />
          {priority && <PrioritySummary priority={priority} />}

          <SectionLabel icon="create" title="وصف الحادث" required />
          <Controller
            control={control}
            name="description"
            rules={{ required: true, minLength: 5 }}
            render={({ field: { onChange, value } }) => (
              <DescriptionInput
                value={value}
                onChange={(val) => {
                  onChange(val);
                  setDescription(val);
                }}
              />
            )}
          />

          <SectionLabel icon="attach" title="الكلية والوسائط" />
          <View style={styles.actionRow}>
            <CollegePicker
              selectedCollege={selectedCollege}
              onSelect={setSelectedCollege}
            />
            <MediaButton
              mediaFile={mediaFile}
              loading={mediaLoading}
              onPress={handlePickMedia}
            />
          </View>

          <SectionLabel icon="mic" title="تسجيل صوتي" />
          <View style={audioStyles.wrapper}>
            <TouchableOpacity
              style={[
                audioStyles.recordButton,
                recording && audioStyles.recordButtonActive,
              ]}
              onPress={recording ? stopRecording : startRecording}
              disabled={audioBusy}
              activeOpacity={0.85}
            >
              {audioBusy ? (
                <ActivityIndicator
                  color={recording ? "#FFF" : COLORS.primary}
                  size="small"
                />
              ) : (
                <Ionicons
                  name={recording ? "stop-circle" : "mic"}
                  size={24}
                  color={recording ? "#FFF" : COLORS.primary}
                />
              )}
              <Text
                style={[
                  audioStyles.recordText,
                  recording && audioStyles.recordTextActive,
                ]}
              >
                {recording
                  ? "إيقاف التسجيل"
                  : audioUri
                    ? "تسجيل جديد"
                    : "بدء التسجيل"}
              </Text>
            </TouchableOpacity>

            {audioUri && !recording && (
              <TouchableOpacity
                style={audioStyles.playButton}
                onPress={playSound}
                disabled={audioBusy}
                activeOpacity={0.85}
              >
                <Ionicons name="play-circle" size={22} color={COLORS.success} />
                <Text style={audioStyles.playText}>تشغيل التسجيل</Text>
              </TouchableOpacity>
            )}

            <Text style={audioStyles.statusText}>
              {recording
                ? "جاري التسجيل..."
                : audioUri
                  ? "تم حفظ التسجيل محليًا ويمكنك تشغيله"
                  : "يمكنك إضافة تسجيل صوتي قصير يوضح تفاصيل البلاغ"}
            </Text>
          </View>

          <SubmitButton
            submitting={submitting}
            disabled={locationLoading || audioBusy || Boolean(recording)}
            submitScale={submitScale}
            onSubmit={triggerMutation}
            onCancel={() => router.back()}
          />
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

export function SectionLabel({
  icon,
  title,
  required,
}: {
  icon: string;
  title: string;
  required?: boolean;
}) {
  return (
    <View style={labelStyles.row}>
      <Ionicons name={icon as any} size={16} color={COLORS.primary} />
      <Text style={labelStyles.title}>{title}</Text>
      {required && <Text style={labelStyles.required}>*</Text>}
    </View>
  );
}

function PrioritySummary({ priority }: { priority: ReportPriority }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <View style={[priorityRow.wrapper, { backgroundColor: cfg.bg }]}>
      <View style={[priorityRow.dot, { backgroundColor: cfg.dot }]} />
      <Text style={priorityRow.label}>الأولوية:</Text>
      <Text style={[priorityRow.value, { color: cfg.text }]}>{priority}</Text>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    padding: 12,
    gap: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "right",
  },
});

const priorityRow = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 10,
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary },
  value: { fontSize: 13, fontWeight: "900" },
});

const audioStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 14,
    gap: 10,
  },
  recordButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
  },
  recordButtonActive: {
    backgroundColor: COLORS.primary,
    borderStyle: "solid",
  },
  recordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  recordTextActive: {
    color: "#FFF",
  },
  playButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
  },
  playText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: "800",
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
});

const labelStyles = StyleSheet.create({
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

const PRIORITY_CONFIG: Record<
  ReportPriority,
  { dot: string; text: string; bg: string }
> = {
  Critical: { dot: "#EF4444", text: "#EF4444", bg: "#FFEDED" },
  High: { dot: "#DC2626", text: "#DC2626", bg: "#FEE2E2" },
  Medium: { dot: "#F59E0B", text: "#F59E0B", bg: "#FFFBEB" },
  Low: { dot: "#6B7280", text: "#6B7280", bg: "#F3F4F6" },
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 24, width: "100%", maxWidth: 450, alignSelf: "center" },
  titleBlock: { marginBottom: 8, marginTop: 10 },
  pageTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.textPrimary,
    textAlign: "right",
  },
  pageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },
  actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 14 },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    gap: 8,
    marginTop: 10,
  },
  locationBtnActive: { backgroundColor: COLORS.primary, borderStyle: "solid" },
  locationBtnText: { fontWeight: "bold", color: COLORS.primary },
});
