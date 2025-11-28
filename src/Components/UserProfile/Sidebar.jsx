import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaCode, 
  FaCommentDots, 
  FaWallet, 
  FaCoins, 
  FaStar,
  FaChevronRight,
  FaChartLine,
  FaSignOutAlt,
  FaCog
} from "react-icons/fa";
import { logout } from "@/api/axiosConfig";
import useUserContext from '@/Context/UserContext/useUserContext';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWatchlist } from '@/hooks/useWatchlist';

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};

import { createPortal } from "react-dom";

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

export default function Sidebar({ onLogout, isLogoutLoading }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { purchasedCoins } = usePurchasedCoins() || { purchasedCoins: [] };
  const { watchlist } = useWatchlist() || { watchlist: [] };

  // 💡 Theme Classes Helper - Matches Admin Sidebar
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    
    // Backgrounds & Borders
    bgSidebar: isLight ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    bgMobile: isLight ? "bg-white shadow-md border-none" : "bg-gray-800/90 backdrop-blur-md border-none",

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
    bgStatCard: isLight ? "bg-gray-50 border-none" : "bg-gray-900/50 border-none",
    bgStatItem: isLight ? "bg-white border-none shadow-sm" : "bg-black/20 border-none shadow-inner",
    
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
    { name: "Overview", path: `/user-profile/${user?.id}`, icon: FaChartLine },
    { name: "Settings", path: "/user/settings", icon: FaCog },
    { name: "API Keys", path: "/user/api", icon: FaCode },
    { name: "Support", path: "/user/support", icon: FaCommentDots },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const { totalCoins, currentValue } = useMemo(() => {
    const coins = Array.isArray(purchasedCoins) ? purchasedCoins : [];
    
    // Filter out coins with 0 quantity (sold out)
    const activeCoins = coins.filter(coin => {
        const qty = Number(coin.totalQuantity) || Number(coin.quantity) || 0;
        return qty > 0;
    });

    const uniqueCoins = new Set(activeCoins.map(coin => coin.coinId || coin.coin_id)).size;

    let currentVal = 0;

    activeCoins.forEach(coin => {
      // Use currentPrice from the hook's transformed data, or fallback
      const price = Number(coin.currentPrice) || Number(coin.current_price) || Number(coin.coinPriceUSD) || 0;
      const qty = Number(coin.totalQuantity) || Number(coin.quantity) || 0;
      
      currentVal += price * qty;
    });

    return {
      totalCoins: uniqueCoins,
      currentValue: currentVal
    };
  }, [purchasedCoins]);

  const stats = [
    { 
      label: "Balance", 
      value: `$${(Number(balance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, notation: "compact" })}`, 
      color: "text-green-400", 
      icon: FaWallet 
    },
    { 
      label: "Coins", 
      value: totalCoins.toString(), 
      color: "text-cyan-400", 
      icon: FaCoins 
    },
    { 
      label: "Portfolio", 
      value: `$${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, notation: "compact" })}`, 
      color: "text-blue-400", 
      icon: FaChartLine 
    },
    { 
      label: "Watchlist", 
      value: ((watchlist && watchlist.length) || 0).toString(), 
      color: "text-amber-400", 
      icon: FaStar 
    }
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
              <span className="text-white font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div>
              <h2 className={`text-lg font-bold ${TC.headerTitle}`}>{user?.name || 'User'}</h2>
              <p className={`text-xs ${TC.textSecondary}`}>Personal Account</p>
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
            <span className="text-white font-bold text-xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="min-w-0">
            <h2 className={`text-xl font-bold ${TC.headerTitle} tracking-tight truncate`}>{user?.name || 'User'}</h2>
            <p className={`text-xs ${TC.textSecondary} font-medium`}>Personal Account</p>
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
            <span className={`text-xs font-bold uppercase tracking-wider ${TC.textSecondary}`}>Portfolio</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <div key={i} className={`${TC.bgStatItem} rounded-lg p-2.5`}>
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`text-xs ${stat.color}`} />
                  <span className={`text-[10px] ${TC.textSecondary} truncate`}>{stat.label}</span>
                </div>
                <div className="flex flex-col">
                    <span className={`text-sm font-bold ${TC.textPrimary} truncate`}>{stat.value}</span>
                    {stat.subValue && (
                        <span className={`text-[10px] ${stat.color} font-medium`}>{stat.subValue}</span>
                    )}
                </div>
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