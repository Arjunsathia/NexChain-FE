import { Outlet } from "react-router-dom";
import useThemeCheck from "@/hooks/useThemeCheck";

export default function PublicLayout() {
  const isLight = useThemeCheck();
  const isDarkMode = !isLight;

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
