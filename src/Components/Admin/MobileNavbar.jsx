import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaUsers,
  FaCoins,
  FaChartBar,
  FaNewspaper,
  FaCommentAlt,
  FaCog,
  FaTimes, // Close icon
  FaChevronRight,
  FaUser,
  FaExchangeAlt,
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
        : "bg-gray-900/90 backdrop-blur-2xl border border-white/5 shadow-lg shadow-black/20",

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
    // Exact match for root admin, prefix for others
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
    // Fetch only if open to minimize background calls, or once on mount if preferred.
    // Keeping it simple like user nav
    if (isOpen) fetchStats();
  }, [isOpen]);

  const mainNavItems = menus.slice(0, 4);
  const moreNavItems = menus.slice(4);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-[1000] lg:hidden ${isLight ? "bg-white border-t border-gray-200" : "bg-gray-900 border-t border-gray-800"} pb-safe`}>
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
                <span className="text-[10px] font-medium">{item.name === "Cryptocurrencies" ? "Crypto" : item.name === "News Management" ? "News" : item.name}</span>
              </Link>
            );
          })}

          <button
            onClick={onToggle}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isOpen ? "text-cyan-500" : isLight ? "text-gray-500 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}
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
              className="fixed inset-0 z-[998] bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed bottom-16 left-0 right-0 z-[999] lg:hidden rounded-t-3xl overflow-hidden ${isLight ? "bg-white" : "bg-gray-900"} border-t ${isLight ? "border-gray-200" : "border-gray-700"}`}
              style={{ maxHeight: "80vh" }}
            >
              <div className="p-4 space-y-6">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-dashed dark:border-gray-800">
                  <div className={`w-10 h-10 rounded-full border-2 ${isLight ? "border-gray-200" : "border-gray-700"} overflow-hidden`}>
                    {user?.image ? (
                      <img src={user.image.startsWith("http") ? user.image : `${SERVER_URL}/uploads/${user.image}`} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center ${isLight ? "bg-gray-100" : "bg-gray-800"}`}><FaUser /></div>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold ${TC.textPrimary}`}>{user?.name || "Admin"}</h3>
                    <p className={`text-xs ${TC.textSecondary}`}>Administrator</p>
                  </div>
                  <button onClick={onToggle} className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FaTimes />
                  </button>
                </div>

                {/* More Menu Items */}
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

                {/* Stats Section */}
                <div className={`p-4 rounded-2xl ${isLight ? "bg-gray-50" : "bg-gray-800/50"}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">Platform Quick Stats</h4>
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-lg font-bold text-cyan-500">{dashboardStats.onlineUsers.toLocaleString()}</p>
                      <p className="text-[10px] opacity-70">Total Users</p>
                    </div>
                    <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-500">{dashboardStats.activeTrades.toLocaleString()}</p>
                      <p className="text-[10px] opacity-70">Trades Today</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default React.memo(MobileNavbar);
