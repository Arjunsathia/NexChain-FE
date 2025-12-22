import { useCallback } from "react";
import { toggleTheme, getInitialTheme } from "@/utils/theme-manager";

export const useTheme = () => {
  
  
  
  
  
  const toggleThemeFunc = useCallback(() => {
    toggleTheme();
  }, []);

  return {
    toggleTheme: toggleThemeFunc,
    
    getCurrentTheme: getInitialTheme
  };
};
