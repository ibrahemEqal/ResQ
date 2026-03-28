/**
 * index.tsx
 * Single Responsibility: Composition root for the Report screen.
 * This file ONLY:
 *   1. Calls useReportStore() to get all state + handlers
 *   2. Runs the entrance animation on mount
 *   3. Renders layout (SafeAreaView, ScrollView, section labels)
 *   4. Passes the correct slices of state to each child component
 *
 * Zero business logic lives here — no useState, no Alert, no submitReport.
 */

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";

// ── Child components ─────────────────────────
import CategoryGrid from "../../components/CategoryGrid";
import DescriptionInput from "../../components/DescriptionInput";
import LocationButton from "../../components/LocationButton";
import MediaButton from "../../components/MediaButton";
import SubmitButton from "../../components/SubmitButton";

// ── State manager ────────────────────────────
import { useReportStore } from "./useReportStore";

// ─────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────
export default function ReportScreen() {
  // Destructure every piece of state and every handler from the store.
  // This is the ONLY place useReportStore is called.
  const {
    selectedCategory,
    description,
    location,
    mediaFile,
    locationLoading,
    mediaLoading,
    submitting,
    fadeAnim,
    slideAnim,
    submitScale,
    setSelectedCategory,
    setDescription,
    handleGetLocation,
    handlePickMedia,
    handleSubmit,
  } = useReportStore();

  // ── Entrance animation ───────────────────────
  // Slides content up and fades it in when the screen mounts.
  // The animation refs live in the store; we only start them here.
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

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.flex,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Page title ── */}
          <View style={styles.titleBlock}>
            <Text style={styles.pageTitle}>بلاغ طارئ</Text>
            <Text style={styles.pageSubtitle}>
              أدخل تفاصيل الحادث وأرسل البلاغ فوراً
            </Text>
          </View>

          {/* ══ Section 1: Category ══════════════════ */}
          <SectionLabel icon="grid" title="نوع الطارئ" required />
          <CategoryGrid
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />

          {/* ══ Section 2: Description ═══════════════ */}
          <SectionLabel icon="create" title="وصف الحادث" />
          <DescriptionInput value={description} onChange={setDescription} />

          {/* ══ Section 3: Location + Media ══════════ */}
          <SectionLabel icon="attach" title="الموقع والوسائط" />
          <View style={styles.actionRow}>
            <LocationButton
              location={location}
              loading={locationLoading}
              onPress={handleGetLocation}
            />
            <MediaButton
              mediaFile={mediaFile}
              loading={mediaLoading}
              onPress={handlePickMedia}
            />
          </View>

          {/* ══ Submit + Cancel ═══════════════════════ */}
          <SubmitButton
            submitting={submitting}
            disabled={!selectedCategory} // disabled until a category is chosen
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
