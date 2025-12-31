import { useCallback } from "react";
import useThemeCheck from "./useThemeCheck";
import { toggleTheme, getInitialTheme } from "@/utils/theme-manager";

export const useTheme = () => {
    const isLight = useThemeCheck();
    
    // Wrapper for toggleTheme to ensure stable reference
    const toggleThemeFunc = useCallback(() => {
        toggleTheme();
    }, []);

    return {
        isDarkMode: !isLight,
        toggleTheme: toggleThemeFunc,
        isLight,
        getCurrentTheme: getInitialTheme
    };
};
