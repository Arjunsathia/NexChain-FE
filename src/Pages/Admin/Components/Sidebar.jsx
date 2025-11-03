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
  FaChevronRight
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
  { name: "Cryptocurrencies", path: "/admin/cryptocurrencies", icon: FaCoins },
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

  return (
    <aside 
      className={`
        hidden lg:block w-64 bg-transparent shadow-lg rounded-xl text-white p-4 sm:p-6 border border-gray-700
        transition-all duration-700 ease-out transform
        ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}
      `}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
            A
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-cyan-400 truncate">Admin Panel</h2>
            <p className="text-sm text-gray-400 truncate">Platform Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav>
        <ul className="space-y-2">
          {menus.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`
                  flex items-center justify-between p-3 rounded-xl transition-all duration-300 group
                  ${isActive(item.path) 
                    ? 'bg-cyan-600/20 text-cyan-400 border-l-4 border-cyan-400 shadow' 
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-l-4 hover:border-gray-500'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon 
                    className={`
                      text-lg transition-transform duration-300
                      ${isActive(item.path) 
                        ? 'text-cyan-400 scale-110' 
                        : 'group-hover:scale-110 group-hover:text-cyan-300'
                      }
                    `}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <FaChevronRight 
                  className={`
                    text-xs transition-all duration-300
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

      {/* Quick Stats Section */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          Quick Stats
        </h3>
        <div className="space-y-2">
          {[
            { label: "Online Users", value: "1.2K", color: "text-green-400" },
            { label: "Active Trades", value: "247", color: "text-blue-400" },
            { label: "System Load", value: "24%", color: "text-yellow-400" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="flex justify-between items-center p-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
              <span className={`text-sm font-semibold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-4">
        <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm">
          Quick Actions
        </button>
      </div>

      {/* Footer
      <div className="mt-4 pt-4 border-t border-gray-700 text-center">
        <p className="text-xs text-gray-500">Admin Portal</p>
      </div> */}
    </aside>
  );
}

export default Sidebar;