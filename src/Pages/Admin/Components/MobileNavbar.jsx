import React, { useState, useEffect, useCallback } from "react";
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

function MobileNavbar({ isOpen, onToggle }) {
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

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

  return (
    <>
      {/* Fully Rounded Top Navigation Bar */}
      <nav className={`
        bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-cyan-500/30 shadow-lg sticky top-0 z-50 rounded-3xl mx-2 mt-2
        transition-all duration-500 ease-out
        ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}>
        <div className="px-3 sm:px-4 lg:ml-52 lg:px-4">
          <div className="flex justify-between items-center h-12">
            {/* Compact Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h2 className="text-lg font-bold text-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                  Admin
                </h2>
                <p className="text-xs text-gray-400 hidden sm:block">Control Panel</p>
              </div>
            </div>

            {/* Compact mobile menu button */}
            <button
              onClick={onToggle}
              className={`
                lg:hidden inline-flex items-center justify-center p-2 rounded-xl
                text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600
                transition-all duration-150 transform border border-cyan-500/30 shadow-md
                ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                ${isOpen ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105 rotate-90' : 'hover:scale-105'}
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

        {/* Fully Rounded Mobile Navigation Menu */}
        <div className={`
          transition-all duration-400 ease-in-out overflow-hidden
          bg-gradient-to-b from-gray-800 via-gray-900 to-gray-950 rounded-b-3xl
          ${(isOpen || isDesktop) ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
          lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-52 lg:max-h-screen lg:overflow-y-auto lg:translate-x-0 lg:bg-gray-900 lg:border-r lg:border-cyan-500/30 lg:rounded-3xl lg:m-2 lg:mt-2 lg:pt-3 lg:pb-4
        `}>
          <div className="px-3 pt-3 pb-4 space-y-1 border-t border-cyan-500/30 lg:border-t-0 lg:pt-3 lg:pb-4 lg:space-y-1">
            {/* Compact Navigation Items */}
            {menus.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-2xl
                  text-xs font-medium transition-all duration-150 transform
                  border shadow-sm
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 shadow-md border-cyan-500/60 backdrop-blur-sm'
                    : 'text-gray-300 bg-gray-800/40 border-gray-700/50 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-cyan-600/20 hover:text-white hover:border-cyan-500/40 hover:scale-102 hover:shadow-sm'
                  }
                  ${ (isOpen || isDesktop) ? 'translate-x-0 opacity-100' : 'translate-x-3 opacity-0'}
                `}
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                <div className={`p-1.5 rounded-lg bg-white/10 border border-white/20 flex-shrink-0 transition-all duration-150`}>
                  <item.icon className={`text-sm ${isActive(item.path) ? 'text-cyan-400' : 'text-gray-400'}`} />
                </div>
                <span className="font-medium text-sm">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
                )}
              </Link>
            ))}

            {/* Compact Quick Stats Section */}
            <div className="pt-3 pb-2 border-t border-cyan-500/30 mt-2 hidden lg:block">
              <h3 className="text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-wider flex items-center justify-center rounded-full bg-gray-800/50 px-2 py-1 mx-auto w-fit border border-cyan-500/30">
                <FaSignal className="mr-1 text-xs" />
                Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Users", value: "5", color: "text-cyan-400", bg: "bg-gradient-to-br from-cyan-500/20 to-cyan-600/20", border: "border-cyan-500/40" },
                  { label: "Coins", value: "100", color: "text-blue-400", bg: "bg-gradient-to-br from-blue-500/20 to-blue-600/20", border: "border-blue-500/40" },
                  { label: "Trades", value: "0", color: "text-green-400", bg: "bg-gradient-to-br from-green-500/20 to-green-600/20", border: "border-green-500/40" },
                  { label: "Watchlist", value: "0", color: "text-yellow-400", bg: "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20", border: "border-yellow-500/40" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-xl ${stat.bg} border ${stat.border} transition-all duration-150 backdrop-blur-sm shadow-md hover:scale-102 hover:shadow-sm cursor-pointer`}
                    style={{ transitionDelay: `${200 + (index * 30)}ms` }}
                  >
                    <div className="flex flex-col items-center text-center space-y-0.5">
                      <span className={`text-sm font-bold ${stat.color}`}>
                        {stat.value}
                      </span>
                      <span className="text-xs text-gray-300 leading-tight font-medium">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Compact Footer */}
            <div className="pt-2 border-t border-cyan-500/30 mt-2">
              <div className="text-center space-y-0.5 rounded-xl bg-gray-800/30 p-2 border border-gray-700/50">
                <p className="text-xs text-gray-400 font-semibold">
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