import React, { useState, useEffect, useMemo } from "react";
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

export default function Sidebar({ isLogoutLoading }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { purchasedCoins } = usePurchasedCoins() || { purchasedCoins: [] };
  const { watchlist } = useWatchlist() || { watchlist: [] };

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    // Backgrounds & Borders
    bgSidebar: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-900/90 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20",
    bgMobileWrapper: isLight ? "bg-white border-gray-300 shadow-md" : "bg-gray-800/50 backdrop-blur-sm border-gray-700",
    
    // Header Colors
    headerIconBg: "bg-gradient-to-r from-purple-600 to-blue-600",
    headerTitle: isLight ? "text-blue-700" : "text-cyan-400",

    // Menu Item Base
    menuItemBase: isLight ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-l-4 hover:border-gray-400" : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500",

    // Menu Item Active
    menuItemActive: isLight ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-md" : "bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400 shadow-lg",
    
    // Icon Colors
    iconActive: isLight ? "text-blue-600" : "text-cyan-400",
    iconHover: isLight ? "group-hover:text-blue-500" : "group-hover:text-cyan-300",
    
    // Chevron Colors
    chevronActive: isLight ? "text-blue-600" : "text-cyan-400",
    chevronInactive: isLight ? "text-gray-400" : "text-gray-400",

    // Stat Section
    bgStatSection: isLight ? "bg-gray-100/70 border-gray-300" : "bg-gray-700/30 border-gray-600",
    
    // Stat Item
    bgStatItem: isLight ? "bg-white border-gray-300" : "bg-gray-800/50 border-gray-600",
    bgStatItemDesktop: isLight ? "bg-gray-200/50 group-hover:bg-gray-300/80" : "bg-gray-600/50 group-hover:bg-gray-600/30",
    statItemHover: isLight ? "hover:bg-gray-100" : "hover:bg-gray-600/30",

    // Logout Button
    btnLogout: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl",
    
  }), [isLight]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("NEXCHAIN_USER_TOKEN");
      localStorage.removeItem("NEXCHAIN_USER");
      navigate("/auth");
    } catch (error) {
      console.error("Error While Logout", error);
    }
  };

  const menus = [
    { name: "Profile Settings", path: "/user/profile", icon: FaUser },
    { name: "Email Preferences", path: "/user/email", icon: FaEnvelope },
    { name: "API Keys", path: "/user/api", icon: FaCode },
    { name: "Support", path: "/user/support", icon: FaCommentDots },
  ];

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const { totalCoins, currentValue } = useMemo(() => {
    const coins = Array.isArray(purchasedCoins) ? purchasedCoins : [];
    const uniqueCoins = new Set(coins.map(coin => coin.coin_id)).size;

    const currentVal = coins.reduce((total, coin) => {
      const currentPrice = Number(coin.current_price) || Number(coin.coinPriceUSD) || 0;
      const qty = Number(coin.quantity) || 0;
      return total + currentPrice * qty;
    }, 0);

    return {
      totalCoins: uniqueCoins,
      currentValue: currentVal
    };
  }, [purchasedCoins]);

  const stats = [
    { 
      label: "Wallet Balance", 
      value: `$${(Number(balance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
      color: isLight ? "text-green-700" : "text-green-400", 
      icon: FaWallet 
    },
    { 
      label: "Coins Owned", 
      value: totalCoins.toString(), 
      color: isLight ? "text-cyan-700" : "text-cyan-400", 
      icon: FaCoins 
    },
    { 
      label: "Portfolio Value", 
      value: `$${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
      color: isLight ? "text-purple-700" : "text-purple-400", 
      icon: FaChartLine 
    },
    { 
      label: "Watchlist", 
      value: ((watchlist && watchlist.length) || 0).toString(), 
      color: isLight ? "text-amber-700" : "text-amber-400", 
      icon: FaStar 
    }
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>

      {/* Mobile & Tablet Version */}
      <div className={`w-full lg:hidden ${TC.bgMobileWrapper} rounded-xl fade-in`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${TC.headerIconBg} flex items-center justify-center ${TC.textPrimary} font-bold shadow-lg flex-shrink-0`}>
              <span className="text-base sm:text-lg">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`text-base sm:text-lg font-bold ${TC.headerTitle} truncate`}>{user?.name || 'User'}</h2>
              <p className={`text-xs sm:text-sm ${TC.textSecondary} truncate`}>Personal Account</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="mb-4">
            <ul className="space-y-1">
              {menus.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center justify-between p-2.5 sm:p-3 rounded-lg transition-all duration-300 group
                      ${isActive(item.path) 
                        ? TC.menuItemActive
                        : TC.menuItemBase
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <item.icon 
                        className={`
                          text-sm sm:text-base transition-transform duration-300 flex-shrink-0
                          ${isActive(item.path) 
                            ? `${TC.iconActive} scale-110`
                            : `${TC.iconHover}`
                          }
                        `}
                      />
                      <span className={`font-medium text-xs sm:text-sm truncate ${isActive(item.path) ? "" : TC.textPrimary}`}>{item.name}</span>
                    </div>
                    <FaChevronRight 
                      className={`
                        text-xs transition-all duration-300 flex-shrink-0
                        ${isActive(item.path) 
                          ? `${TC.chevronActive} opacity-100 translate-x-0` 
                          : `${TC.chevronInactive} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0`
                        }
                      `}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Portfolio Stats Section */}
          <div className={`mb-4 p-3 rounded-lg border ${TC.bgStatSection}`}>
            <h3 className={`text-xs font-semibold ${TC.textSecondary} mb-3 uppercase tracking-wide`}>
              Portfolio Stats
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat, index) => (
                <div key={index} className={`flex flex-col items-center gap-1.5 p-2 rounded border ${TC.bgStatItem}`}>
                  <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
                  <div className="text-center w-full">
                    <div className={`text-xs sm:text-sm font-semibold ${stat.color} truncate`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs ${TC.textSecondary} truncate`}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button
            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 ${TC.btnLogout} text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            onClick={handleLogout}
            disabled={isLogoutLoading}
          >
            {isLogoutLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging out...</span>
              </>
            ) : (
              "Logout"
            )}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden lg:flex flex-col w-full rounded-2xl p-5
          transition-all duration-700 ease-out transform h-full overflow-y-auto custom-scrollbar
          ${TC.bgSidebar}
          ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
          ${TC.textPrimary}
        `}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full ${TC.headerIconBg} flex items-center justify-center ${TC.textPrimary} font-bold text-lg shadow-lg flex-shrink-0`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`text-xl font-bold ${TC.headerTitle} truncate`}>{user?.name || 'User'}</h2>
              <p className={`text-sm ${TC.textSecondary} truncate`}>Personal Account</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mb-6">
          <ul className="space-y-2">
            {menus.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center justify-between p-3 rounded-lg transition-all duration-300 group
                    ${isActive(item.path) 
                      ? TC.menuItemActive
                      : TC.menuItemBase
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <item.icon 
                      className={`
                        text-lg transition-transform duration-300 flex-shrink-0
                        ${isActive(item.path) 
                          ? `${TC.iconActive} scale-110`
                          : `${TC.iconHover}`
                        }
                      `}
                    />
                    <span className={`font-medium truncate ${isActive(item.path) ? "" : TC.textPrimary}`}>{item.name}</span>
                  </div>
                  <FaChevronRight 
                    className={`
                      text-xs transition-all duration-300 flex-shrink-0
                      ${isActive(item.path) 
                        ? `${TC.chevronActive} opacity-100 translate-x-0` 
                        : `${TC.chevronInactive} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0`
                      }
                    `}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Portfolio Stats Section */}
        <div className={`mb-6 p-4 rounded-lg border ${TC.bgStatSection}`}>
          <h3 className={`text-xs font-semibold ${TC.textSecondary} mb-3 uppercase tracking-wide`}>
            Portfolio Overview
          </h3>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-2 group rounded transition-colors duration-200 ${TC.statItemHover}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${TC.bgStatItemDesktop} transition-transform duration-200 flex-shrink-0`}>
                    <stat.icon className={`text-sm ${stat.color}`} />
                  </div>
                  <span className={`text-sm ${TC.textSecondary} truncate`}>{stat.label}</span>
                </div>
                <span className={`text-sm font-semibold ${stat.color} flex-shrink-0 ml-2`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:disabled:scale-100 flex items-center justify-center gap-2 ${TC.btnLogout} transform hover:scale-105`}
            onClick={handleLogout}
            disabled={isLogoutLoading}
          >
            {isLogoutLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging out...</span>
              </>
            ) : (
              "Logout"
            )}
          </button>
        </div>
      </aside>
    </>
  );
}