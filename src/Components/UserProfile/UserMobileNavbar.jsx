import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChartLine,
  FaCog,
  FaCode,
  FaCommentDots,
  FaTimes,
  FaWallet,
  FaCoins,
  FaStar,
  FaChartBar,
  FaSignOutAlt,
  FaChevronRight,
  FaUser
} from "react-icons/fa";
import { HiMenuAlt3 } from "react-icons/hi"; // Modern menu icon
import useThemeCheck from "@/hooks/useThemeCheck";
import useUserContext from '@/hooks/useUserContext';
import useWalletContext from '@/hooks/useWalletContext';
import { usePurchasedCoins } from '@/hooks/usePurchasedCoins';
import { useWatchlist } from '@/hooks/useWatchlist';
import { SERVER_URL } from "@/api/axiosConfig";

function UserMobileNavbar({ isOpen, onToggle, onLogout, isLogoutLoading }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { purchasedCoins } = usePurchasedCoins() || { purchasedCoins: [] };
  const { watchlist } = useWatchlist() || { watchlist: [] };




  const TC = useMemo(() => ({
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
  }), [isLight]);

  // Updated Order: Overview -> Support -> Settings -> API Keys
  const menus = [
    { name: "Overview", path: `/user-profile/${user?.id}`, icon: FaChartLine },
    { name: "Market Insights", path: "/user/insights", icon: FaChartBar },
    { name: "API Keys", path: "/user/api", icon: FaCode },
    { name: "Support", path: "/user/support", icon: FaCommentDots },
    { name: "Settings", path: "/user/settings", icon: FaCog },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  // Stats Calculation
  const { totalCoins, currentValue } = useMemo(() => {
    const coins = Array.isArray(purchasedCoins) ? purchasedCoins : [];
    const uniqueCoins = new Set(coins.map(coin => coin.coin_id)).size;
    const currentVal = coins.reduce((total, coin) => {
      const price = Number(coin.current_price) || Number(coin.coinPriceUSD) || 0;
      const qty = Number(coin.quantity) || 0;
      return total + price * qty;
    }, 0);
    return { totalCoins: uniqueCoins, currentValue: currentVal };
  }, [purchasedCoins]);

  const stats = [
    { label: "Net Worth", value: `$${currentValue.toLocaleString('en-IN', { notation: "compact", maximumFractionDigits: 1 })}`, icon: FaChartLine, color: "text-emerald-500" },
    { label: "Cash", value: `$${(Number(balance) || 0).toLocaleString('en-IN', { notation: "compact", maximumFractionDigits: 1 })}`, icon: FaWallet, color: "text-blue-500" },
    { label: "Assets", value: totalCoins, icon: FaCoins, color: "text-amber-500" },
    { label: "Watchlist", value: watchlist?.length || 0, icon: FaStar, color: "text-purple-500" },
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
            <Link to={`/user-profile/${user?.id}`} className="relative group">
              <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${isLight ? 'border-gray-200' : 'border-gray-700'} shadow-sm`}>
                {user?.image ? (
                  <img
                    src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-gray-400'}`}>
                    <FaUser size={14} />
                  </div>
                )}
              </div>
              <div className="absolute lg:block bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
            </Link>

            <div className="leading-tight">
              <h2 className={`text-sm font-bold ${TC.textPrimary}`}>
                {user?.name || "User"}
              </h2>
              <p className={`text-[10px] font-medium ${TC.textSecondary} uppercase tracking-wide`}>
                Personal Account
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

                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 px-1 ${TC.textSecondary}`}>
                    Quick Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {stats.map((stat) => (
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

                {/* Logout Action */}
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={onLogout}
                  disabled={isLogoutLoading}
                  className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  {isLogoutLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing Out...</span>
                    </>
                  ) : (
                    <>
                      <FaSignOutAlt /> Sign Out
                    </>
                  )}
                </motion.button>
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
            style={{ top: 0 }} // Ensure it covers from very top
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default React.memo(UserMobileNavbar);
