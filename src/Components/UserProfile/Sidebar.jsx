import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  FaCode,
  FaCommentDots,
  FaWallet,
  FaCoins,
  FaStar,
  FaChartBar,
  FaChartLine,
  FaSignOutAlt,
  FaCog,
  FaChevronRight,
  FaUserCircle,
} from "react-icons/fa";
import useUserContext from "@/hooks/useUserContext";
import useWalletContext from "@/hooks/useWalletContext";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";

import useThemeCheck from "@/hooks/useThemeCheck";
import { SERVER_URL } from "@/api/axiosConfig";
import { createPortal } from "react-dom";

// Logout Modal Component
const LogoutConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  isLight,
  isLoading,
}) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden ${isLight ? "bg-white" : "bg-gray-900 border border-gray-800"
              }`}
          >
            {/* Background Glow */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none`}
            />

            <div className="text-center relative z-10">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLight ? "bg-red-50" : "bg-red-500/10"
                  }`}
              >
                <FaSignOutAlt
                  className={`text-2xl ${isLight ? "text-red-500" : "text-red-400"}`}
                />
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${isLight ? "text-gray-900" : "text-white"}`}
              >
                Sign Out?
              </h3>

              <p
                className={`text-sm mb-6 ${isLight ? "text-gray-500" : "text-gray-400"}`}
              >
                Are you sure you want to end your session?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-colors ${isLight
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
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
    document.body,
  );
};

function Sidebar({ onLogout, isLogoutLoading }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { purchasedCoins } = usePurchasedCoins() || { purchasedCoins: [] };

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgSidebar: isLight
        ? "bg-white/80 backdrop-blur-xl shadow-md border border-white/40"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      bgStats: isLight
        ? "bg-gray-50/80 border border-gray-100"
        : "bg-gray-800/20 border-none",

      menuItemBase: isLight
        ? "text-gray-600 hover:bg-gray-100/80"
        : "text-gray-400 hover:bg-white/5",
      menuItemActiveText: isLight ? "text-blue-600" : "text-white",

      // Gradients & Accents
      activeGradient: "bg-gradient-to-r from-cyan-500 to-blue-500",
      activeGlow: isLight
        ? "shadow-[0_4px_14px_0_rgba(59,130,246,0.3)]"
        : "shadow-[0_4px_14px_0_rgba(6,182,212,0.3)]",

      divider: isLight ? "border-gray-100" : "border-gray-800",
    }),
    [isLight],
  );

  const menus = [
    { name: "Overview", path: `/user-profile/${user?.id}`, icon: FaChartLine },
    { name: "Market Insights", path: "/user/insights", icon: FaChartBar },
    { name: "Support", path: "/user/support", icon: FaCommentDots },
    { name: "Settings", path: "/user/settings", icon: FaCog },
  ];

  const isActive = (path) => {
    // Handle dynamic path matching specifically for the profile/overview route
    if (path.includes("/user-profile/")) {
      // Check if current location starts with /user-profile
      return location.pathname.startsWith("/user-profile");
    }
    return location.pathname.startsWith(path);
  };

  // Calculate mini-portfolio stats
  const { totalCoins, currentValue } = useMemo(() => {
    const list = Array.isArray(purchasedCoins) ? purchasedCoins : [];

    if (list.length === 0) return { totalCoins: 0, currentValue: 0 };

    const uniqueCoins = new Set(
      list
        .filter((c) => Number(c.quantity) > 0)
        .map((c) => c.coinId || c.coin_id),
    ).size;
    const currentVal = list.reduce((acc, coin) => {
      const price =
        Number(coin.current_price) || Number(coin.coinPriceUSD) || 0;
      const qty = Number(coin.quantity) || 0;
      return acc + price * qty;
    }, 0);

    return { totalCoins: uniqueCoins, currentValue: currentVal };
  }, [purchasedCoins]);

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .slide-in { animation: slideIn 0.3s ease-out forwards; }
      `}</style>

      {/* Mobile Top View (Optional/Legacy check) */}
      <div className="lg:hidden w-full mb-4">
        {/* Mobile sidebar content is usually handled by a separate navbar component, 
              but we ensure this doesn't break if rendered on mobile */}
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col w-72 h-[calc(100vh-2rem)] rounded-3xl p-6 sticky top-4 overflow-hidden 
          transition-all duration-500 ease-out
          ${TC.bgSidebar}
          ${isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
        `}
      >
        {/* Profile Header */}
        <Link
          to="/user/settings"
          className="block mb-8 group relative z-10 slide-in"
          style={{ animationDelay: "0s" }}
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
                    <FaUserCircle size={24} />
                  </div>
                )}
              </div>
              {/* Status Dot */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </motion.div>

            <div className="min-w-0">
              <h2
                className={`text-lg font-bold truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}
              >
                {user?.name || "User"}
              </h2>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${TC.textSecondary}`}
              >
                Personal Account <FaChevronRight size={10} />
              </div>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 relative z-10">
          {menus.map((item, index) => {
            const active = isActive(item.path);
            return (
              <div
                key={item.name}
                className="slide-in"
                style={{ animationDelay: `${0.05 + index * 0.03}s` }}
              >
                <Link
                  to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${active ? "" : TC.menuItemBase
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

        {/* Bottom Stats & Logout */}
        <div
          className="mt-6 pt-6 border-t border-dashed relative z-10 slide-in"
          style={{
            borderColor: isLight ? "#e5e7eb" : "rgba(255,255,255,0.1)",
            animationDelay: "0.2s",
          }}
        >
          {/* Quick Stats Grid */}
          <div className={`rounded-2xl p-4 mb-4 ${TC.bgStats}`}>
            <p
              className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${TC.textTertiary}`}
            >
              Your Assets
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-[10px] font-medium mb-0.5 ${TC.textSecondary}`}
                >
                  Net Worth
                </p>
                <p className={`text-sm font-bold ${TC.textPrimary}`}>
                  $
                  {currentValue.toLocaleString("en-IN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  })}
                </p>
              </div>
              <div>
                <p
                  className={`text-[10px] font-medium mb-0.5 ${TC.textSecondary}`}
                >
                  Cash
                </p>
                <p className={`text-sm font-bold ${TC.textPrimary}`}>
                  $
                  {(Number(balance) || 0).toLocaleString("en-IN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  })}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {[FaWallet, FaCoins, FaStar].map((Icon, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isLight ? "border-white bg-gray-100 text-gray-400" : "border-gray-800 bg-gray-700 text-gray-400"}`}
                  >
                    <Icon size={10} />
                  </div>
                ))}
              </div>
              <span className={`text-[10px] font-medium ${TC.textSecondary}`}>
                + {totalCoins} Active Coins
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            disabled={isLogoutLoading}
            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 group ${isLight
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              }`}
          >
            <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Background Decor */}
        <div
          className={`absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl pointer-events-none ${isLight ? "bg-blue-500/5" : "bg-cyan-500/5"}`}
        />
      </aside>

      <LogoutConfirmationModal
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={onLogout}
        isLight={isLight}
        isLoading={isLogoutLoading}
      />
    </>
  );
}

export default React.memo(Sidebar);
