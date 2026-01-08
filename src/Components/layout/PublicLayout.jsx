import { Outlet, useLocation } from "react-router-dom";
import useThemeCheck from "@/hooks/useThemeCheck";
import { useEffect } from "react";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import { motion } from "framer-motion";

export default function PublicLayout() {
  const isLight = useThemeCheck();
  const isDarkMode = !isLight;
  const { isVisited, markVisited } = useVisitedRoutes();
  const location = useLocation();

  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname, markVisited]);

  const shouldAnimate = !isVisited(location.pathname);

  const backgroundClass = isDarkMode
    ? "bg-gradient-to-br from-black via-[#0b182d] to-black"
    : "bg-gradient-to-tl from-white via-slate-50 to-blue-50";

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass} ${isDarkMode ? "text-white" : "text-gray-900"}`}>
      <main className="flex-1 p-4">
        <motion.div
          key={location.pathname}
          initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="w-full h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
