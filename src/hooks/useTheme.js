import { useSelector, useDispatch } from "react-redux";
import { toggleTheme } from "@/redux/slices/themeSlice";
import { useCallback } from "react";

export const useTheme = () => {
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  
  const toggleThemeFunc = useCallback(() => dispatch(toggleTheme()), [dispatch]);

  return {
    isDark,
    toggleTheme: toggleThemeFunc
  };
};
