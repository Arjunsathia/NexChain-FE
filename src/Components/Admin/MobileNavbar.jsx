import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaCoins,
  FaChartBar,
  FaNewspaper,
  FaCommentAlt,
  FaCog,
  FaBars,
  FaTimes,
  FaSignal
} from "react-icons/fa";

import useThemeCheck from "@/hooks/useThemeCheck";
import useUserContext from "@/hooks/useUserContext";
import { SERVER_URL } from "@/api/axiosConfig";

function MobileNavbar({ isOpen, onToggle, onLogout, isLogoutLoading }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { user } = useUserContext();

  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgNavbar: isLight
      ? "bg-white shadow-sm"
      : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-md",

    headerTitle: isLight ? "text-blue-600" : "text-cyan-400",

    btnToggleBase: isLight
      ? "text-gray-700 bg-gray-100 hover:text-gray-900 hover:bg-gray-200"
      : "text-gray-300 bg-gray-800/50 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600",
    btnToggleActive: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105 rotate-90",

    bgMenuPanel: isLight
      ? "bg-white lg:bg-gray-50"
      : "bg-gradient-to-b from-gray-800 via-gray-900 to-gray-950 lg:bg-gray-900",

    borderLinkContainer: isLight ? "border-gray-300" : "border-cyan-500/30",

    linkBase: isLight
      ? "text-gray-700 bg-gray-50 hover:bg-gray-100 hover:shadow-md"
      : "text-gray-300 bg-gray-800/40 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-cyan-600/20 hover:text-white",

    linkActive: isLight
      ? "bg-blue-100/50 text-blue-700 shadow-md"
      : "bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 shadow-md backdrop-blur-sm",

    linkIconBase: isLight ? "text-gray-600" : "text-gray-400",
    linkIconActive: isLight ? "text-blue-600" : "text-cyan-400",
    linkIconBg: isLight ? "bg-gray-200" : "bg-white/10",

    bgStatsSection: isLight ? "bg-gray-100/70" : "bg-gray-800/30",
    textStatsHeader: isLight ? "text-blue-600" : "text-cyan-400",

    bgFooter: isLight ? "bg-gray-100/50" : "bg-gray-800/30",
    textFooter: isLight ? "text-gray-600" : "text-gray-400",

    btnLogout: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl",
  }), [isLight]);


  useEffect(() => {
    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const menus = [
    { name: "Dashboard", path: "/admin", icon: FaChartLine },
    { name: "Users", path: "/admin/users", icon: FaUsers },
    { name: "Cryptocurrencies", path: "/admin/cryptocurrencies", icon: FaCoins },
    { name: "Market Insights", path: "/admin/insights", icon: FaChartBar },
    { name: "News Management", path: "/admin/news", icon: FaNewspaper },
    { name: "Feedback & Reports", path: "/admin/feedback", icon: FaCommentAlt },
    { name: "Settings", path: "/admin/settings", icon: FaCog },
  ];

  const isActive = useCallback((path) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);


  useEffect(() => {
    if (isOpen && !isDesktop) {
      onToggle();
    }

  }, [location.pathname]);

  const statsData = [
    { label: "Users", value: "5", color: "text-cyan", bg: "from-cyan", border: "border-cyan" },
    { label: "Coins", value: "100", color: "text-blue", bg: "from-blue", border: "border-blue" },
    { label: "Trades", value: "0", color: "text-green", bg: "from-green", border: "border-green" },
    { label: "Watchlist", value: "0", color: "text-yellow", bg: "from-yellow", border: "border-yellow" },
  ];

  return (
    <>
      { }
      <nav className={`
        ${TC.bgNavbar} sticky top-0 z-50 rounded-3xl mx-2 mt-2
        transition-all duration-500 ease-out
        ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}>
        <div className="px-3 sm:px-4 lg:ml-52 lg:px-4">
          <div className="flex justify-between items-center h-12">
            { }
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${isLight ? "from-blue-600 to-cyan-700" : "from-cyan-600 to-blue-600"} flex items-center justify-center font-bold text-white text-xs shadow-lg overflow-hidden`}>
                    {user?.image ? (
                      <img src={user.image.startsWith('http') ? user.image : `${SERVER_URL}/uploads/${user.image}`} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "A"
                    )}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${TC.headerTitle} bg-clip-text`}>
                      {user?.name || 'Admin'}
                    </h2>
                    <p className={`text-xs ${TC.textSecondary} hidden sm:block`}>Control Panel</p>
                  </div>
                </div>
              </div>
            </div>

            { }
            <button
              onClick={onToggle}
              className={`
                lg:hidden inline-flex items-center justify-center p-2 rounded-xl
                transition-all duration-150 transform shadow-md
                ${TC.btnToggleBase}
                ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                ${isOpen ? TC.btnToggleActive : 'hover:scale-105'}
              `}
            >
              {isOpen ? (
                <FaTimes className="h-4 w-4" />
              ) : (
                <FaBars className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        { }
        <div className={`
          transition-all duration-400 ease-in-out overflow-hidden
          ${TC.bgMenuPanel} rounded-b-3xl
          ${(isOpen || isDesktop) ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
          lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-52 lg:max-h-screen lg:overflow-y-auto lg:translate-x-0 lg:rounded-3xl lg:m-2 lg:mt-2 lg:pt-3 lg:pb-4
        `}>
          <div className={`px-3 pt-3 pb-4 space-y-1 lg:pt-3 lg:pb-4 lg:space-y-1`}>
            { }
            {menus.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={!isDesktop ? onToggle : undefined}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-2xl
                  text-xs font-medium transition-all duration-150 transform
                  shadow-sm
                  ${isActive(item.path) ? TC.linkActive : TC.linkBase}
                  ${(isOpen || isDesktop) ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'}
                `}
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                <div className={`p-1.5 rounded-lg flex-shrink-0 transition-all duration-150 ${TC.linkIconBg}`}>
                  <item.icon className={`text-sm ${isActive(item.path) ? TC.linkIconActive : TC.linkIconBase}`} />
                </div>
                <span className={`font-medium text-sm ${isActive(item.path) ? "" : TC.textPrimary}`}>{item.name}</span>
                {isActive(item.path) && (
                  <div className={`ml-auto w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse`}></div>
                )}
              </Link>
            ))}

            { }
            <div className={`pt-3 pb-2 mt-2 hidden lg:block`}>
              <h3 className={`text-xs font-semibold ${TC.textStatsHeader} mb-2 uppercase tracking-wider flex items-center justify-center rounded-full ${TC.bgStatsSection} px-2 py-1 mx-auto w-fit`}>
                <FaSignal className="mr-1 text-xs" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {statsData.map((stat, index) => {
                  const statColor = isLight ? stat.color + "-700" : stat.color + "-400";
                  const statBg = isLight ? `bg-${stat.color}-100 border-${stat.color}-300` : `${stat.bg}-500/20 to-${stat.color}-600/20 border-opacity-40`;


                  return (
                    <div
                      key={index}
                      className={`p-2 rounded-xl ${statBg} transition-all duration-150 backdrop-blur-sm shadow-md hover:scale-102 hover:shadow-sm cursor-pointer`}
                      style={{ transitionDelay: `${200 + (index * 30)}ms` }}
                    >
                      <div className="flex flex-col items-center text-center space-y-0.5">
                        <span className={`text-sm font-bold ${statColor}`}>
                          {stat.value}
                        </span>
                        <span className={`text-xs ${TC.textSecondary} leading-tight font-medium`}>{stat.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            { }
            <div className={`pt-2 mt-2`}>
              <div className={`text-center space-y-0.5 rounded-xl p-2 ${TC.bgFooter}`}>
                <p className={`text-xs font-semibold ${TC.textFooter}`}>
                  Admin Portal
                </p>
              </div>
            </div>


          </div>
        </div>
      </nav>
    </>
  );
}

export default MobileNavbar;
