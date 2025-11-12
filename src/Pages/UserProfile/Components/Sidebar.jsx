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

export default function Sidebar({ isLogoutLoading }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const { user } = useUserContext();
  const { balance } = useWalletContext();
  const { purchasedCoins } = usePurchasedCoins() || { purchasedCoins: [] };
  const { watchlist } = useWatchlist() || { watchlist: [] };

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
      color: "text-green-400", 
      icon: FaWallet 
    },
    { 
      label: "Coins Owned", 
      value: totalCoins.toString(), 
      color: "text-cyan-400", 
      icon: FaCoins 
    },
    { 
      label: "Portfolio Value", 
      value: `$${currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 
      color: "text-purple-400", 
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
      <div className="w-full lg:hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl fade-in">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
              <span className="text-base sm:text-lg">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-cyan-400 truncate">{user?.name || 'User'}</h2>
              <p className="text-xs sm:text-sm text-gray-400 truncate">Personal Account</p>
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
                        ? 'bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <item.icon 
                        className={`
                          text-sm sm:text-base transition-transform duration-300 flex-shrink-0
                          ${isActive(item.path) 
                            ? 'text-cyan-400 scale-110' 
                            : 'group-hover:scale-110 group-hover:text-cyan-300'
                          }
                        `}
                      />
                      <span className="font-medium text-xs sm:text-sm truncate">{item.name}</span>
                    </div>
                    <FaChevronRight 
                      className={`
                        text-xs transition-all duration-300 flex-shrink-0
                        ${isActive(item.path) 
                          ? 'text-cyan-400 opacity-100 translate-x-0' 
                          : 'text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                        }
                      `}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Portfolio Stats Section */}
          <div className="mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600">
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              Portfolio Stats
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center gap-1.5 p-2 bg-gray-800/50 rounded border border-gray-600">
                  <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
                  <div className="text-center w-full">
                    <div className={`text-xs sm:text-sm font-semibold ${stat.color} truncate`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          hidden lg:block w-64 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white p-5
          transition-all duration-700 ease-out transform
          ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
        `}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-cyan-400 truncate">{user?.name || 'User'}</h2>
              <p className="text-sm text-gray-400 truncate">Personal Account</p>
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
                      ? 'bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <item.icon 
                      className={`
                        text-lg transition-transform duration-300 flex-shrink-0
                        ${isActive(item.path) 
                          ? 'text-cyan-400 scale-110' 
                          : 'group-hover:scale-110 group-hover:text-cyan-300'
                        }
                      `}
                    />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  <FaChevronRight 
                    className={`
                      text-xs transition-all duration-300 flex-shrink-0
                      ${isActive(item.path) 
                        ? 'text-cyan-400 opacity-100 translate-x-0' 
                        : 'text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                      }
                    `}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Portfolio Stats Section */}
        <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            Portfolio Overview
          </h3>
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 group hover:bg-gray-600/30 rounded transition-colors duration-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-gray-600/50 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                    <stat.icon className={`text-sm ${stat.color}`} />
                  </div>
                  <span className="text-sm text-gray-400 truncate">{stat.label}</span>
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
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm disabled:opacity-60 disabled:cursor-not-allowed hover:disabled:scale-100 flex items-center justify-center gap-2"
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