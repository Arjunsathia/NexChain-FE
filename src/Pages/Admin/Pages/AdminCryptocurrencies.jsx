import React, { useState, useCallback, useMemo } from "react";
import { FaSearch, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // ADD THIS IMPORT
import useCoinContext from "@/Context/CoinContext/useCoinContext";

function AdminCryptocurrencies() {
  const { coins, coinsLoading } = useCoinContext();
  const navigate = useNavigate(); // ADD THIS HOOK

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

//   const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
//   const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

  // Reset to first page when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

//   const clearSearch = () => {
//     setSearchTerm("");
//     setCurrentPage(1);
//   };

  // View coin details - UPDATED TO NAVIGATE
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
        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-xs sm:text-sm"
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
              ? "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/25"
              : "border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
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
        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-600 bg-gray-800/50 text-gray-300 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-xs sm:text-sm"
      >
        Next
      </button>
    );

    return buttons;
  };

  if (coinsLoading) {
    return (
      <div className="flex-1 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6 fade-in">
        <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center">
          <div className="flex justify-center items-center gap-2 sm:gap-3 text-cyan-400">
            <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs sm:text-sm lg:text-base">Loading cryptocurrencies...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 lg:py-6 space-y-3 sm:space-y-4 lg:space-y-6 fade-in">
      {/* Header Section with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 fade-in">
        <div className="flex-1 w-full sm:w-auto min-w-0">
          <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-cyan-400 truncate">Cryptocurrencies Management</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 truncate">Monitor all cryptocurrencies in the system</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full sm:w-48 lg:w-56 xl:w-64 order-2 sm:order-none">
          <div className="relative">
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-2 px-3 
                       text-white placeholder-gray-400 text-xs sm:text-sm focus:outline-none 
                       focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 
                       pr-9"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          </div>
        </div>
      </div>

      {/* Stats Cards - Removed Top Losers */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 fade-in">
        <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl p-4 sm:p-6">
          <div className="text-cyan-400 text-xs sm:text-sm font-semibold mb-2">Total Coins</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{coins.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4 sm:p-6">
          <div className="text-green-400 text-xs sm:text-sm font-semibold mb-2">Active Coins</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{coins.filter(c => c.current_price > 0).length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 sm:p-6">
          <div className="text-purple-400 text-xs sm:text-sm font-semibold mb-2">Top Gainers</div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            {coins.filter(c => c.price_change_percentage_24h > 0).length}
          </div>
        </div>
      </div>

      {/* Content Section */}
      {filteredCoins.length === 0 ? (
        <div className="bg-transparent border border-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 text-center fade-in">
          <div className="text-gray-400 text-sm sm:text-base lg:text-lg">
            {searchTerm ? "No coins found matching your search" : "No cryptocurrencies available"}
          </div>
        </div>
      ) : (
        <div className="bg-transparent border border-gray-700 rounded-xl overflow-hidden fade-in">
          {/* Mobile/Tablet Card View */}
          <div className="xl:hidden space-y-2 sm:space-y-3 p-2 sm:p-3 lg:p-4">
            {paginatedCoins.map((coin, index) => (
              <div
                key={coin.id}
                className="bg-gray-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-gray-700
                  transition-all duration-300 ease-out hover:bg-gray-800/50 hover:border-gray-600 fade-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0 pr-2 sm:pr-3">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <img 
                        src={coin.image} 
                        alt={coin.name} 
                        className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full border border-gray-600" 
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg truncate">
                          {coin.name}
                        </h3>
                        <p className="text-cyan-400 text-xs sm:text-sm uppercase">
                          {coin.symbol.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <div className="text-white font-bold">${coin.current_price?.toLocaleString("en-IN") || "0"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">24h %:</span>
                        <div className={`font-bold ${coin.price_change_percentage_24h < 0 ? "text-red-400" : "text-green-400"}`}>
                          {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm mt-2">
                      <div>
                        <span className="text-gray-500">Market Cap:</span>
                        <div className="text-gray-300 font-medium">{formatCurrency(coin.market_cap)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Volume:</span>
                        <div className="text-gray-300 font-medium">{formatCurrency(coin.total_volume)}</div>
                      </div>
                    </div>
                  </div>
                  <span className="text-gray-500 text-xs sm:text-sm flex-shrink-0">
                    #{coin.market_cap_rank || "N/A"}
                  </span>
                </div>
                
                {/* Only View button remains */}
                <div className="flex justify-center mt-3">
                  <button
                    className="bg-gray-700/50 hover:bg-blue-600 text-blue-400 hover:text-white 
                              rounded-lg p-2 sm:p-3 transition-all duration-200 
                              flex items-center justify-center gap-2
                              border border-gray-600 hover:border-blue-500
                              shadow-sm hover:shadow-blue-500/25 transform hover:scale-105
                              w-full sm:w-auto text-xs sm:text-sm"
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
              <thead className="text-gray-400 text-sm bg-gray-800/50">
                <tr className="border-b border-gray-700">
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Rank</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Coin</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Price</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">24h %</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Market Cap</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm">Volume</th>
                  <th className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold uppercase tracking-wider text-xs lg:text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm xl:text-base divide-y divide-gray-700">
                {paginatedCoins.map((coin, index) => (
                  <tr
                    key={coin.id}
                    className="transition-all duration-300 ease-out hover:bg-gray-800/40 fade-in"
                    style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                  >
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6 text-gray-300 font-medium text-xs lg:text-sm text-center">
                      #{coin.market_cap_rank || "N/A"}
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <img 
                          src={coin.image} 
                          alt={coin.name} 
                          className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0 rounded-full border border-gray-600" 
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium text-sm lg:text-base">{coin.name}</div>
                          <div className="text-gray-400 text-xs lg:text-sm uppercase">{coin.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className="text-white font-bold text-sm lg:text-base">
                        ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || "0.00"}
                      </div>
                    </td>
                    <td className={`py-3 lg:py-4 px-3 lg:px-4 xl:px-6 font-semibold text-sm lg:text-base ${
                      coin.price_change_percentage_24h < 0 ? "text-red-400" : "text-green-400"
                    }`}>
                      {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className="text-gray-300 font-medium text-sm lg:text-base">
                        {formatCurrency(coin.market_cap)}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className="text-gray-300 font-medium text-sm lg:text-base">
                        {formatCurrency(coin.total_volume)}
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-3 lg:px-4 xl:px-6">
                      <div className="flex items-center justify-center">
                        <button
                          className="bg-gray-700/50 hover:bg-blue-600 text-blue-400 hover:text-white 
                                    rounded-lg lg:rounded-xl p-2 transition-all duration-200 
                                    hover:shadow-blue-500/25 transform hover:scale-105 border border-gray-600 hover:border-blue-500
                                    flex items-center gap-1 lg:gap-2 group text-xs lg:text-sm"
                          onClick={() => handleView(coin)}
                          title="View Details"
                        >
                          <FaEye className="text-xs lg:text-sm" />
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
            <div className="border-t border-gray-700 bg-gray-800/50 px-4 py-3 sm:px-6 fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-gray-400">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCoins.length)} of {filteredCoins.length} results
                  {searchTerm && (
                    <span className="ml-2 text-cyan-400">
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
          <div className="bg-gray-800/50 px-2 sm:px-3 lg:px-4 xl:px-6 py-2 sm:py-3 lg:py-4 border-t border-gray-700 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-2 text-xs text-gray-400">
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