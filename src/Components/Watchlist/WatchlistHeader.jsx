import React from "react";
import { FaStar, FaSearch } from "react-icons/fa";

const WatchlistHeader = ({ TC, isLight, searchTerm, setSearchTerm }) => {
  return (
    <div className={`sticky top-2 z-40 max-w-7xl mx-auto rounded-2xl shadow-lg mb-6 ${TC.bgHeader} transition-colors duration-300`}>
      <div className="px-4 lg:px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isLight ? "bg-yellow-50 text-yellow-600" : "bg-yellow-500/10 text-yellow-400"}`}>
              <FaStar className="text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-none">My Watchlist</h1>
              <p className={`text-xs mt-1 ${TC.textSecondary}`}>
                Track your favorite cryptocurrencies
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TC.textSecondary} text-sm`} />
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all duration-200 text-sm ${
                isLight ? "bg-gray-100 border-gray-200 text-gray-900 focus:border-cyan-500" : "bg-gray-800 border-gray-700 text-white focus:border-cyan-400"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchlistHeader;
