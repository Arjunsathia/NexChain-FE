import React, { useState, useEffect } from "react";
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

function Sidebar() {
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);

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
      color: "text-green-400",
      icon: FaUsers,
    },
    {
      label: "Active Trades",
      value: "247",
      color: "text-cyan-400",
      icon: FaChartLine,
    },
    {
      label: "Reports",
      value: "12",
      color: "text-amber-400",
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
      <div className="w-full lg:hidden bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl fade-in">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <FaUserShield className="text-white text-base sm:text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-cyan-400 truncate">
                Admin Panel
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 truncate">
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
                      ${
                        isActive(item.path)
                          ? "bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400"
                          : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <item.icon
                        className={`
                          text-sm sm:text-base transition-transform duration-300 flex-shrink-0
                          ${
                            isActive(item.path)
                              ? "text-cyan-400 scale-110"
                              : "group-hover:scale-110 group-hover:text-cyan-300"
                          }
                        `}
                      />
                      <span className="font-medium text-xs sm:text-sm truncate">
                        {item.name}
                      </span>
                    </div>
                    <FaChevronRight
                      className={`
                        text-xs transition-all duration-300 flex-shrink-0
                        ${
                          isActive(item.path)
                            ? "text-cyan-400 opacity-100 translate-x-0"
                            : "text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                        }
                      `}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Admin Stats Section */}
          <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600">
            <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              System Stats
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {adminStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-1.5 p-2 bg-gray-800/50 rounded border border-gray-600"
                >
                  <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
                  <div className="text-center w-full">
                    <div className={`text-xs sm:text-sm font-semibold ${stat.color} truncate`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
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
          hidden lg:block w-64 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white p-5
          transition-all duration-700 ease-out transform
          ${isMounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}
        `}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <FaUserShield className="text-white text-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-cyan-400 truncate">
                Admin Panel
              </h2>
              <p className="text-sm text-gray-400 truncate">
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
                    ${
                      isActive(item.path)
                        ? "bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400 shadow-lg"
                        : "text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <item.icon
                      className={`
                        text-lg transition-transform duration-300 flex-shrink-0
                        ${
                          isActive(item.path)
                            ? "text-cyan-400 scale-110"
                            : "group-hover:scale-110 group-hover:text-cyan-300"
                        }
                      `}
                    />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                  <FaChevronRight
                    className={`
                      text-xs transition-all duration-300 flex-shrink-0
                      ${
                        isActive(item.path)
                          ? "text-cyan-400 opacity-100 translate-x-0"
                          : "text-gray-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                      }
                    `}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Admin Stats Section */}
        <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">
            System Overview
          </h3>
          <div className="space-y-3">
            {adminStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 group hover:bg-gray-600/30 rounded transition-colors duration-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-gray-600/50 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                    <stat.icon className={`text-sm ${stat.color}`} />
                  </div>
                  <span className="text-sm text-gray-400 truncate">
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