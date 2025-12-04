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
  FaSignal,
  FaSignOutAlt
} from "react-icons/fa";

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

function MobileNavbar({ isOpen, onToggle, onLogout, isLogoutLoading }) {
  const isLight = useThemeCheck();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    // Navbar Container (Top Nav on Mobile, Wrapper on Desktop)
    bgNavbar: isLight 
      ? "bg-white shadow-xl" 
      : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg",
    
    // Header
    headerTitle: isLight ? "text-blue-600" : "text-cyan-400",

    // Toggle Button (Mobile)
    btnToggleBase: isLight 
      ? "text-gray-700 bg-gray-100 hover:text-gray-900 hover:bg-gray-200" 
      : "text-gray-300 bg-gray-800/50 hover:text-white hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600",
    btnToggleActive: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105 rotate-90",

    // Mobile Menu Panel (Hidden menu on mobile, Sidebar on desktop)
    bgMenuPanel: isLight
      ? "bg-white lg:bg-gray-50"
      : "bg-gradient-to-b from-gray-800 via-gray-900 to-gray-950 lg:bg-gray-900",
    
    // Links Container
    borderLinkContainer: isLight ? "border-gray-300" : "border-cyan-500/30",

    // Link Item Base
    linkBase: isLight
      ? "text-gray-700 bg-gray-50 hover:bg-gray-100 hover:shadow-md"
      : "text-gray-300 bg-gray-800/40 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-cyan-600/20 hover:text-white",
      
    // Link Item Active
    linkActive: isLight
      ? "bg-blue-100/50 text-blue-700 shadow-md"
      : "bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 shadow-md backdrop-blur-sm",
    
    // Link Icon Colors
    linkIconBase: isLight ? "text-gray-600" : "text-gray-400",
    linkIconActive: isLight ? "text-blue-600" : "text-cyan-400",
    linkIconBg: isLight ? "bg-gray-200" : "bg-white/10",

    // Stats Section
    bgStatsSection: isLight ? "bg-gray-100/70" : "bg-gray-800/30",
    textStatsHeader: isLight ? "text-blue-600" : "text-cyan-400",

    // Footer
    bgFooter: isLight ? "bg-gray-100/50" : "bg-gray-800/30",
    textFooter: isLight ? "text-gray-600" : "text-gray-400",
    // Logout
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

  // Close mobile menu when route changes
  useEffect(() => {
    if (isOpen && !isDesktop) {
      onToggle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const statsData = [
    { label: "Users", value: "5", color: "text-cyan", bg: "from-cyan", border: "border-cyan" },
    { label: "Coins", value: "100", color: "text-blue", bg: "from-blue", border: "border-blue" },
    { label: "Trades", value: "0", color: "text-green", bg: "from-green", border: "border-green" },
    { label: "Watchlist", value: "0", color: "text-yellow", bg: "from-yellow", border: "border-yellow" },
  ];

  return (
    <>
      {/* Fully Rounded Top Navigation Bar */}
      <nav className={`
        ${TC.bgNavbar} shadow-lg sticky top-0 z-50 rounded-3xl mx-2 mt-2
        transition-all duration-500 ease-out
        ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}>
        <div className="px-3 sm:px-4 lg:ml-52 lg:px-4">
          <div className="flex justify-between items-center h-12">
            {/* Compact Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h2 className={`text-lg font-bold ${TC.headerTitle} bg-clip-text`}>
                  Admin
                </h2>
                <p className={`text-xs ${TC.textSecondary} hidden sm:block`}>Control Panel</p>
              </div>
            </div>

            {/* Compact mobile menu button */}
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

        {/* Fully Rounded Mobile Navigation Menu / Desktop Sidebar Panel */}
        <div className={`
          transition-all duration-400 ease-in-out overflow-hidden
          ${TC.bgMenuPanel} rounded-b-3xl
          ${(isOpen || isDesktop) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
          lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-52 lg:max-h-screen lg:overflow-y-auto lg:translate-x-0 lg:rounded-3xl lg:m-2 lg:mt-2 lg:pt-3 lg:pb-4
        `}>
          <div className={`px-3 pt-3 pb-4 space-y-1 lg:pt-3 lg:pb-4 lg:space-y-1`}>
            {/* Compact Navigation Items */}
            {menus.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={!isDesktop ? onToggle : undefined} // Close on mobile navigation
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-2xl
                  text-xs font-medium transition-all duration-150 transform
                  shadow-sm
                  ${isActive(item.path) ? TC.linkActive : TC.linkBase}
                  ${ (isOpen || isDesktop) ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'}
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

            {/* Compact Quick Stats Section (Desktop Sidebar Only) */}
            <div className={`pt-3 pb-2 mt-2 hidden lg:block`}>
              <h3 className={`text-xs font-semibold ${TC.textStatsHeader} mb-2 uppercase tracking-wider flex items-center justify-center rounded-full ${TC.bgStatsSection} px-2 py-1 mx-auto w-fit`}>
                <FaSignal className="mr-1 text-xs" />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {statsData.map((stat, index) => {
                    const statColor = isLight ? stat.color + "-700" : stat.color + "-400";
                    const statBg = isLight ? `bg-${stat.color}-100 border-${stat.color}-300` : `${stat.bg}-500/20 to-${stat.color}-600/20 border-opacity-40`;
                    const statBorder = isLight ? `border-${stat.color}-300` : `${stat.border}-500/40`;

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
            
            {/* Compact Footer */}
            <div className={`pt-2 mt-2`}>
              <div className={`text-center space-y-0.5 rounded-xl p-2 ${TC.bgFooter}`}>
                <p className={`text-xs font-semibold ${TC.textFooter}`}>
                  Admin Portal
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-4 pt-4 border-t border-gray-200/10">
                <button
                className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${TC.btnLogout}`}
                onClick={onLogout}
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
      </nav>
    </>
  );
}

export default MobileNavbar;