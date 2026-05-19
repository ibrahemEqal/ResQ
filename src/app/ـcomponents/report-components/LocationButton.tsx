import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLLEGES = [
  "مسرح المصري",
  "المكتبة",
  "مدرج الأمير تركي",
  "كلية الفنون",
  "مركز اللغات (الكوري)",
  "المراكز العلمية",
  "كلية القانون",
  "كلية الطب",
  "كلية الصيدلة",
  "كلية الهندسة وتكنولوجيا المعلومات",
  "كلية العلوم",
  "المسجد",
  "الأمن",
  "الصالة الرياضية",
  "الملعب",
  "الساحة البيضاء",
];

interface Props {
  selectedCollege: string | null;
  onSelect: (college: string) => void;
}

export default function CollegePicker({ selectedCollege, onSelect }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (college: string) => {
    onSelect(college);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.btn, selectedCollege && styles.btnActive]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={selectedCollege ? "school" : "school-outline"}
          size={26}
          color={selectedCollege ? COLORS.secondary : COLORS.textSecondary}
        />

        <Text style={[styles.label, selectedCollege && styles.labelActive]}>
          {selectedCollege ? "الكلية المحددة" : "اختر الكلية"}
        </Text>

        {selectedCollege && (
          <Text style={styles.selected} numberOfLines={2}>
            {selectedCollege}
          </Text>
        )}

        <Ionicons
          name="chevron-down"
          size={16}
          color={selectedCollege ? COLORS.secondary : COLORS.textSecondary}
          style={styles.chevron}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.sheetTitle}>اختر الكلية</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {COLLEGES.map((college) => {
              const isActive = selectedCollege === college;
              return (
                <TouchableOpacity
                  key={college}
                  style={[styles.option, isActive && styles.optionActive]}
                  onPress={() => handleSelect(college)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isActive && styles.optionTextActive,
                    ]}
                  >
                    {college}
                  </Text>
                  {isActive && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.secondary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
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
  btnActive: {
    borderColor: COLORS.secondary,
    borderStyle: "solid",
    backgroundColor: "#EBF5FF",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: "center",
  },
  labelActive: {
    color: COLORS.secondary,
  },
  selected: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 16,
  },
  chevron: {
    marginTop: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: "70%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: "#F8F9FA",
  },
  optionActive: {
    backgroundColor: "#EBF5FF",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "right",
    flex: 1,
  },
  optionTextActive: {
    color: COLORS.secondary,
    fontWeight: "700",
  },
});
