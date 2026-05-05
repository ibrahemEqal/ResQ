import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";
import { ReportPriority } from "../../types";

import CategoryGrid from "@/components/report-components/CategoryGrid";
import DescriptionInput from "@/components/report-components/DescriptionInput";
import CollegePicker from "@/components/report-components/LocationButton";
import MediaButton from "@/components/report-components/MediaButton";
import SubmitButton from "@/components/report-components/SubmitButton";

import { useReportStore } from "@/lib/report/useReportStore";

export default function ReportScreen() {
  const {
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
  } = useReportStore();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.flex,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {error && (
          <View style={banner.container}>
            <Ionicons
              name="alert-circle"
              size={18}
              color="#FFF"
              style={banner.icon}
            />
            <Text style={banner.text}>{error}</Text>
            <TouchableOpacity
              onPress={clearError}
              style={banner.closeBtn}
              hitSlop={8}
            >
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
          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
          {priority && <PrioritySummary priority={priority} />}

          <SectionLabel icon="create" title="وصف الحادث" />
          <DescriptionInput value={description} onChange={setDescription} />

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

          <SubmitButton
            submitting={submitting}
            disabled={!selectedCategory}
            submitScale={submitScale}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const banner = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  icon: {
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "right",
    lineHeight: 19,
  },
  closeBtn: {
    flexShrink: 0,
    padding: 2,
  },
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

const priorityRow = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 4,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});

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
    <View style={label.row}>
      <Ionicons name={icon as any} size={16} color={COLORS.primary} />
      <Text style={label.title}>{title}</Text>
      {required && <Text style={label.required}>*</Text>}
    </View>
  );
}

const label = StyleSheet.create({
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: 24,
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
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
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
});