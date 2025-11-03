import { FaSearch, FaTimes } from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteWatchList, getData } from "@/api/axiosConfig";
import SparklineChart from "@/Components/Common/SparklineChart";
import useUserContext from "@/Context/UserContext/useUserContext";
import { MdDeleteForever } from "react-icons/md";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Watchlist = () => {
  const { user } = useUserContext();
  const { coins: liveCoins } = useCoinContext();
  
  const userFromLocalStorage = JSON.parse(localStorage.getItem("NEXCHAIN_USER") || "{}");
  const userId = user?.id || userFromLocalStorage?.id;
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const mergedCoins = useMemo(() => {
    return data
      .map((item) => liveCoins.find((coin) => coin.id === item.id))
      .filter(Boolean);
  }, [data, liveCoins]);

  const filteredCoins = useMemo(() => {
    if (!searchTerm) return mergedCoins;
    return mergedCoins.filter((coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mergedCoins, searchTerm]);

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

  const handleDelete = useCallback(async (coin) => {
    const confirmed = window.confirm("Are you sure you want to remove this coin from your watchlist?");
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
  }, [userId, fetchData]);

  const handleCoinClick = useCallback((coin) => {
    navigate(`/coin/coin-details/${coin.id}`);
  }, [navigate]);

  const formatCurrency = useCallback((value) => {
    if (!value) return "$0";
    
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  }, []);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePageClick = (page) => setCurrentPage(page);

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
          className={`px-2 sm:px-3 py-1 rounded text-xs ${
            currentPage === page
              ? "bg-cyan-600 text-white"
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
      <main className="flex-1 space-y-3">
        <Outlet />
        
        {/* Compact Header */}
        <div className="px-2 sm:px-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-cyan-400">Watchlist</h1>
              <p className="text-xs text-gray-400 mt-1">Track your favorite cryptocurrencies</p>
            </div>
            
            {/* Compact Search Bar */}
            <div className="relative w-full sm:w-56">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-8 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 text-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden px-2 sm:px-3 space-y-2">
          {loading ? (
            <div className="bg-transparent border border-gray-700 rounded-lg p-4 text-center">
              <div className="flex justify-center items-center gap-2 text-cyan-400">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading watchlist...</span>
              </div>
            </div>
          ) : paginatedCoins.length > 0 ? (
            paginatedCoins.map((coin) => (
              <div
                key={coin.id}
                onClick={() => handleCoinClick(coin)}
                className="bg-[#111827] border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800/50 transition-all duration-300 group"
              >
                {/* Header with Coin Info and Delete */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img 
                      src={coin.image} 
                      alt={coin.name} 
                      className="w-8 h-8 flex-shrink-0 rounded-full group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-semibold text-sm truncate group-hover:text-cyan-300 transition-colors">
                        {coin.name}
                      </div>
                      <div className="text-gray-400 text-xs uppercase">
                        {coin.symbol.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(coin);
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors p-1 flex-shrink-0"
                    title="Remove from watchlist"
                  >
                    <MdDeleteForever className="text-base" />
                  </button>
                </div>

                {/* Price and Performance */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-bold text-base group-hover:text-cyan-300 transition-colors">
                    ${coin.current_price?.toLocaleString("en-IN") || "0"}
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    coin.price_change_percentage_24h_in_currency < 0 
                      ? "bg-red-500/20 text-red-400" 
                      : "bg-green-500/20 text-green-400"
                  }`}>
                    {coin.price_change_percentage_24h_in_currency?.toFixed(2)}%
                  </div>
                </div>

                {/* Market Data */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Market Cap</div>
                    <div className="text-gray-300 font-medium truncate">{formatCurrency(coin.market_cap)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Volume</div>
                    <div className="text-gray-300 font-medium truncate">{formatCurrency(coin.total_volume)}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 bg-transparent border border-gray-700 rounded-lg p-6">
              {searchTerm ? "No coins match your search" : "Your watchlist is empty"}
              {!searchTerm && (
                <p className="text-xs text-gray-500 mt-1">Add coins to your watchlist to track them here</p>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block px-2 sm:px-3">
          {loading ? (
            <div className="bg-transparent border border-gray-700 rounded-xl p-6 text-center">
              <div className="flex justify-center items-center gap-2 text-cyan-400">
                <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                Loading watchlist...
              </div>
            </div>
          ) : filteredCoins.length === 0 ? (
            <div className="bg-transparent border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-gray-400">
                {searchTerm ? "No coins match your search" : "Your watchlist is empty"}
              </div>
              {!searchTerm && (
                <p className="text-sm text-gray-500 mt-1">Add coins to your watchlist to track them here</p>
              )}
            </div>
          ) : (
            <div className="bg-transparent border border-gray-700 rounded-xl overflow-hidden">
              {/* Compact Table */}
              <div className="overflow-x-auto">
                <table className="w-full table-auto text-left min-w-[800px]">
                  <thead className="text-gray-400 text-xs">
                    <tr className="border-b border-gray-700">
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider min-w-[180px]">Coin</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider min-w-[100px] text-right">Price</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider min-w-[80px] text-right">24h %</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider min-w-[120px] text-right">Market Cap</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider min-w-[120px] text-right">Volume</th>
                      <th className="py-3 px-3 font-semibold uppercase tracking-wider min-w-[80px] text-center">Chart</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-gray-700">
                    {paginatedCoins.map((coin) => (
                      <tr
                        key={coin.id}
                        onClick={() => handleCoinClick(coin)}
                        className="transition-all duration-300 ease-out hover:bg-gray-800/30 cursor-pointer group"
                      >
                        {/* Coin Info */}
                        <td className="py-3 px-3 min-w-[180px]">
                          <div className="flex items-center gap-2">
                            <img 
                              src={coin.image} 
                              alt={coin.name} 
                              className="w-6 h-6 flex-shrink-0 rounded-full group-hover:scale-110 transition-transform duration-300" 
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-white font-medium truncate group-hover:text-cyan-300 transition-colors">
                                {coin.name}
                              </div>
                              <div className="text-gray-400 text-xs uppercase">
                                {coin.symbol.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Price */}
                        <td className="py-3 px-3 text-gray-300 font-medium min-w-[100px] text-right group-hover:text-white transition-colors">
                          ${coin.current_price?.toLocaleString("en-IN") || "0"}
                        </td>
                        
                        {/* 24h Change */}
                        <td className={`py-3 px-3 font-medium min-w-[80px] text-right group-hover:font-semibold transition-all ${
                          coin.price_change_percentage_24h_in_currency < 0 ? "text-red-400" : "text-green-400"
                        }`}>
                          {coin.price_change_percentage_24h_in_currency?.toFixed(2)}%
                        </td>
                        
                        {/* Market Cap */}
                        <td className="py-3 px-3 text-gray-300 min-w-[120px] text-right group-hover:text-white transition-colors">
                          {formatCurrency(coin.market_cap)}
                        </td>
                        
                        {/* Volume */}
                        <td className="py-3 px-3 text-gray-300 min-w-[120px] text-right group-hover:text-white transition-colors">
                          {formatCurrency(coin.total_volume)}
                        </td>
                        
                        {/* Chart */}
                        <td className="py-3 px-3 min-w-[80px]">
                          {coin.sparkline_in_7d?.price ? (
                            <div className="flex justify-center">
                              <SparklineChart
                                data={coin.sparkline_in_7d.price}
                                change={coin.price_change_percentage_24h}
                                height={30}
                                width={60}
                              />
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">No Data</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Compact Table Footer */}
              <div className="bg-gray-900/80 backdrop-blur-sm px-4 py-3 border-t border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs text-gray-400">
                  <span>Showing {paginatedCoins.length} of {filteredCoins.length} coins</span>
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    Live Data
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center mt-3 gap-1 text-white pb-3 px-2 sm:px-3">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Prev
            </button>
            {renderPaginationButtons}
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 bg-gray-700 rounded text-xs hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export default Watchlist;