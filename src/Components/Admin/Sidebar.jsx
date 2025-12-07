import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaCoins,
  FaChartBar,
  FaNewspaper,
  FaCommentAlt,
  FaCog,
  FaUserShield,
  FaSignOutAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import useThemeCheck from "@/hooks/useThemeCheck";

// Logout Confirmation Modal
const LogoutConfirmationModal = ({ show, onClose, onConfirm, isLight, isLoading }) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${
              isLight ? "bg-white" : "bg-gray-800 border border-gray-700"
            }`}
          >
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isLight ? "bg-red-100" : "bg-red-500/20"
              }`}>
                <FaSignOutAlt className={`text-2xl ${isLight ? "text-red-600" : "text-red-400"}`} />
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-gray-900" : "text-white"}`}>
                Sign Out?
              </h3>
              
              <p className={`text-sm mb-6 ${isLight ? "text-gray-600" : "text-gray-400"}`}>
                Are you sure you want to sign out of your account?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${
                    isLight 
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    "Sign Out"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

function Sidebar({ onLogout, isLogoutLoading }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  // 💡 Theme Classes Helper - Matches User Dashboard
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    
    // Backgrounds & Borders
    bgSidebar: isLight 
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    bgMobile: isLight 
      ? "bg-white shadow-md" 
      : "bg-gray-800/90 backdrop-blur-md",

    // Header Colors
    headerIconBg: "bg-gradient-to-br from-cyan-500 to-blue-600",
    headerTitle: isLight ? "text-gray-900" : "text-white",

    // Menu Item Base
    menuItemBase: isLight 
      ? "text-gray-600 hover:bg-gray-50 hover:text-blue-600" 
      : "text-gray-400 hover:bg-white/5 hover:text-white",

    // Menu Item Active
    menuItemActive: isLight 
      ? "bg-blue-50 text-blue-700 shadow-sm" 
      : "bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
    
    // Icons
    iconActive: isLight ? "text-blue-600" : "text-cyan-400",
    iconInactive: isLight ? "text-gray-400" : "text-gray-500",
    
    // Stats
    bgStatCard: isLight ? "bg-gray-50" : "bg-gray-900/50",
    bgStatItem: isLight ? "bg-white shadow-sm" : "bg-black/20",
    
    // Logout
    btnLogout: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl",
  }), [isLight]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

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
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const adminStats = [
    { label: "Online Users", value: "1.2K", color: "text-green-400", icon: FaUsers },
    { label: "Active Trades", value: "247", color: "text-cyan-400", icon: FaChartLine },
  ];

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .slide-in { animation: slideIn 0.5s ease-out forwards; }
      `}</style>

      {/* Mobile Version */}
      <div className={`w-full lg:hidden ${TC.bgMobile} rounded-xl mb-4 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl ${TC.headerIconBg} flex items-center justify-center shadow-lg shadow-cyan-500/20`}>
              <FaUserShield className="text-white text-lg" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${TC.headerTitle}`}>Admin Panel</h2>
              <p className={`text-xs ${TC.textSecondary}`}>Platform Management</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {menus.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`
                  flex items-center justify-between p-3 rounded-lg transition-all duration-200
                  ${isActive(item.path) ? TC.menuItemActive : TC.menuItemBase}
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={isActive(item.path) ? TC.iconActive : TC.iconInactive} />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                {isActive(item.path) && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"></div>}
              </Link>
            ))}
          </nav>

          {/* Mobile Logout */}
          <div className="mt-4 pt-4 border-t border-gray-200/10">
            <button
              className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${TC.btnLogout}`}
              onClick={handleLogoutClick}
              disabled={isLogoutLoading}
            >
              {isLogoutLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <FaSignOutAlt /> Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col w-72 h-[calc(100vh-2rem)] rounded-3xl p-6
          transition-all duration-500 ease-out sticky top-4
          ${TC.bgSidebar}
          ${isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 slide-in" style={{ animationDelay: '0.1s' }}>
          <div className={`w-12 h-12 rounded-2xl ${TC.headerIconBg} flex items-center justify-center shadow-lg shadow-cyan-500/20 transform hover:scale-105 transition-transform`}>
            <FaUserShield className="text-white text-xl" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${TC.headerTitle} tracking-tight`}>Admin Panel</h2>
            <p className={`text-xs ${TC.textSecondary} font-medium`}>v2.4.0 • Stable</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
          {menus.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`
                group flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 relative overflow-hidden
                ${isActive(item.path) ? TC.menuItemActive : TC.menuItemBase}
                slide-in
              `}
              style={{ animationDelay: `${0.15 + index * 0.05}s` }}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <item.icon 
                  className={`
                    text-lg transition-transform duration-300 
                    ${isActive(item.path) ? `${TC.iconActive} scale-110` : `${TC.iconInactive} group-hover:scale-110 group-hover:text-gray-300`}
                  `} 
                />
                <span className={`font-medium tracking-wide ${isActive(item.path) ? "font-semibold" : ""}`}>
                  {item.name}
                </span>
              </div>
              
              {/* Active Indicator */}
              {isActive(item.path) && (
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan] animate-pulse"></div>
                </div>
              )}
              
              {/* Hover Glow Effect */}
              {!isActive(item.path) && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Stats Card */}
        <div className={`mt-6 p-4 rounded-2xl ${TC.bgStatCard} slide-in`} style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary}`}>System Status</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {adminStats.map((stat, i) => (
              <div key={i} className={`${TC.bgStatItem} rounded-lg p-2.5`}>
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`text-xs ${stat.color}`} />
                  <span className={`text-[10px] ${TC.textSecondary}`}>{stat.label}</span>
                </div>
                <span className={`text-sm font-bold ${TC.textPrimary}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-4 slide-in" style={{ animationDelay: '0.6s' }}>
          <button
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:disabled:scale-100 flex items-center justify-center gap-2 ${TC.btnLogout} transform hover:scale-105`}
            onClick={handleLogoutClick}
            disabled={isLogoutLoading}
          >
            {isLogoutLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <FaSignOutAlt /> Logout
              </>
            )}
          </button>
        </div>
      </aside>

      <LogoutConfirmationModal 
        show={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={confirmLogout} 
        isLight={isLight} 
        isLoading={isLogoutLoading} 
      />
    </>
  );
}

export default Sidebar;