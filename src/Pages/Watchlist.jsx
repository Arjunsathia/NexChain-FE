import { FaBell, FaSearch, FaTimes, FaExchangeAlt, FaEye } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteWatchList, getData } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import { MdDeleteForever } from "react-icons/md";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TradeModal from "./UserProfile/Components/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";

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

const Watchlist = () => {
  const { user } = useUserContext();
  const { coins: liveCoins } = useCoinContext();
  const { purchasedCoins } = usePurchasedCoins();

  const userFromLocalStorage = JSON.parse(
    localStorage.getItem("NEXCHAIN_USER")
  );
  const userId = user?.id || userFromLocalStorage?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  const itemsPerPage = 10;
  const navigate = useNavigate();

  const mergedCoins = useMemo(() => {
    return data
      .map((item) => {
        const liveCoin = liveCoins.find((coin) => coin.id === item.id);
        if (liveCoin) {
          const userHolding = purchasedCoins.find(
            (pc) => pc.coin_id === item.id || pc.id === item.id
          );
          return {
            ...liveCoin,
            userHolding: userHolding || null,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [data, liveCoins, purchasedCoins]);

  const filteredCoins = useMemo(() => {
    if (!searchTerm) return mergedCoins;
    return mergedCoins.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mergedCoins, searchTerm]);

  // Pagination calculations
  const { paginatedCoins, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
    const paginatedCoins = filteredCoins.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { paginatedCoins, totalPages };
  }, [filteredCoins, currentPage, itemsPerPage]);

  const fetchData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const res = await getData("/watchlist", { user_id: userId });
      setData(res || []);
    } catch (err) {
      console.error("Failed to fetch watchlist data", err);
      toast.error("Failed to fetch watchlist data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBellClick = useCallback((coin) => {
    toast.info(`Price alert set for ${coin.name}`);
  }, []);

  const handleDelete = useCallback(
    async (coin) => {
      const confirmed = window.confirm(
        "Are you sure you want to remove this coin from your watchlist?"
      );
      if (!confirmed) return;

      setLoading(true);
      try {
        await deleteWatchList("/watchlist/remove", {
          id: coin?.id,
          user_id: userId,
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
        fetchData();
      } catch (err) {
        console.error("Failed to remove from watchlist:", err);
        toast.error("Failed to remove coin. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchData]
  );

  const handleTrade = useCallback((coin) => {
    setTradeModal({
      show: true,
      coin,
      type: "buy",
    });
  }, []);

  const handleCoinClick = useCallback(
    (coin) => {
      navigate(`/coin/coin-details/${coin.id}`);
    },
    [navigate]
  );

  // Pagination handlers
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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

  // Format currency function (same as Market Insight)
  const formatCurrency = useCallback((value) => {
    if (!value) return "$0";
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  }, []);

  // Pagination buttons
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
          className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
            currentPage === page
              ? "bg-cyan-600 text-white shadow-lg"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          {page}
        </button>
      );
    });
  }, [totalPages, currentPage]);

  return (
    <>
      <main className="min-h-screen text-white p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Outlet />

          {/* Header Section */}
          <div className="fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Watchlist
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Track your favorite cryptocurrencies
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 fade-in">
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
              <div className="text-sm text-gray-400 mb-4 fade-in">
                Found {filteredCoins.length} coin
                {filteredCoins.length !== 1 ? "s" : ""} matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {loading ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center fade-in">
                <div className="flex justify-center items-center gap-3 text-cyan-400">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-base">Loading watchlist...</span>
                </div>
              </div>
            ) : paginatedCoins.length > 0 ? (
              paginatedCoins.map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => handleCoinClick(coin)}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-700/50 hover:border-cyan-500/50 transition-all duration-300 group fade-in"
                >
                  {/* Header with Bell, Coin Info, and 24H Change */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBellClick(coin);
                        }}
                        className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-yellow-500/20 hover:text-yellow-400 transition-all duration-200"
                        title="Set Alert"
                      >
                        <FaBell className="text-sm" />
                      </button>
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="w-10 h-10 flex-shrink-0 rounded-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-semibold text-base truncate group-hover:text-cyan-400 transition-colors">
                          {coin.name}
                        </div>
                        <div className="text-gray-400 text-sm uppercase">
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
                    <div
                      className={`font-semibold text-sm px-2 py-1 rounded-lg ${
                        coin.price_change_percentage_24h < 0
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                    </div>
                  </div>

                  {/* Price and Chart */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-white font-bold text-xl">
                      $
                      {coin.current_price?.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      }) || "0"}
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

                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div
                      className={`text-center p-2 rounded ${
                        coin.price_change_percentage_1h_in_currency < 0
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      <div>1H</div>
                      <div className="font-semibold">
                        {coin.price_change_percentage_1h_in_currency?.toFixed(2)}
                        %
                      </div>
                    </div>
                    <div
                      className={`text-center p-2 rounded ${
                        coin.price_change_percentage_24h_in_currency < 0
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      <div>24H</div>
                      <div className="font-semibold">
                        {coin.price_change_percentage_24h_in_currency?.toFixed(2)}
                        %
                      </div>
                    </div>
                    <div
                      className={`text-center p-2 rounded ${
                        coin.price_change_percentage_7d_in_currency < 0
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      <div>7D</div>
                      <div className="font-semibold">
                        {coin.price_change_percentage_7d_in_currency?.toFixed(2)}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTrade(coin);
                      }}
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <FaExchangeAlt className="text-sm" />
                      Trade
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(coin);
                      }}
                      className="bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white rounded-lg px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <MdDeleteForever className="text-base" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl fade-in">
                <div className="text-5xl mb-3">⭐</div>
                {searchTerm
                  ? `No coins found matching "${searchTerm}"`
                  : "Your watchlist is empty"}
                {!searchTerm && (
                  <p className="text-sm text-gray-500 mt-2">
                    Add coins to your watchlist to track them here
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table View - Updated with Sparkline Chart */}
          <div className="hidden lg:block fade-in">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="flex justify-center items-center gap-3 text-cyan-400">
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-base">Loading watchlist...</span>
                  </div>
                </div>
              ) : paginatedCoins.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="text-6xl mb-4">⭐</div>
                  <div className="text-xl">
                    {searchTerm
                      ? `No coins found matching "${searchTerm}"`
                      : "Your watchlist is empty"}
                  </div>
                  {!searchTerm && (
                    <p className="text-sm text-gray-500 mt-2">
                      Add coins to your watchlist to track them here
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-900/50">
                        <th className="py-4 px-6 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Alert
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {paginatedCoins.map((coin) => (
                        <tr
                          key={coin.id}
                          onClick={() => handleCoinClick(coin)}
                          className="hover:bg-gray-700/30 cursor-pointer transition-all duration-200 group fade-in"
                        >
                          {/* Bell Icon */}
                          <td
                            className="py-4 px-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleBellClick(coin)}
                              className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-yellow-500/20 hover:text-yellow-400 transition-all duration-200 mx-auto"
                              title="Set Alert"
                            >
                              <FaBell className="text-sm" />
                            </button>
                          </td>

                          {/* Coin Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <img
                                src={coin.image}
                                alt={coin.name}
                                className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300"
                              />
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
                          <td className="py-4 px-6 text-right">
                            <div className="text-base font-semibold text-white">
                              $
                              {coin.current_price?.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 6,
                              }) || "0"}
                            </div>
                          </td>

                          {/* 24H Change */}
                          <td
                            className={`py-4 px-6 text-right font-semibold ${
                              coin.price_change_percentage_24h >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                          </td>

                          {/* Market Cap */}
                          <td className="py-4 px-6 text-right">
                            <div className="text-gray-300 font-medium">
                              {formatCurrency(coin.market_cap)}
                            </div>
                          </td>

                          {/* Volume */}
                          <td className="py-4 px-6 text-right">
                            <div className="text-gray-300 font-medium">
                              {formatCurrency(coin.total_volume)}
                            </div>
                          </td>

                          {/* Chart - Same as Market Insight */}
                          <td className="py-4 px-6">
                            <div className="flex justify-center">
                              <Sparkline 
                                data={coin.sparkline_in_7d?.price || []} 
                                width={100} 
                                height={40}
                                positive={coin.price_change_percentage_24h >= 0}
                              />
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6">
                            <div
                              className="flex justify-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => handleTrade(coin)}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
                              >
                                <FaExchangeAlt className="text-xs" />
                                Trade
                              </button>
                              <button
                                onClick={() => handleDelete(coin)}
                                className="bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
                              >
                                <MdDeleteForever className="text-base" />
                                Remove
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
                <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-700 fade-in">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>
                      Showing {paginatedCoins.length} of {filteredCoins.length}{" "}
                      coins
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
            <div className="flex flex-col items-center gap-4 pt-6 pb-6 fade-in">
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  Prev
                </button>
                {renderPaginationButtons}
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </main>

      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal({ show: false, coin: null, type: "buy" })}
        coin={tradeModal.coin}
        userCoinData={data}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />
    </>
  );
};

export default Watchlist;