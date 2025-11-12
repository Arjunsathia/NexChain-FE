import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FaStar, FaRegStar, FaSearch, FaExchangeAlt } from "react-icons/fa";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import { postForm, getData, deleteWatchList } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import { useNavigate } from "react-router-dom";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { toast } from "react-toastify";

// Enhanced sparkline chart with color based on price change (same as Market Insight)
function Sparkline({ data = [], width = 100, height = 24, positive = true }) {
  if (!data || data.length === 0) return <div className="w-24 h-6" />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const color = positive ? "#10B981" : "#EF4444";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeOpacity="0.9"
      />
    </svg>
  );
}

function CoinTable({ onTrade }) {
  const { user } = useUserContext();
  const { coins, coinsLoading } = useCoinContext();
  const { purchasedCoins } = usePurchasedCoins();
  const [watchlist, setWatchlist] = useState([]);
  const [, setWatchlistData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const navigate = useNavigate();

  // Search and Pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch watchlist data
  const fetchWatchlist = useCallback(async () => {
    if (!user?.id) return;

    setLoadingWatchlist(true);
    try {
      const res = await getData("/watchlist", { user_id: user.id });
      setWatchlistData(res || []);
      // Extract coin IDs for quick lookup
      const watchlistIds = (res || []).map(item => item.id);
      setWatchlist(watchlistIds);
    } catch (err) {
      console.error("Failed to fetch watchlist data", err);
    } finally {
      setLoadingWatchlist(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Filter coins based on search term
  const filteredCoins = useMemo(() => {
    if (!searchTerm) return coins;
    
    const term = searchTerm.toLowerCase();
    return coins.filter(coin => 
      coin.name.toLowerCase().includes(term) ||
      coin.symbol.toLowerCase().includes(term)
    );
  }, [coins, searchTerm]);

  // Enhanced coins with watchlist status and user holdings
  const enhancedCoins = useMemo(() => {
    return filteredCoins.map(coin => {
      const isInWatchlist = watchlist.includes(coin.id);
      const userHolding = purchasedCoins.find(
        pc => pc.coin_id === coin.id || pc.id === coin.id
      );
      
      return {
        ...coin,
        isInWatchlist,
        userHolding: userHolding || null
      };
    });
  }, [filteredCoins, watchlist, purchasedCoins]);

  const toggleWishlist = useCallback(async (coinId, data) => {
    const isCurrentlyInWatchlist = watchlist.includes(coinId);
    
    // Optimistic update
    setWatchlist(prev =>
      isCurrentlyInWatchlist
        ? prev.filter(id => id !== coinId)
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
      if (isCurrentlyInWatchlist) {
        // Remove from watchlist
        await deleteWatchList("/watchlist/remove", {
          id: coinId,
          user_id: user?.id,
        });
        toast.success("Coin removed from watchlist!", {
          icon: "✅",
          style: {
            background: "#111827",
            color: "#22c55e",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      } else {
        // Add to watchlist
        await postForm("/watchlist/add", postData);
        toast.success("Coin added to watchlist!", {
          icon: "⭐",
          style: {
            background: "#111827",
            color: "#eab308",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
          },
        });
      }
      // Refresh watchlist data
      await fetchWatchlist();
    } catch (err) {
      console.error("Watchlist operation failed:", err);
      // Revert optimistic update on error
      setWatchlist(prev =>
        isCurrentlyInWatchlist
          ? [...prev, coinId]
          : prev.filter(id => id !== coinId)
      );
      toast.error("Operation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [watchlist, user?.id, fetchWatchlist]);

  const formatCurrency = useCallback((value) => {
    if (!value) return "$0";
    
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  }, []);

  // Handle trade button click
  const handleTrade = useCallback((coin) => {
    onTrade(coin);
  }, [onTrade]);

  // Memoized pagination calculations using enhanced coins
  const { paginatedCoins, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(enhancedCoins.length / itemsPerPage);
    const paginatedCoins = enhancedCoins.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { paginatedCoins, totalPages };
  }, [enhancedCoins, currentPage, itemsPerPage]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

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
          className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 fade-in ${
            currentPage === page
              ? "bg-cyan-600 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          style={{ animationDelay: `${0.8 + index * 0.05}s` }}
        >
          {page}
        </button>
      );
    });
  }, [totalPages, currentPage]);

  if (coinsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center fade-in">
          <div className="flex justify-center items-center gap-3 text-cyan-400">
            <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-base">Loading coins...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-3 sm:p-4 lg:p-6">
      <main className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
            <div className="fade-in" style={{ animationDelay: "0.2s" }}>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Cryptocurrency Prices
              </h1>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64 fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coins by name or symbol..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-lg transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
          {searchTerm && (
            <div className="text-sm text-gray-400 mb-4 fade-in" style={{ animationDelay: "0.4s" }}>
              Found {enhancedCoins.length} coin{enhancedCoins.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3">
          {paginatedCoins.length > 0 ? (
            paginatedCoins.map((coin, index) => (
              <div
                key={coin.id}
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group fade-in"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                {/* Header with Star and Name */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(coin.id, coin);
                      }}
                      disabled={submitting || loadingWatchlist}
                      className="flex-shrink-0"
                    >
                      {submitting || loadingWatchlist ? (
                        <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : coin.isInWatchlist ? (
                        <FaStar className="text-yellow-400 text-xl hover:scale-110 transition-transform" />
                      ) : (
                        <FaRegStar className="text-gray-500 hover:text-yellow-400 transition-colors text-xl" />
                      )}
                    </button>
                    <img src={coin.image} alt={coin.name} className="w-10 h-10 flex-shrink-0 rounded-full group-hover:scale-110 transition-transform duration-300" />
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-base truncate group-hover:text-cyan-400 transition-colors">{coin.name}</div>
                      <div className="text-gray-400 text-sm uppercase">{coin.symbol.toUpperCase()}</div>
                      {/* Show holdings badge if user has this coin */}
                      {coin.userHolding && (
                        <div className="text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Holding:{" "}
                          {coin.userHolding.totalQuantity?.toFixed(6) ||
                            coin.userHolding.quantity?.toFixed(6)}{" "}
                          {coin.symbol.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`font-semibold text-sm px-2 py-1 rounded-lg ${
                    coin.price_change_percentage_24h < 0 ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
                  }`}>
                    {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                  </div>
                </div>

                {/* Price and Chart */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-bold text-xl">
                    ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || "0"}
                  </div>
                  <div className="w-20 h-10">
                    <Sparkline 
                      data={coin.sparkline_in_7d?.price || []} 
                      width={80} 
                      height={40}
                      positive={coin.price_change_percentage_24h >= 0}
                    />
                  </div>
                </div>

                {/* Market Cap and Volume */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="bg-gray-700/30 p-2 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Market Cap</div>
                    <div className="text-gray-200 font-medium">{formatCurrency(coin.market_cap)}</div>
                  </div>
                  <div className="bg-gray-700/30 p-2 rounded-lg">
                    <div className="text-gray-400 text-xs mb-1">Volume</div>
                    <div className="text-gray-200 font-medium">{formatCurrency(coin.total_volume)}</div>
                  </div>
                </div>

                {/* Trade Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrade(coin);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/50 fade-in"
                  style={{ animationDelay: `${0.5 + index * 0.1 + 0.05}s` }}
                >
                  <FaExchangeAlt className="text-sm" />
                  Trade
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="text-5xl mb-3">🔍</div>
              No coins found matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
            {paginatedCoins.length === 0 ? (
              <div className="p-12 text-center text-gray-400 fade-in" style={{ animationDelay: "0.5s" }}>
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-xl">
                  No coins found matching "{searchTerm}"
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 bg-gray-900/50 fade-in" style={{ animationDelay: "0.5s" }}>
                      <th className="py-4 px-6 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        ★
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Coin
                      </th>
                      <th className="py-4 px-6 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="py-4 px-6 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        24h %
                      </th>
                      <th className="py-4 px-6 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Market Cap
                      </th>
                      <th className="py-4 px-6 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Trend
                      </th>
                      <th className="py-4 px-6 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Trade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedCoins.map((coin, index) => (
                      <tr
                        key={coin.id}
                        onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
                        className="hover:bg-gray-700/30 cursor-pointer transition-all duration-200 group fade-in"
                        style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                      >
                        {/* Star */}
                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleWishlist(coin.id, coin)}
                            disabled={submitting || loadingWatchlist}
                            className="flex justify-center w-full fade-in"
                            style={{ animationDelay: `${0.6 + index * 0.05 + 0.02}s` }}
                          >
                            {submitting || loadingWatchlist ? (
                              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : coin.isInWatchlist ? (
                              <FaStar className="text-yellow-400 hover:scale-110 transition-transform" />
                            ) : (
                              <FaRegStar className="text-gray-500 hover:text-yellow-400 transition-colors" />
                            )}
                          </button>
                        </td>

                        {/* Coin Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3 fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.03}s` }}>
                            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300" />
                            <div className="min-w-0 flex-1">
                              <div className="text-base font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                {coin.name}
                              </div>
                              <div className="text-sm text-gray-400 uppercase">
                                {coin.symbol.toUpperCase()}
                              </div>
                              {/* Show holdings badge if user has this coin */}
                              {coin.userHolding && (
                                <div className="text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                                  Holding:{" "}
                                  {coin.userHolding.totalQuantity?.toFixed(6) ||
                                    coin.userHolding.quantity?.toFixed(6)}{" "}
                                  {coin.symbol.toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-4 px-6 text-right fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.04}s` }}>
                          <div className="text-base font-semibold text-white">
                            ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || "0"}
                          </div>
                        </td>

                        {/* 24H Change */}
                        <td className={`py-4 px-6 text-right font-semibold fade-in ${
                          coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                        }`} style={{ animationDelay: `${0.6 + index * 0.05 + 0.05}s` }}>
                          {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                        </td>

                        {/* Market Cap */}
                        <td className="py-4 px-6 text-right fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.06}s` }}>
                          <div className="text-sm text-gray-300">
                            {formatCurrency(coin.market_cap)}
                          </div>
                        </td>

                        {/* Volume */}
                        <td className="py-4 px-6 text-right fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.07}s` }}>
                          <div className="text-sm text-gray-300">
                            {formatCurrency(coin.total_volume)}
                          </div>
                        </td>

                        {/* Chart - Same as Market Insight */}
                        <td className="py-4 px-6 fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.08}s` }}>
                          <div className="flex justify-center">
                            <Sparkline 
                              data={coin.sparkline_in_7d?.price || []} 
                              width={100} 
                              height={40}
                              positive={coin.price_change_percentage_24h >= 0}
                            />
                          </div>
                        </td>

                        {/* Trade Button */}
                        <td className="py-4 px-6 fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.09}s` }}>
                          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleTrade(coin)}
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-cyan-500/50 flex items-center gap-2"
                            >
                              <FaExchangeAlt className="text-xs" />
                              Trade
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            {paginatedCoins.length > 0 && (
              <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700 fade-in" style={{ animationDelay: "0.7s" }}>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>
                    Showing {paginatedCoins.length} of {enhancedCoins.length} coins
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 pt-6 pb-6 fade-in" style={{ animationDelay: "0.8s" }}>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 fade-in"
                style={{ animationDelay: "0.85s" }}
              >
                Prev
              </button>
              {renderPaginationButtons}
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 fade-in"
                style={{ animationDelay: "0.9s" }}
              >
                Next
              </button>
            </div>
            <div className="text-sm text-gray-400 fade-in" style={{ animationDelay: "0.95s" }}>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CoinTable;