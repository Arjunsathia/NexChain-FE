import { useState, useEffect } from "react";
import { getInitialTheme } from "@/utils/theme-manager";

const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(() => {
    
    if (typeof window !== "undefined") {
        return (document.documentElement.getAttribute("data-theme") || getInitialTheme()) === 'light';
    }
    return false;
  });

  useEffect(() => {
    const handleThemeChange = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        setIsLight(currentTheme === 'light');
    };

    window.addEventListener('theme-change', handleThemeChange);
    
    window.addEventListener('storage', handleThemeChange);

    return () => {
        window.removeEventListener('theme-change', handleThemeChange);
        window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  return isLight;
};

export default useThemeCheck;
