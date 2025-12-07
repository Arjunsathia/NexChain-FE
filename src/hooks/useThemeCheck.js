import { useTheme } from "@/Context/ThemeContext";

const useThemeCheck = () => {
  try {
    const { isDark } = useTheme();
    return !isDark;
  } catch (e) {
    // Fallback if used outside provider (though unlikely in this app)
    return !document.documentElement.classList.contains("dark");
  }
};

export default useThemeCheck;
