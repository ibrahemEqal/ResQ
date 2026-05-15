import { COLORS } from "@/constants/colors";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { ReportStatus } from "@/types";

type Props = {
    filter: ReportStatus | "All";
    setFilter: (f: ReportStatus | "All") => void;
};

export default function Filters({ filter, setFilter }: Props) {
    const tabs: (ReportStatus | "All")[] = [
        "All",
        "Open",
        "In Progress",
        "Resolved",
        "Critical",
    ];

    const getStatusText = (status: string) => {
        switch (status) {
            case "Open":
                return "مفتوح";
            case "In Progress":
                return "قيد المعالجة";
            case "Resolved":
                return "تم الحل";
            case "Critical":
                return "حرج";
            default:
                return "الكل";
        }
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
        >
            {tabs.map((tab) => {
                const isActive = filter === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.btn, isActive && styles.activeBtn]}
                        onPress={() => setFilter(tab)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.text, isActive && styles.activeText]}>
                            {getStatusText(tab)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    filters: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    btn: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        marginRight: 8,
        backgroundColor: COLORS.background,
        borderRadius: 10,
    },
    activeBtn: {
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        borderColor: "#FF3B30",
    },
    text: {
        color: "#000000",
        fontSize: 13,
        fontWeight: "600",
    },
    activeText: {
        color: "#ffffff",
    },
});