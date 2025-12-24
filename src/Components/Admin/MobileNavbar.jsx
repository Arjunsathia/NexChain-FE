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
  FaExchangeAlt
} from "react-icons/fa";
import { HiMenuAlt3 } from "react-icons/hi"; // Modern menu icon

import useThemeCheck from "@/hooks/useThemeCheck";
import useUserContext from "@/hooks/useUserContext";
import api, { SERVER_URL } from "@/api/axiosConfig";

function MobileNavbar({ isOpen, onToggle }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const { user } = useUserContext();


  const TC = useMemo(() => ({
    // Glassmorphism & Backgrounds
    navContainer: isLight
      ? "bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm"
      : "bg-gray-900/80 backdrop-blur-xl border border-white/5 shadow-lg",

    // Typography
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textAccent: "text-blue-500",

    // Interactive Elements
    itemHover: isLight ? "hover:bg-gray-100" : "hover:bg-white/5",
    activeItem: isLight
      ? "bg-blue-50 text-blue-600 shadow-inner"
      : "bg-blue-500/10 text-blue-400 border border-blue-500/10",

    // Stats Cards
    statCard: isLight
      ? "bg-gray-50 border border-gray-100"
      : "bg-black/20 border border-white/5",
  }), [isLight]);

  // Admin Sidebar Menus
  const menus = [
    { name: "Dashboard", path: "/admin", icon: FaChartLine },
    { name: "Users", path: "/admin/users", icon: FaUsers },
    { name: "Cryptocurrencies", path: "/admin/cryptocurrencies", icon: FaCoins },
    { name: "Market Insights", path: "/admin/insights", icon: FaChartBar },
    { name: "News Management", path: "/admin/news", icon: FaNewspaper },
    { name: "Feedback & Reports", path: "/admin/feedback", icon: FaCommentAlt },
    { name: "Settings", path: "/admin/settings", icon: FaCog },
  ];

  const isActive = (path) => {
    // Exact match for root admin, prefix for others
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  // Admin Stats Data
  const [dashboardStats, setDashboardStats] = useState({ onlineUsers: 0, activeTrades: 0 });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/purchases/platform-stats');
        if (res.data.success) {
          setDashboardStats({
            onlineUsers: res.data.stats.totalUsers,
            activeTrades: res.data.stats.tradesToday
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

  const liveStats = [
    { label: "Total Users", value: dashboardStats.onlineUsers.toLocaleString(), icon: FaUsers, color: "text-blue-500" },
    { label: "Trades Today", value: dashboardStats.activeTrades.toLocaleString(), icon: FaExchangeAlt, color: "text-green-500" },
  ];

  return (
    <div className="lg:hidden sticky top-4 z-[999] px-4 mb-6">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl transition-all duration-300 relative z-[999] overflow-hidden ${TC.navContainer} ${isOpen ? 'ring-2 ring-blue-500/20' : ''}`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 pl-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="relative group">
              <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isLight ? 'border-gray-200' : 'border-gray-700'} shadow-sm`}>
                {user?.image ? (
                  <img
                    src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-gray-400'}`}>
                    <FaUser size={14} />
                  </div>
                )}
              </div>
              <div className="absolute lg:block bottom-0 right-0 w-3 h-3 bg-cyan-400 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
            </Link>

            <div className="leading-tight">
              <h2 className={`text-sm font-bold ${TC.textPrimary}`}>
                {user?.name || "Admin"}
              </h2>
              <p className={`text-[10px] font-medium ${TC.textSecondary} uppercase tracking-wide`}>
                Administrator
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${isOpen
              ? "bg-red-500/10 text-red-500" // Active Close State
              : isLight ? "bg-gray-100 text-gray-700" : "bg-white/5 text-gray-300"
              }`}
          >
            {isOpen ? <FaTimes size={18} /> : <HiMenuAlt3 size={22} />}
          </motion.button>
        </div>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}
            >
              <div className="p-4 space-y-6">
                {/* Navigation Links */}
                <div className="space-y-1">
                  {menus.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Link
                          to={item.path}
                          onClick={onToggle}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all ${active ? TC.activeItem : TC.itemHover
                            } group`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-lg bg-clip-text ${active ? TC.textAccent : "text-gray-400"}`}>
                              <item.icon />
                            </span>
                            <span className={`font-medium text-sm ${active ? TC.textPrimary : TC.textSecondary} group-hover:${TC.textPrimary}`}>
                              {item.name}
                            </span>
                          </div>
                          {active && <FaChevronRight size={10} className="text-blue-500" />}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Quick Stats Grid */}
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${TC.textSecondary}`}>
                    Platform Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {liveStats.map((stat) => (
                      <motion.div
                        key={stat.label}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.1 }}
                        className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1.5 ${TC.statCard}`}
                      >
                        <stat.icon className={`text-sm ${stat.color}`} />
                        <div className={`font-bold text-sm ${TC.textPrimary}`}>{stat.value}</div>
                        <div className={`text-[10px] font-medium ${TC.textSecondary}`}>{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Removed Logout Button as requested */}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Backdrop for closing when clicking outside (Screen Cover) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            style={{ top: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(MobileNavbar);
