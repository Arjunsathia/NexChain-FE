import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

export default function PublicLayout() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const backgroundClass = isDarkMode
    ? "bg-gradient-to-br from-black via-[#0b182d] to-black"
    : "bg-gradient-to-tl from-white via-slate-50 to-blue-50";

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass} ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
