import { useEffect } from "react";
import { useSelector } from "react-redux";

const ThemeSync = () => {
  const { isDark } = useSelector((state) => state.theme);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return null;
};

export default ThemeSync;
