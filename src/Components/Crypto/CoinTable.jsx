import React, { useState, useCallback, useMemo } from "react";
import { FaStar, FaRegStar, FaSearch } from "react-icons/fa";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import SparklineChart from "../Common/SparklineChart";
import { postForm } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import { useNavigate } from "react-router-dom";

function CoinTable() {
  const { user } = useUserContext();
  const [wishlist, setWishlist] = useState([]);
  const { coins, coinsLoading } = useCoinContext();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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

  const toggleWishlist = useCallback(async (coinId, data) => {
    setWishlist((prev) =>
      prev.includes(coinId)
        ? prev.filter((id) => id !== coinId)
        : [...prev, coinId]
    );

    const postData = {
      user_id: user?.id,
      id: data?.id,
      image: data?.image,
      symbol: data?.symbol,
      current_price: data?.current_price,
      price_change_percentage_1h_in_currency: data?.price_change_percentage_1h_in_currency,
      price_change_percentage_24h_in_currency: data?.price_change_percentage_24h_in_currency,
      price_change_percentage_24h: data?.price_change_percentage_24h,
      price_change_percentage_7d_in_currency: data?.price_change_percentage_7d_in_currency,
      market_cap: data?.market_cap,
      total_volume: data?.total_volume,
      sparkline_in_7d: { price: data?.sparkline_in_7d?.price },
    };

    setSubmitting(true);
    try {
      await postForm("/watchlist/add", postData);
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  }, [user?.id]);

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

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

  const handleBuy = (coin) => {
    // console.log("Buy clicked for:", coin.name);
    alert(`Buy feature for ${coin.name} - Integrate your preferred payment method here`);
  };

  // Reset to first page when search term changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const renderPaginationButtons = useMemo(() => {
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return [...Array(endPage - startPage + 1)].map((_, index) => {
      const page = startPage + index;
      return (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm fade-in ${
            currentPage === page
              ? "bg-cyan-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          style={{ animationDelay: `${0.8 + (index * 0.05)}s` }}
        >
          {page}
        </button>
      );
    });
  }, [totalPages, currentPage]);

  if (coinsLoading) {
    return (
      <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-6 md:p-8 text-center mx-3 sm:mx-4 lg:mx-6 fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="flex justify-center items-center gap-3 text-cyan-400">
          <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm md:text-base">Loading coins...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 sm:mx-4 lg:mx-6 mt-6 md:mt-8 fade-in" style={{ animationDelay: "0.4s" }}>
      {/* Search Bar */}
      <div className="mb-6 fade-in" style={{ animationDelay: "0.45s" }}>
        <div className="relative max-w-md mx-auto lg:mx-0 lg:max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search coins by name or symbol..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="text-center lg:text-left mt-2 text-sm text-gray-400">
            Found {filteredCoins.length} coin{filteredCoins.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 mb-6">
        {paginatedCoins.length > 0 ? (
          paginatedCoins.map((coin, index) => (
            <div
              key={coin.id}
              onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              className="bg-[#111827] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-300 fade-in"
              style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
            >
              {/* Header with Star and Name */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(coin.id, coin);
                    }}
                    disabled={submitting}
                    className="flex-shrink-0"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : wishlist.includes(coin.id) ? (
                      <FaStar className="text-yellow-400 text-lg" />
                    ) : (
                      <FaRegStar className="text-gray-500 hover:text-yellow-400 transition-colors text-lg" />
                    )}
                  </button>
                  <img src={coin.image} alt={coin.name} className="w-10 h-10 flex-shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-semibold text-base truncate">{coin.name}</div>
                    <div className="text-gray-400 text-sm uppercase">{coin.symbol.toUpperCase()}</div>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${
                  coin.price_change_percentage_24h < 0 ? "text-red-400" : "text-green-400"
                }`}>
                  {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                </div>
              </div>

              {/* Price and Chart */}
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-bold text-lg">
                  ${coin.current_price?.toLocaleString("en-IN") || "0"}
                </div>
                <div className="w-24 h-10">
                  {coin.sparkline_in_7d?.price ? (
                    <SparklineChart
                      data={coin.sparkline_in_7d.price}
                      change={coin.price_change_percentage_24h}
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">No Data</span>
                  )}
                </div>
              </div>

              {/* Market Cap and Volume */}
              <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Market Cap</div>
                  <div className="text-gray-300 font-medium">{formatCurrency(coin.market_cap)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Volume</div>
                  <div className="text-gray-300 font-medium">{formatCurrency(coin.total_volume)}</div>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuy(coin);
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg"
              >
                Buy
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400 fade-in">
            No coins found matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-transparent border border-gray-700 shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left min-w-[900px]">
            <thead className="text-gray-400 text-sm">
              <tr className="border-b border-gray-700">
                <th className="sticky left-0 z-30 py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider text-center border-r border-gray-700 bg-[#111827] min-w-[60px]">
                  ★
                </th>
                <th className="sticky left-[60px] z-30 py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider border-r border-gray-700 min-w-[200px] bg-[#111827]">
                  Name
                </th>
                <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[100px] bg-gray-900/80">Price</th>
                <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[80px] bg-gray-900/80">24h %</th>
                <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[120px] bg-gray-900/80">Market Cap</th>
                <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[120px] bg-gray-900/80">Volume</th>
                <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[100px] bg-gray-900/80">Chart</th>
                <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[80px] bg-gray-900/80">Trade</th>
              </tr>
            </thead>
            <tbody className="text-sm xl:text-base divide-y divide-gray-700">
              {paginatedCoins.length > 0 ? (
                paginatedCoins.map((coin, index) => (
                  <tr
                    key={coin.id}
                    onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
                    className="transition-all duration-300 ease-out hover:bg-gray-800/30 fade-in cursor-pointer"
                    style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
                  >
                    <td className="sticky left-0 z-20 py-4 px-4 xl:px-6 text-center border-r border-gray-700 bg-[#111827] shadow-[4px_0_10px_rgba(0,0,0,0.5)]" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleWishlist(coin.id, coin)}
                        disabled={submitting}
                        className="flex justify-center w-full"
                      >
                        {submitting ? (
                          <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : wishlist.includes(coin.id) ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-500 hover:text-yellow-400 transition-colors" />
                        )}
                      </button>
                    </td>
                    <td className="sticky left-[60px] z-20 py-4 px-4 xl:px-6 border-r border-gray-700 min-w-[200px] bg-[#111827] shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center gap-3">
                        <img src={coin.image} alt={coin.name} className="w-8 h-8 flex-shrink-0 rounded-full" />
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium truncate">{coin.name}</div>
                          <div className="text-gray-400 text-sm uppercase">{coin.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 xl:px-6 text-gray-300 font-medium min-w-[100px]">
                      ${coin.current_price?.toLocaleString("en-IN") || "0"}
                    </td>
                    <td className={`py-4 px-4 xl:px-6 font-medium min-w-[80px] ${
                      coin.price_change_percentage_24h < 0 ? "text-red-400" : "text-green-400"
                    }`}>
                      {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                    </td>
                    <td className="py-4 px-4 xl:px-6 text-gray-300 min-w-[120px]">
                      {formatCurrency(coin.market_cap)}
                    </td>
                    <td className="py-4 px-4 xl:px-6 text-gray-300 min-w-[120px]">
                      {formatCurrency(coin.total_volume)}
                    </td>
                    <td className="py-4 px-4 xl:px-6 min-w-[100px]">
                      {coin.sparkline_in_7d?.price ? (
                        <SparklineChart
                          data={coin.sparkline_in_7d.price}
                          change={coin.price_change_percentage_24h}
                        />
                      ) : (
                        <span className="text-gray-500 text-xs">No Data</span>
                      )}
                    </td>
                    <td className="py-4 px-4 xl:px-6 min-w-[80px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuy(coin);
                        }}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 xl:px-4 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105"
                      >
                        Buy
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-400 fade-in">
                    No coins found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-gray-900/80 backdrop-blur-sm px-4 xl:px-6 py-4 border-t border-gray-700 fade-in" style={{ animationDelay: "0.7s" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-400">
            <span>Showing {paginatedCoins.length} of {filteredCoins.length} coins</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Live Data
            </span>
          </div>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-4 md:mt-6 gap-1.5 sm:gap-2 text-white pb-4 fade-in" style={{ animationDelay: "0.8s" }}>
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
          >
            Prev
          </button>
          {renderPaginationButtons}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 text-xs sm:text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default CoinTable;