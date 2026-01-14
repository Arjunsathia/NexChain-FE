import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaUsers,
  FaCoins,
  FaCommentAlt,
  FaCog,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { HiMenuAlt3 } from "react-icons/hi"; // Modern menu icon

import useThemeCheck from "@/hooks/useThemeCheck";
import useUserContext from "@/hooks/useUserContext";
import api, { SERVER_URL } from "@/api/axiosConfig";

function MobileNavbar({ isOpen, onToggle }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const { user } = useUserContext();

  const TC = useMemo(
    () => ({
      // Glassmorphism & Backgrounds
      navContainer: isLight
        ? "bg-gradient-to-b from-white/90 to-blue-50/90 backdrop-blur-2xl border border-white/50 shadow-lg shadow-blue-500/5"
        : "bg-gray-900/95 backdrop-blur-2xl border border-white/5 shadow-lg shadow-black/20",

      // Typography
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-slate-500" : "text-slate-400",
      textAccent: "text-blue-500",

      // Interactive Elements
      itemHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",
      activeItem: isLight
        ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 shadow-sm border border-blue-100"
        : "bg-gradient-to-r from-blue-900/20 to-cyan-900/20 text-cyan-400 border border-blue-500/10",

      // Stats Cards
      statCard: isLight
        ? "bg-white/60 border border-blue-100 shadow-sm backdrop-blur-md"
        : "bg-white/5 border border-white/5 shadow-inner backdrop-blur-md",
    }),
    [isLight],
  );

  // Admin Sidebar Menus
  const menus = [
    { name: "Dashboard", path: "/admin", icon: FaChartLine },
    { name: "Users", path: "/admin/users", icon: FaUsers },
    {
      name: "Cryptocurrencies",
      path: "/admin/cryptocurrencies",
      icon: FaCoins,
    },
    { name: "Feedback", path: "/admin/feedback", icon: FaCommentAlt },
    { name: "Settings", path: "/admin/settings", icon: FaCog },
  ];

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  // Admin Stats Data
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
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    };
    if (isOpen) fetchStats();
  }, [isOpen]);

  const mainNavItems = menus.slice(0, 4);
  const moreNavItems = menus.slice(4);

  return createPortal(
    <>
      {/* Bottom Navigation Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[1000] lg:hidden ${isLight ? "bg-white border-t border-gray-200" : "bg-gray-900 border-t border-gray-800"} pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]`}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? "text-cyan-500" : isLight ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}
              >
                <item.icon className={`text-xl ${active ? "animate-bounce-short" : ""}`} />
                <span className="text-[10px] font-medium">{item.name === "Cryptocurrencies" ? "Crypto" : item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={onToggle}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isLight ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}
          >
            <HiMenuAlt3 className="text-xl" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* Menu / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 z-[998] bg-black/60 lg:hidden sm:backdrop-blur-sm"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", ease: "easeOut", duration: 0.25 }}
              className={`fixed bottom-16 left-0 right-0 z-[999] lg:hidden rounded-t-3xl overflow-hidden transform-gpu ${isLight ? "bg-white" : "bg-gray-900"} border-t ${isLight ? "border-gray-200" : "border-gray-700"} shadow-[0_-20px_50px_rgba(0,0,0,0.3)]`}
              style={{
                maxHeight: "calc(85vh - 4rem)",
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="p-4 space-y-5">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-dashed dark:border-gray-800 mb-2">
                  <div className={`w-10 h-10 rounded-full border-2 ${isLight ? "border-gray-200" : "border-gray-700"} overflow-hidden`}>
                    {user?.image ? (
                      <img src={user.image.startsWith("http") ? user.image : `${SERVER_URL}/uploads/${user.image}`} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isLight ? "bg-gray-100" : "bg-gray-800"}`}><FaUser /></div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold ${TC.textPrimary}`}>{user?.name || "Admin"}</h3>
                    <p className={`text-xs ${TC.textSecondary}`}>Administrator Account</p>
                  </div>
                  <button onClick={onToggle} className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FaTimes />
                  </button>
                </div>

                {/* More Menu Items */}
                {moreNavItems.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {moreNavItems.map(item => {
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={onToggle}
                          className={`p-4 rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all ${active ? "bg-cyan-500/10 text-cyan-500 ring-1 ring-cyan-500/50" : isLight ? "bg-gray-50 text-gray-600 hover:bg-gray-100" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                        >
                          <item.icon className="text-xl" />
                          <span className="text-xs font-bold">{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}

                {/* Stats Section */}
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${TC.textSecondary}`}>Platform Quick Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 ${TC.statCard}`}>
                      <div className={`font-bold text-sm ${TC.textPrimary}`}>{dashboardStats.onlineUsers.toLocaleString()}</div>
                      <div className={`text-[10px] font-medium ${TC.textSecondary}`}>Total Users</div>
                    </div>
                    <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 ${TC.statCard}`}>
                      <div className={`font-bold text-sm ${TC.textPrimary}`}>{dashboardStats.activeTrades.toLocaleString()}</div>
                      <div className={`text-[10px] font-medium ${TC.textSecondary}`}>Trades Today</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}

export default React.memo(MobileNavbar);
