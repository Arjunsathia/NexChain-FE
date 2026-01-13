import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion"; // Added framer-motion
import {
  FaChartLine,
  FaUsers,
  FaCoins,
  FaNewspaper,
  FaCommentAlt,
  FaCog,
  FaUserShield,
  FaChevronRight,
  FaGlobe, // Icon for "Online"
} from "react-icons/fa";

import useThemeCheck from "@/hooks/useThemeCheck";
import useUserContext from "@/hooks/useUserContext";
import api, { SERVER_URL } from "@/api/axiosConfig";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";

function Sidebar() {
  const isLight = useThemeCheck();
  const location = useLocation();
  const { user } = useUserContext();
  const { visitedRoutes } = useVisitedRoutes();
  const [isMounted, setIsMounted] = useState(false);

  // Check if we have been to any admin page before to skip animation
  const hasVisitedAdmin = useMemo(() => {
    return Array.from(visitedRoutes).some((path) => path.startsWith("/admin"));
  }, [visitedRoutes]);

  // If visited, mount immediately. Else wait for 100ms.
  useEffect(() => {
    if (hasVisitedAdmin) {
      setIsMounted(true);
    } else {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasVisitedAdmin]);

  // Admin Data Specifics
  const [dashboardStats, setDashboardStats] = useState({
    onlineUsers: 0,
    activeTrades: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/purchases/platform-stats");
        if (res.data.success) {
          setDashboardStats({
            onlineUsers: res.data.stats.totalUsers,
            activeTrades: res.data.stats.tradesToday,
          });
        }
      } catch {
        // Silent fail
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgSidebar: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      bgStats: isLight
        ? "bg-gray-50/80 border border-gray-100"
        : "bg-gray-800/20", // Cleaner look for internal stats, no border

      menuItemBase: isLight
        ? "text-gray-600 hover:bg-gray-100/80"
        : "text-gray-400 hover:bg-white/5",

      // Gradients & Accents (Matching UserSidebar)
      activeGradient: "bg-gradient-to-r from-cyan-500 to-blue-500",
      activeGlow: isLight
        ? "shadow-[0_4px_14px_0_rgba(59,130,246,0.3)]"
        : "shadow-[0_4px_14px_0_rgba(6,182,212,0.3)]",
    }),
    [isLight],
  );

  const menus = [
    { name: "Dashboard", path: "/admin", icon: FaChartLine },
    { name: "Users", path: "/admin/users", icon: FaUsers },
    {
      name: "Cryptocurrencies",
      path: "/admin/cryptocurrencies",
      icon: FaCoins,
    },
    { name: "Feedback & Reports", path: "/admin/feedback", icon: FaCommentAlt },
    { name: "Settings", path: "/admin/settings", icon: FaCog },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    // General prefix match for others
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .slide-in { animation: slideIn 0.3s ease-out forwards; }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>

      {/* Mobile Top Sidebar Spacer (Used for layout offset if needed) */}
      <div className="lg:hidden w-full mb-4"></div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-72 h-[calc(100vh-2rem)] rounded-3xl p-6 sticky top-4 
          transition-transform duration-300 ease-out
          ${TC.bgSidebar}
          ${isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
        `}
      >
        {/* Profile Header */}
        <Link
          to="/admin/settings"
          className={`block mb-6 group relative z-10 shrink-0 ${hasVisitedAdmin ? "" : "slide-in"}`}
          style={hasVisitedAdmin ? {} : { animationDelay: "0s" }}
        >
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              <div
                className={`w-12 h-12 rounded-2xl overflow-hidden shadow-lg ${isLight ? "shadow-blue-500/20" : "shadow-black/40"} border-2 ${isLight ? "border-white" : "border-gray-700"}`}
              >
                {user?.image ? (
                  <img
                    src={
                      user.image.startsWith("http")
                        ? user.image
                        : `${SERVER_URL}/uploads/${user.image}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center font-bold text-lg ${isLight ? "bg-blue-50 text-blue-600" : "bg-gray-800 text-white"}`}
                  >
                    <FaUserShield />
                  </div>
                )}
              </div>
              {/* Status Dot */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            </motion.div>

            <div className="min-w-0">
              <h2
                className={`text-lg font-bold truncate ${TC.textPrimary} group-hover:text-cyan-500 transition-colors`}
              >
                {user?.name || "Admin"}
              </h2>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${TC.textSecondary}`}
              >
                Administrator <FaChevronRight size={10} />
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation - Flexible Height with invisible scroll if needed */}
        <nav className="flex-1 space-y-1.5 relative z-10 overflow-y-auto no-scrollbar pr-1 mb-4">
          {menus.map((item, index) => {
            const active = isActive(item.path);
            return (
              <div
                key={item.name}
                className={hasVisitedAdmin ? "" : "slide-in"}
                style={
                  hasVisitedAdmin
                    ? {}
                    : { animationDelay: `${0.05 + index * 0.03}s` }
                }
              >
                <Link
                  to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 group overflow-hidden ${active ? "" : TC.menuItemBase
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-xl ${TC.activeGradient} ${TC.activeGlow}`}
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  <span
                    className={`relative z-10 text-lg transition-colors duration-200 ${active ? "text-white" : isLight ? "text-gray-400 group-hover:text-blue-500" : "text-gray-500 group-hover:text-cyan-400"}`}
                  >
                    <item.icon />
                  </span>

                  <span
                    className={`relative z-10 font-medium text-sm transition-colors duration-200 ${active ? "text-white" : ""}`}
                  >
                    {item.name}
                  </span>

                  {active && (
                    <FaChevronRight className="relative z-10 ml-auto text-white/80 text-xs" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Bottom Stats Only */}
        <div
          className={`mt-auto pt-6 border-t border-dashed relative z-10 shrink-0 ${hasVisitedAdmin ? "" : "slide-in"}`}
          style={{
            borderColor: isLight ? "#e5e7eb" : "rgba(255,255,255,0.1)",
            ...(hasVisitedAdmin ? {} : { animationDelay: "0.2s" }),
          }}
        >
          {/* Quick Stats Grid - Admin Version */}
          <div className={`rounded-2xl p-4 ${TC.bgStats}`}>
            <p
              className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${TC.textTertiary}`}
            >
              Platform Stats
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-[10px] font-medium mb-0.5 ${TC.textSecondary}`}
                >
                  Total Users
                </p>
                <p className={`text-sm font-bold ${TC.textPrimary}`}>
                  {dashboardStats.onlineUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <p
                  className={`text-[10px] font-medium mb-0.5 ${TC.textSecondary}`}
                >
                  Trades Today
                </p>
                <p className={`text-sm font-bold ${TC.textPrimary}`}>
                  {dashboardStats.activeTrades.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[FaUsers, FaChartLine, FaGlobe].map((Icon, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isLight ? "border-white bg-gray-100 text-gray-400" : "border-gray-800 bg-gray-700 text-gray-400"}`}
                  >
                    <Icon size={10} />
                  </div>
                ))}
              </div>
              <span className={`text-[10px] font-medium ${TC.textSecondary}`}>
                System Active
              </span>
            </div>
          </div>
        </div>

        {/* Background Decor */}
      </aside>
    </>
  );
}

export default React.memo(Sidebar);
