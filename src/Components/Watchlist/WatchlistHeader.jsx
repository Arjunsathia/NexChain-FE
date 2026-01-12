import React from "react";
import { FaStar, FaSearch } from "react-icons/fa";

const WatchlistHeader = ({ TC, isLight, searchTerm, setSearchTerm }) => {
  return (
    <div
      className={`
        hidden sm:block
        sticky top-0 sm:top-2 z-40 
        w-full sm:max-w-7xl mx-auto 
        sm:rounded-xl shadow-sm sm:shadow-md
        ${TC.bgHeader} 
        transition-colors duration-300
        p-0 mb-4 sm:mb-6 
      `}
    >
      <div className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={`p-2 rounded-lg ${isLight ? "bg-yellow-50 text-yellow-600" : "bg-yellow-500/10 text-yellow-400"}`}
            >
              <FaStar className="text-lg" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold leading-none">My Watchlist</h1>
              <p className={`text-[10px] sm:text-xs mt-1 ${TC.textSecondary}`}>
                Track your favorite cryptocurrencies
              </p>
            </div>
          </div>

          {/* Search Bar on the right */}
          <div className="relative w-full sm:w-64">
            <FaSearch
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TC.textSecondary} text-sm`}
            />
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl border outline-none transition-all duration-200 text-sm ${isLight
                ? "bg-white border-gray-200 text-gray-900 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                : "bg-gray-800 border-gray-700 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistHeader;
