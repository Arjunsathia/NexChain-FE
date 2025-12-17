import { useSelector } from "react-redux";

const useThemeCheck = () => {
  const isDark = useSelector((state) => state.theme?.isDark);
  return !isDark;
};

export default useThemeCheck;
