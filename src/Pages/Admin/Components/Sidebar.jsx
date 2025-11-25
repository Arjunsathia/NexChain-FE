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
  FaChevronRight,
  FaUserShield,
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

function Sidebar() {
  const isLight = useThemeCheck();
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    // Backgrounds & Borders
    bgSidebar: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-900/90 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-black/20",
    
    // Mobile Wrapper
    bgMobile: isLight ? "bg-white border-gray-300 shadow-md" : "bg-gray-800/50 backdrop-blur-sm border-gray-700",

    // Header Colors
    headerIconBg: "bg-gradient-to-r from-purple-600 to-blue-600",
    headerTitle: isLight ? "text-blue-700" : "text-cyan-400",

    // Menu Item Base
    menuItemBase: isLight ? "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-l-4 hover:border-gray-400" : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500",

    // Menu Item Active
    menuItemActive: isLight ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-md" : "bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400 shadow-lg",
    
    // Stat Section
    bgStatSection: isLight ? "bg-gray-100/70 border-gray-300" : "bg-gray-700/30 border-gray-600",
    statSectionTitle: isLight ? "text-gray-600" : "text-gray-400",

    // Stat Item (Mobile)
    bgStatItemMobile: isLight ? "bg-white border-gray-300" : "bg-gray-800/50 border-gray-600",
    
    // Stat Item (Desktop)
    bgStatItemDesktop: isLight ? "bg-gray-200/50 group-hover:bg-gray-300/80" : "bg-gray-600/50 group-hover:bg-gray-600/30",
    statItemHover: isLight ? "hover:bg-gray-100" : "hover:bg-gray-600/30",
    
    // Icon Colors
    iconActive: isLight ? "text-blue-600" : "text-cyan-400",
    iconHover: isLight ? "group-hover:text-blue-500" : "group-hover:text-cyan-300",
    
    // Chevron Colors
    chevronActive: isLight ? "text-blue-600" : "text-cyan-400",
    chevronInactive: isLight ? "text-gray-400" : "text-gray-400",

  }), [isLight]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const menus = [
    { name: "Dashboard", path: "/admin", icon: FaChartLine },
    { name: "Users", path: "/admin/users", icon: FaUsers },
    {
      name: "Cryptocurrencies",
      path: "/admin/cryptocurrencies",
      icon: FaCoins,
    },
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
    {
      label: "Online Users",
      value: "1.2K",
      color: isLight ? "text-green-700" : "text-green-400",
      icon: FaUsers,
    },
    {
      label: "Active Trades",
      value: "247",
      color: isLight ? "text-cyan-700" : "text-cyan-400",
      icon: FaChartLine,
    },
    {
      label: "Reports",
      value: "12",
      color: isLight ? "text-amber-700" : "text-amber-400",
      icon: FaCommentAlt,
    },
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
      <div className={`w-full lg:hidden ${TC.bgMobile} rounded-xl fade-in`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${TC.headerIconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <FaUserShield className="text-white text-base sm:text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`text-base sm:text-lg font-bold ${TC.headerTitle} truncate`}>
                Admin Panel
              </h2>
              <p className={`text-xs sm:text-sm ${TC.textSecondary} truncate`}>
                Platform Management
              </p>
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
                      ${isActive(item.path) ? TC.menuItemActive : TC.menuItemBase}
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <item.icon
                        className={`
                          text-sm sm:text-base transition-transform duration-300 flex-shrink-0
                          ${
                            isActive(item.path)
                              ? `${TC.iconActive} scale-110`
                              : `${TC.iconHover}`
                          }
                        `}
                      />
                      <span className={`font-medium text-xs sm:text-sm truncate ${isActive(item.path) ? "" : TC.textPrimary}`}>
                        {item.name}
                      </span>
                    </div>
                    <FaChevronRight
                      className={`
                        text-xs transition-all duration-300 flex-shrink-0
                        ${
                          isActive(item.path)
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

          {/* Admin Stats Section (Mobile) */}
          <div className={`p-3 rounded-lg border ${TC.bgStatSection}`}>
            <h3 className={`text-xs font-semibold mb-3 uppercase tracking-wide ${TC.statSectionTitle}`}>
              System Stats
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {adminStats.map((stat, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded border ${TC.bgStatItemMobile}`}
                >
                  <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
                  <div className="text-center w-full">
                    <div className={`text-xs sm:text-sm font-semibold ${stat.color} truncate`}>
                      {stat.value}
                    </div>
                    <div className={`text-xs ${TC.textSecondary} truncate`}>
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col w-64 rounded-2xl p-5
          transition-all duration-700 ease-out transform h-full overflow-y-auto custom-scrollbar
          ${TC.bgSidebar}
          ${isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
          ${TC.textPrimary}
        `}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-full ${TC.headerIconBg} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <FaUserShield className="text-white text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`text-xl font-bold ${TC.headerTitle} truncate`}>
                Admin Panel
              </h2>
              <p className={`text-sm ${TC.textSecondary} truncate`}>
                Platform Management
              </p>
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
                    ${isActive(item.path) ? TC.menuItemActive : TC.menuItemBase}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <item.icon
                      className={`
                        text-lg transition-transform duration-300 flex-shrink-0
                        ${
                          isActive(item.path)
                            ? `${TC.iconActive} scale-110`
                            : `${TC.iconHover}`
                        }
                      `}
                    />
                    <span className={`font-medium truncate ${isActive(item.path) ? "" : TC.textPrimary}`}>
                      {item.name}
                    </span>
                  </div>
                  <FaChevronRight
                    className={`
                      text-xs transition-all duration-300 flex-shrink-0
                      ${
                        isActive(item.path)
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

        {/* Admin Stats Section (Desktop) */}
        <div className={`p-4 rounded-lg border ${TC.bgStatSection}`}>
          <h3 className={`text-xs font-semibold mb-3 uppercase tracking-wide ${TC.statSectionTitle}`}>
            System Overview
          </h3>
          <div className="space-y-3">
            {adminStats.map((stat, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 group rounded transition-colors duration-200 ${TC.statItemHover}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded-lg ${TC.bgStatItemDesktop} transition-transform duration-200 flex-shrink-0`}>
                    <stat.icon className={`text-sm ${stat.color}`} />
                  </div>
                  <span className={`text-sm ${TC.textSecondary} truncate`}>
                    {stat.label}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${stat.color} flex-shrink-0 ml-2`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;