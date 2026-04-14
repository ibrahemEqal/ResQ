import { COLORS } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
        <View style={styles.filters}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    filters: {
        flexDirection: "row-reverse",
        margin: 16,
    },
    btn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginLeft: 8,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
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