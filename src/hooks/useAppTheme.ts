import { useTheme } from "@/context/ThemeContext";

export const useAppTheme = () => {
    const { isDark, toggleTheme } = useTheme();

    const colors = {
        background: isDark ? "#0F172A" : "#F8F9FA",
        surface: isDark ? "#1E293B" : "#FFFFFF",
        text: isDark ? "#F8FAFC" : "#1E293B",
        subText: isDark ? "#94A3B8" : "#64748B",
        border: isDark ? "#334155" : "#E2E8F0",
        primary: "#FF4B2B",
        primaryLight: isDark ? "#2D1B1B" : "#FFEDED",
    };

    return { isDark, toggleTheme, colors };
};