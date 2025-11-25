import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FaSearch, FaEye, FaChartLine, FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useCoinContext from "@/Context/CoinContext/useCoinContext";

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

function AdminCryptocurrencies() {
  const isLight = useThemeCheck();
  const { coins, coinsLoading } = useCoinContext();
  const navigate = useNavigate();

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    // Backgrounds & Borders
    bgContainer: isLight ? "bg-white border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700",
    bgItem: isLight ? "bg-white border-gray-300 hover:border-cyan-600/50" : "bg-gradient-to-br from-gray-800/50 to-gray-800/30 border-gray-700 hover:border-cyan-400/50",
    bgTableHead: isLight ? "bg-gray-100/70 border-gray-300 text-gray-600" : "bg-gray-800/50 border-gray-700 text-gray-400",
    borderDivide: isLight ? "divide-gray-300" : "divide-gray-700",
    
    // Search & Input
    inputBg: isLight ? "bg-white border-gray-300 text-gray-800 placeholder-gray-500" : "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400",
    
    // Stats Cards
    bgCard: isLight ? "bg-white border-gray-300 shadow-md hover:scale-[1.02]" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-lg hover:scale-105",
    
    // Pagination
    btnPagination: isLight ? "bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300" : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50",
    btnPaginationActive: isLight ? "bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-500/25" : "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/25",

    // Button
    bgButton: isLight ? "bg-gray-200 hover:bg-cyan-600 text-cyan-600 hover:text-white border-gray-300 hover:border-cyan-600" : "bg-gray-700/50 hover:bg-cyan-600 text-cyan-400 hover:text-white border-gray-600 hover:border-cyan-500",
    
    // PL Colors
    textPositive: isLight ? "text-green-700" : "text-green-400",
    textNegative: isLight ? "text-red-700" : "text-red-400",
  }), [isLight]);


  // Search and Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter coins based on search term
  const filteredCoins = useMemo(() => {
    if (!searchTerm) return coins;
    
    const term = searchTerm.toLowerCase();
    return coins.filter(coin => 
      coin.name.toLowerCase().includes(term) ||
      coin.symbol.toLowerCase().includes(term)
    );
  }, [coins, searchTerm]);

  const formatCurrency = useCallback((value) => {
    if (!value) return "$0";
    
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  }, []);

  // Memoized pagination calculations using filtered coins
  const { paginatedCoins, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
    const paginatedCoins = filteredCoins.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { paginatedCoins, totalPages };
  }, [filteredCoins, currentPage, itemsPerPage]);

  const handlePageClick = (page) => setCurrentPage(page);

  // Reset to first page when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // View coin details
  const handleView = (coin) => {
    navigate(`/coin/coin-details/${coin.id}`);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-xs sm:text-sm ${TC.btnPagination}`}
      >
        Previous
      </button>
    );

    // Page numbers
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm
            ${currentPage === page
              ? TC.btnPaginationActive
              : TC.btnPagination
            }`}
        >
          {page}
        </button>
      );
    }

    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-xs sm:text-sm ${TC.btnPagination}`}
      >
        Next
      </button>
    );

    return buttons;
  };

  if (coinsLoading) {
    return (
      <div className="flex-1 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6 fade-in">
        <div className="rounded-xl p-4 sm:p-6 lg:p-8 text-center border bg-white shadow-lg dark:bg-gray-800/50 dark:backdrop-blur-sm dark:border-gray-700">
          <div className="flex justify-center items-center gap-2 sm:gap-3 text-cyan-400">
            <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs sm:text-sm lg:text-base">Loading cryptocurrencies...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className={`flex-1 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6 fade-in ${TC.textPrimary}`}>
      {/* Header Section with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 fade-in">
        <div className="flex-1 w-full sm:w-auto min-w-0">
<h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-t from-cyan-400 to-blue-500 bg-clip-text text-transparent truncate">
  Cryptocurrencies Management
</h1>
          <p className={`text-xs sm:text-sm mt-1 truncate ${TC.textSecondary}`}>Monitor all cryptocurrencies in the system</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full sm:w-48 lg:w-56 xl:w-64 order-2 sm:order-none">
          <div className="relative">
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`w-full border rounded-lg py-2 px-3 text-xs sm:text-sm focus:outline-none 
                       focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 
                       pr-9 ${TC.inputBg}`}
            />
            <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${TC.textSecondary}`} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 fade-in">
        {/* Total Coins Card */}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-300 group cursor-pointer ${TC.bgCard} ${isLight ? "hover:scale-[1.02]" : "hover:scale-105"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg shadow-lg">
              <FaCoins className="text-white text-base" />
            </div>
            <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${isLight ? "bg-cyan-100/70 border-cyan-300 text-cyan-600" : "bg-cyan-400/10 border-cyan-400/20 text-cyan-400"}`}>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">Total</span>
            </div>
          </div>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 transition-colors ${TC.textPrimary} ${isLight ? "group-hover:text-cyan-700" : "group-hover:text-cyan-300"}`}>
            {coins.length}
          </p>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>Total Coins</p>
          <p className={`text-xs mt-1 ${TC.textTertiary}`}>All cryptocurrencies</p>
        </div>

        {/* Active Coins Card */}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-300 group cursor-pointer ${TC.bgCard} ${isLight ? "hover:scale-[1.02]" : "hover:scale-105"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg">
              <FaChartLine className="text-white text-base" />
            </div>
            <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${isLight ? "bg-green-100/70 border-green-300 text-green-600" : "bg-green-400/10 border-green-400/20 text-green-400"}`}>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">Active</span>
            </div>
          </div>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 transition-colors ${TC.textPrimary} ${isLight ? "group-hover:text-green-700" : "group-hover:text-green-300"}`}>
            {coins.filter(c => c.current_price > 0).length}
          </p>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>Active Coins</p>
          <p className={`text-xs mt-1 ${TC.textTertiary}`}>Currently trading</p>
        </div>

        {/* Top Gainers Card */}
        <div className={`rounded-xl p-4 sm:p-6 transition-all duration-300 group cursor-pointer ${TC.bgCard} ${isLight ? "hover:scale-[1.02]" : "hover:scale-105"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg">
              <FaArrowUp className="text-white text-base" />
            </div>
            <div className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${isLight ? "bg-purple-100/70 border-purple-300 text-purple-600" : "bg-purple-400/10 border-purple-400/20 text-purple-400"}`}>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="font-semibold">Gaining</span>
            </div>
          </div>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold mb-1 transition-colors ${TC.textPrimary} ${isLight ? "group-hover:text-purple-700" : "group-hover:text-purple-300"}`}>
            {coins.filter(c => c.price_change_percentage_24h > 0).length}
          </p>
          <p className={`text-sm font-medium ${TC.textSecondary}`}>Top Gainers</p>
          <p className={`text-xs mt-1 ${TC.textTertiary}`}>24h positive change</p>
        </div>
      </div>

      {/* Content Section */}
      {filteredCoins.length === 0 ? (
        <div className={`rounded-xl p-4 sm:p-6 lg:p-8 text-center fade-in border ${TC.bgContainer}`}>
          <div className={`text-sm sm:text-base lg:text-lg ${TC.textSecondary}`}>
            {searchTerm ? "No coins found matching your search" : "No cryptocurrencies available"}
          </div>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden fade-in border ${TC.bgContainer}`}>
          {/* Mobile/Tablet Card View */}
          <div className="xl:hidden space-y-2 sm:space-y-3 p-2 sm:p-3 lg:p-4">
            {paginatedCoins.map((coin, index) => (
              <div
                key={coin.id}
                className={`rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border 
                  transition-all duration-300 ease-out hover:border-cyan-400/50 fade-in ${TC.bgItem}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0 pr-2 sm:pr-3">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full border ${isLight ? "border-gray-400" : "border-gray-600"}`} 
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold text-sm sm:text-base lg:text-lg truncate ${TC.textPrimary}`}>
                          {coin.name}
                        </h3>
                        <p className={`text-xs sm:text-sm uppercase ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>
                          {coin.symbol.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm ${TC.textSecondary}`}>
                      <div>
                        <span className={TC.textTertiary}>Price:</span>
                        <div className={`font-bold ${TC.textPrimary}`}>${coin.current_price?.toLocaleString("en-IN") || "0"}</div>
                      </div>
                      <div>
                        <span className={TC.textTertiary}>24h %:</span>
                        <div className={`font-bold ${coin.price_change_percentage_24h < 0 ? TC.textNegative : TC.textPositive}`}>
                          {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                        </div>
                      </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mt-2 ${TC.textSecondary}`}>
                      <div>
                        <span className={TC.textTertiary}>Market Cap:</span>
                        <div className={`font-medium ${TC.textSecondary}`}>{formatCurrency(coin.market_cap)}</div>
                      </div>
                      <div>
                        <span className={TC.textTertiary}>Volume:</span>
                        <div className={`font-medium ${TC.textSecondary}`}>{formatCurrency(coin.total_volume)}</div>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs sm:text-sm flex-shrink-0 ${TC.textTertiary}`}>
                    #{coin.market_cap_rank || "N/A"}
                  </span>
                </div>
                
                {/* View button */}
                <div className="flex justify-center mt-3">
                  <button
                    className={`rounded-lg p-2 sm:p-3 transition-all duration-200 
                              flex items-center justify-center gap-2 border shadow-sm transform hover:scale-105
                              w-full sm:w-auto text-xs sm:text-sm ${TC.bgButton}`}
                    onClick={() => handleView(coin)}
                  >
                    <FaEye className="text-xs sm:text-sm" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead className={TC.bgTableHead}>
                <tr className={isLight ? "border-b border-gray-300" : "border-b border-gray-700"}>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Rank</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Coin</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Price</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">24h %</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Market Cap</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Volume</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`text-sm xl:text-base divide-y ${TC.borderDivide}`}>
                {paginatedCoins.map((coin, index) => (
                  <tr
                    key={coin.id}
                    className={`transition-all duration-300 ease-out fade-in ${isLight ? "hover:bg-gray-50/50" : "hover:bg-gray-800/40"}`}
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <td className={`py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-medium text-xs lg:text-sm text-center ${TC.textSecondary}`}>
                      #{coin.market_cap_rank || "N/A"}
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <img 
                          src={coin.image} 
                          alt={coin.name} 
                          className={`w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0 rounded-full border ${isLight ? "border-gray-400" : "border-gray-600"}`} 
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`font-medium text-sm lg:text-base ${TC.textPrimary}`}>{coin.name}</div>
                          <div className={`text-xs lg:text-sm uppercase ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>{coin.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className={`font-bold text-sm lg:text-base ${TC.textPrimary}`}>
                        ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || "0.00"}
                      </div>
                    </td>
                    <td className={`py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold text-sm lg:text-base ${
                      coin.price_change_percentage_24h < 0 ? TC.textNegative : TC.textPositive
                    }`}>
                      {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                    </td>
                    <td className={`py-3 lg:py-4 px-3 lg:px-4 xl:px-6 ${TC.textSecondary}`}>
                      <div className={`font-medium text-sm lg:text-base ${TC.textSecondary}`}>
                        {formatCurrency(coin.market_cap)}
                      </div>
                    </td>
                    <td className={`py-3 lg:py-4 px-3 lg:px-4 xl:px-6 ${TC.textSecondary}`}>
                      <div className={`font-medium text-sm lg:text-base ${TC.textSecondary}`}>
                        {formatCurrency(coin.total_volume)}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className="flex items-center justify-center">
                        <button
                          className={`rounded-lg lg:rounded-xl p-2 lg:p-2.5 xl:p-3 transition-all duration-200 
                                    hover:shadow-cyan-500/25 transform hover:scale-105 border
                                    flex items-center gap-1 lg:gap-1.5 xl:gap-2 group text-xs lg:text-sm ${TC.bgButton}`}
                          onClick={() => handleView(coin)}
                          title="View Details"
                        >
                          <FaEye className="text-xs lg:text-sm group-hover:scale-110 transition-transform" />
                          <span className="font-medium">View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <div className={`px-4 py-3 sm:px-6 border-t fade-in ${TC.bgTableHead}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className={`text-xs sm:text-sm ${TC.textSecondary}`}>
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCoins.length)} of {filteredCoins.length} results
                  {searchTerm && (
                    <span className={`ml-2 ${isLight ? "text-cyan-700" : "text-cyan-400"}`}>
                      (filtered from {coins.length} total coins)
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {renderPaginationButtons()}
                </div>
              </div>
            </div>
          )}

          {/* Table Footer */}
          <div className={`px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 lg:py-4 border-t ${TC.borderDivide} fade-in ${TC.bgContainer}`}>
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 text-xs ${TC.textSecondary}`}>
              <span>Showing {paginatedCoins.length} of {filteredCoins.length} coin{filteredCoins.length !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Market Data
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminCryptocurrencies;