import { FaBell, FaSearch, FaTimes, FaExchangeAlt } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteWatchList, getData } from "@/api/axiosConfig";
import SparklineChart from "@/Components/Common/SparklineChart";
import useUserContext from "@/Context/UserContext/useUserContext";
import { MdDeleteForever } from "react-icons/md";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TradeModal from "./UserProfile/Components/TradeModal";

const Watchlist = () => {
  const { user } = useUserContext();
  const { coins: liveCoins } = useCoinContext();

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
      .map((item) => liveCoins.find((coin) => coin.id === item.id))
      .filter(Boolean);
  }, [data, liveCoins]);

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
    // console.log("Bell clicked for:", coin.name);
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

  const handleTrade = useCallback((coin, type = "buy") => {
    setTradeModal({
      show: true,
      coin,
      type,
    });
  }, []);

  const handleCoinClick = useCallback(
    (coin) => {
      navigate(`/coin/coin-details/${coin.id}`);
    },
    [navigate]
  );

  const formatCurrency = useCallback((value) => {
    if (!value) return "$0";

    return (
      "$" +
      (value >= 1e12
        ? (value / 1e12).toFixed(1) + "T"
        : value >= 1e9
        ? (value / 1e9).toFixed(1) + "B"
        : value >= 1e6
        ? (value / 1e6).toFixed(1) + "M"
        : value.toLocaleString("en-IN"))
    );
  }, []);

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
          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm fade-in ${
            currentPage === page
              ? "bg-cyan-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          style={{ animationDelay: `${0.8 + index * 0.05}s` }}
        >
          {page}
        </button>
      );
    });
  }, [totalPages, currentPage]);

  return (
    <>
      <main
        className="flex-1 space-y-6 fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <Outlet />

        {/* Header Section */}
        <div className="mx-3 sm:mx-4 lg:mx-6 mt-6 md:mt-8">
          <div
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-cyan-400">
                Watchlist
              </h1>
              <p className="text-sm text-gray-400 mt-2">
                Track your favorite cryptocurrencies
              </p>
            </div>

            {/* Search Bar */}
            <div
              className="relative w-full lg:w-64 fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white text-lg transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              {searchTerm && (
                <div className="text-center lg:text-left mt-2 text-sm text-gray-400">
                  Found {filteredCoins.length} coin
                  {filteredCoins.length !== 1 ? "s" : ""} matching "{searchTerm}
                  "
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden mx-3 sm:mx-4 space-y-3 mb-6">
          {loading ? (
            <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-6 text-center fade-in">
              <div className="flex justify-center items-center gap-3 text-cyan-400">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading watchlist...</span>
              </div>
            </div>
          ) : paginatedCoins.length > 0 ? (
            paginatedCoins.map((coin, index) => (
              <div
                key={coin.id}
                onClick={() => handleCoinClick(coin)}
                className="bg-[#111827] border border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-300 fade-in group"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                {/* Header with Bell, Coin Info, and Delete */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBellClick(coin);
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <FaBell className="text-lg" />
                    </button>
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-10 h-10 flex-shrink-0 rounded-full group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-base truncate group-hover:text-cyan-300 transition-colors">
                        {coin.name}
                      </div>
                      <div className="text-gray-400 text-sm uppercase">
                        {coin.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(coin);
                    }}
                    className="bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white rounded-lg p-2 transition-all duration-200"
                  >
                    <MdDeleteForever className="text-lg" />
                  </button>
                </div>

                {/* Price and Performance */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white font-bold text-lg group-hover:text-cyan-300 transition-colors">
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

                {/* Performance Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div
                    className={`text-center p-2 rounded ${
                      coin.price_change_percentage_1h_in_currency < 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    <div>1H</div>
                    <div className="font-semibold">
                      {coin.price_change_percentage_1h_in_currency?.toFixed(2)}%
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
                      {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {/* Market Data */}
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">Market Cap</div>
                    <div className="text-gray-300 font-medium">
                      {formatCurrency(coin.market_cap)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">Volume</div>
                    <div className="text-gray-300 font-medium">
                      {formatCurrency(coin.total_volume)}
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
                      handleTrade(coin, "buy");
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg"
                  >
                    Buy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrade(coin, "sell");
                    }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg"
                  >
                    Sell
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 fade-in bg-transparent border border-gray-700 rounded-xl p-8">
              {searchTerm
                ? "No coins match your search"
                : "Your watchlist is empty"}
              {!searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Add coins to your watchlist to track them here
                </p>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block mx-4 lg:mx-6">
          {loading ? (
            <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-8 text-center fade-in">
              <div className="flex justify-center items-center gap-3 text-cyan-400">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Loading watchlist...
              </div>
            </div>
          ) : filteredCoins.length === 0 ? (
            <div className="bg-transparent border border-gray-700 shadow-lg rounded-xl p-8 text-center fade-in">
              <div className="text-gray-400 text-lg">
                {searchTerm
                  ? "No coins match your search"
                  : "Your watchlist is empty"}
              </div>
              {!searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Add coins to your watchlist to track them here
                </p>
              )}
            </div>
          ) : (
            <div
              className="bg-transparent border border-gray-700 shadow-lg rounded-xl overflow-hidden fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {/* Responsive Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left min-w-[1200px]">
                  <thead className="text-gray-400 text-sm">
                    <tr className="border-b border-gray-700">
                      {/* Fixed Columns - Sticky with solid background */}
                      <th className="sticky left-0 z-30 py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider text-center border-r border-gray-700 bg-[#111827] min-w-[60px]">
                        Alert
                      </th>
                      <th className="sticky left-[60px] z-30 py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider border-r border-gray-700 min-w-[200px] bg-[#111827]">
                        Coin
                      </th>

                      {/* Scrollable Columns */}
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[100px] bg-gray-900/80">
                        Price
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[80px] bg-gray-900/80">
                        1hr %
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[80px] bg-gray-900/80">
                        24h %
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[80px] bg-gray-900/80">
                        7D %
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[120px] bg-gray-900/80">
                        Market Cap
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[120px] bg-gray-900/80">
                        Volume
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[100px] bg-gray-900/80">
                        Chart
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider min-w-[120px] bg-gray-900/80">
                        Trade
                      </th>
                      <th className="py-4 px-4 xl:px-6 font-semibold uppercase tracking-wider text-center min-w-[120px] bg-gray-900/80">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm xl:text-base divide-y divide-gray-700">
                    {paginatedCoins.map((coin, index) => (
                      <tr
                        key={coin.id}
                        onClick={() => handleCoinClick(coin)}
                        className="transition-all duration-300 ease-out hover:bg-gray-800/30 fade-in cursor-pointer group"
                        style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                      >
                        {/* Fixed Columns - Sticky with solid background and shadow */}
                        <td
                          className="sticky left-0 z-20 py-4 px-4 xl:px-6 text-center border-r border-gray-700 bg-[#111827] shadow-[4px_0_10px_rgba(0,0,0,0.5)]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleBellClick(coin)}
                            className="text-gray-400 hover:text-yellow-400 transition-colors"
                            title="Set Alert"
                          >
                            <FaBell />
                          </button>
                        </td>
                        <td className="sticky left-[60px] z-20 py-4 px-4 xl:px-6 border-r border-gray-700 min-w-[200px] bg-[#111827] shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
                          <div className="flex items-center gap-3">
                            <img
                              src={coin.image}
                              alt={coin.name}
                              className="w-8 h-8 flex-shrink-0 rounded-full group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-white font-medium truncate group-hover:text-cyan-300 transition-colors">
                                {coin.name}
                              </div>
                              <div className="text-gray-400 text-sm uppercase">
                                {coin.symbol.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Scrollable Columns */}
                        <td className="py-4 px-4 xl:px-6 text-gray-300 font-medium min-w-[100px] group-hover:text-white transition-colors">
                          ${coin.current_price?.toLocaleString("en-IN") || "0"}
                        </td>
                        <td
                          className={`py-4 px-4 xl:px-6 font-medium min-w-[80px] group-hover:font-semibold transition-all ${
                            coin.price_change_percentage_1h_in_currency < 0
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {coin.price_change_percentage_1h_in_currency?.toFixed(
                            2
                          )}
                          %
                        </td>
                        <td
                          className={`py-4 px-4 xl:px-6 font-medium min-w-[80px] group-hover:font-semibold transition-all ${
                            coin.price_change_percentage_24h_in_currency < 0
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {coin.price_change_percentage_24h_in_currency?.toFixed(
                            2
                          )}
                          %
                        </td>
                        <td
                          className={`py-4 px-4 xl:px-6 font-medium min-w-[80px] group-hover:font-semibold transition-all ${
                            coin.price_change_percentage_7d_in_currency < 0
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {coin.price_change_percentage_7d_in_currency?.toFixed(
                            2
                          )}
                          %
                        </td>
                        <td className="py-4 px-4 xl:px-6 text-gray-300 min-w-[120px] group-hover:text-white transition-colors">
                          {formatCurrency(coin.market_cap)}
                        </td>
                        <td className="py-4 px-4 xl:px-6 text-gray-300 min-w-[120px] group-hover:text-white transition-colors">
                          {formatCurrency(coin.total_volume)}
                        </td>
                        <td className="py-4 px-4 xl:px-6 min-w-[100px]">
                          {coin.sparkline_in_7d?.price ? (
                            <SparklineChart
                              data={coin.sparkline_in_7d.price}
                              change={coin.price_change_percentage_24h}
                            />
                          ) : (
                            <span className="text-gray-500 text-xs">
                              No Data
                            </span>
                          )}
                        </td>
                        <td
                          className="py-4 px-4 xl:px-6 min-w-[120px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex gap-2">
                            <button
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105"
                              onClick={() => handleTrade(coin, "buy")}
                            >
                              Buy
                            </button>
                            {/* <button
                              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-2 xl:px-3 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105"
                              onClick={() => handleTrade(coin, "sell")}
                            >
                              Sell
                            </button> */}
                          </div>
                        </td>
                        <td
                          className="py-4 px-4 xl:px-6 min-w-[120px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleDelete(coin)}
                              className="
                                bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white 
                                rounded-xl px-3 py-2 transition-all duration-200 shadow-sm 
                                hover:shadow-lg transform hover:scale-105 border border-gray-600
                                flex items-center gap-2 text-sm
                              "
                              title="Remove from watchlist"
                            >
                              <MdDeleteForever className="text-base" />
                              <span className="font-medium">Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div
                className="bg-gray-900/80 backdrop-blur-sm px-4 xl:px-6 py-4 border-t border-gray-700 fade-in"
                style={{ animationDelay: "0.7s" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-400">
                  <span>
                    Showing {paginatedCoins.length} of {filteredCoins.length}{" "}
                    coins
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Live Data
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div
            className="flex flex-wrap justify-center mt-4 md:mt-6 gap-1.5 sm:gap-2 text-white pb-4 fade-in mx-3 sm:mx-4 lg:mx-6"
            style={{ animationDelay: "0.8s" }}
          >
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
      </main>

      {/* Trade Modal */}
      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal({ show: false, coin: null, type: "buy" })}
        coin={tradeModal.coin}
        userCoinData={data}
        type={tradeModal.type}
      />
    </>
  );
};

export default Watchlist;
