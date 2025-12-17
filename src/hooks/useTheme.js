import { useCallback } from "react";
import { toggleTheme, getInitialTheme } from "@/utils/theme-manager";

export const useTheme = () => {
  // We don't track state here to avoid re-renders. 
  // If a component truly needs to know the theme for JS logic (charts), 
  // it should use a specific hook that listens to mutation observer or event.
  // But for simple toggling, this is sufficient.
  
  const toggleThemeFunc = useCallback(() => {
    toggleTheme();
  }, []);

  return {
    toggleTheme: toggleThemeFunc,
    // Provide a getter but note it won't trigger re-renders on change
    getCurrentTheme: getInitialTheme
  };
};
