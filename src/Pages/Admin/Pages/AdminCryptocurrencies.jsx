import React, { useState, useEffect, useMemo } from "react";
import {
  FaSearch,
  FaCoins,
  FaChartLine,
  FaEye,
  FaArrowUp,
  FaArrowDown,
  FaDollarSign,
  FaExchangeAlt,
  FaTimes,
  FaGlobe,
  FaGasPump,
} from "react-icons/fa";
import { getData } from "@/api/axiosConfig";
import useCoinContext from "@/Context/CoinContext/useCoinContext";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(!document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isLight;
};

const AdminCryptocurrencies = () => {
  const isLight = useThemeCheck();
  const { coins } = useCoinContext() ?? { coins: [] };
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [contentLoaded, setContentLoaded] = useState(false); // New state for animation
  const coinsPerPage = 10;

  useEffect(() => {
    // Simulate loading/data fetch completion for animation
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 50); // Small delay to ensure component mounts before animating
    return () => clearTimeout(timer);
  }, []);

  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      textTertiary: isLight ? "text-gray-400" : "text-gray-500",

      bgCard: isLight 
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
      bgStatsCard: isLight
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
        : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25",
      bgItem: isLight ? "bg-gray-50" : "bg-white/5",
      bgInput: isLight ? "bg-white text-gray-900 placeholder-gray-500 shadow-sm" : "bg-gray-900/50 text-white placeholder-gray-500 shadow-inner",

      tableHead: isLight ? "bg-gray-100 text-gray-600" : "bg-gray-900/50 text-gray-400",
      tableRow: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",

      modalOverlay: "bg-black/80 backdrop-blur-sm",
      modalContent: isLight ? "bg-white shadow-2xl" : "bg-[#0a0b14] shadow-2xl shadow-black/50",

      // Gradient matching the Dashboard component: from-cyan-400 to-blue-500
      headerGradient: "from-cyan-400 to-blue-500",
    }),
    [isLight]
  );

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredCoins.slice(indexOfFirstCoin, indexOfLastCoin);
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    return num?.toLocaleString?.() ?? num;
  };

  return (
    // Applied Dashboard's inner content div for max width and responsive padding
    <div className={`flex-1 w-full max-w-7xl mx-auto p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Applied Dashboard's Heading Style */}
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}>
            Cryptocurrencies
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>Monitor market prices and coin performance</p>
        </div>
        <div className="relative w-full sm:w-72">
          <FaSearch className={`absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-colors ${isLight ? "text-gray-400 group-focus-within:text-cyan-500" : "text-gray-500 group-focus-within:text-cyan-400"}`} />
          <input
            type="text"
            placeholder="Search coins..."
            className={`w-full rounded-xl py-3 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-cyan-500/20 shadow-sm ${isLight ? "bg-white text-gray-900 placeholder-gray-400" : "bg-gray-900/50 text-white placeholder-gray-500"}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out ${
          contentLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >

        {/* Stats Cards */}
        {/* Added mb-6 so table below gets clear spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Coins", value: coins.length, icon: FaCoins, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
            { label: "Active Trading", value: "24/7", icon: FaExchangeAlt, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            { label: "24h Gainers", value: coins.filter((c) => c.price_change_percentage_24h > 0).length, icon: FaArrowUp, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          ].map((stat, i) => (
            <div key={i} className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-xs sm:text-sm ${TC.textSecondary}`}>{stat.label}</p>
                  <h3 className={`text-xl sm:text-2xl font-bold mt-1 ${TC.textPrimary}`}>{stat.value}</h3>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl ${stat.bg} ${stat.border} border`}>
                  <stat.icon className={`text-base sm:text-lg ${stat.color}`} />
                </div>
              </div>
              {/* Glow Effect */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* Coins Table */}
        {/* Added mt-6 for extra spacing under the cards; kept rounded & overflow-hidden */}
        <div className={`${TC.bgCard} rounded-2xl overflow-hidden mt-6`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={TC.tableHead}>
                <tr>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Asset</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">24h Change</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Market Cap</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Volume (24h)</th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {currentCoins.map((coin) => (
                  <tr key={coin.id} className={`${TC.tableRow} transition-all duration-200 hover:bg-gray-800/30`}>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs sm:text-sm font-bold ${TC.textPrimary} truncate`}>{coin.name}</p>
                          <p className="text-[10px] sm:text-xs text-cyan-400 uppercase">{coin.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-medium ${TC.textPrimary}`}>{formatCurrency(coin.current_price)}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 hidden sm:table-cell">
                      <div
                        className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
                          coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {coin.price_change_percentage_24h >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </div>
                    </td>
                    <td className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden md:table-cell`}>${formatLargeNumber(coin.market_cap)}</td>
                    <td className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden lg:table-cell`}>${formatLargeNumber(coin.total_volume)}</td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                      <button
                        onClick={() => setSelectedCoin(coin)}
                        className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${isLight ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white"}`}
                      >
                        <FaEye className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex justify-center gap-2">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800/50"} ${
                  isLight ? "text-gray-600 bg-gray-100" : "text-gray-300 bg-gray-800/50"
                }`}
              >
                Previous
              </button>

              {/* Logic to show limited page numbers */}
              {(() => {
                let pages = [];
                if (totalPages <= 7) {
                  pages = [...Array(totalPages).keys()].map((i) => i + 1);
                } else {
                  if (currentPage <= 4) {
                    pages = [1, 2, 3, 4, 5, "...", totalPages];
                  } else if (currentPage >= totalPages - 3) {
                    pages = [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
                  }
                }
                return pages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && paginate(page)}
                    disabled={typeof page !== "number"}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === currentPage
                        ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/25"
                        : typeof page === "number"
                        ? `${isLight ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-gray-800/50 text-gray-300 hover:bg-gray-800/50"}`
                        : `${TC.textSecondary}`
                    }`}
                  >
                    {page}
                  </button>
                ));
              })()}

              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800/50"} ${
                  isLight ? "text-gray-600 bg-gray-100" : "text-gray-300 bg-gray-800/50"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Coin Details Modal */}
      {selectedCoin && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}>
          <div className={`w-full max-w-2xl rounded-2xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300`}>
            <div className={`p-6 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10`}>
              <div className="flex items-center gap-4">
                <img src={selectedCoin.image} alt={selectedCoin.name} className="w-12 h-12 rounded-full shadow-lg" />
                <div>
                  <h2 className={`text-2xl font-bold ${TC.textPrimary}`}>{selectedCoin.name}</h2>
                  <p className="text-cyan-400 text-sm font-medium uppercase">{selectedCoin.symbol}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCoin(null)} className={`transition-all duration-200 p-1 rounded-lg hover:rotate-90 transform group ${isLight ? "text-gray-500 hover:text-red-600 hover:bg-red-100" : "text-gray-400 hover:text-white hover:bg-red-500/20"}`}>
                <FaTimes className="text-lg group-hover:scale-110 transition-transform" />
              </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Current Price</p>
                  <p className={`text-lg font-bold ${TC.textPrimary}`}>{formatCurrency(selectedCoin.current_price)}</p>
                </div>
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Market Cap</p>
                  <p className={`text-lg font-bold ${TC.textPrimary}`}>{formatLargeNumber(selectedCoin.market_cap)}</p>
                </div>
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>24h High</p>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(selectedCoin.high_24h)}</p>
                </div>
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>24h Low</p>
                  <p className="text-lg font-bold text-red-400">{formatCurrency(selectedCoin.low_24h)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>All Time High</p>
                  <p className={`text-lg font-bold ${TC.textPrimary}`}>{formatCurrency(selectedCoin.ath)}</p>
                  <p className="text-xs text-red-400">{selectedCoin.ath_change_percentage.toFixed(2)}% from ATH</p>
                </div>
                <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                  <p className={`text-xs uppercase mb-1 ${TC.textSecondary}`}>Circulating Supply</p>
                  <p className={`text-lg font-bold ${TC.textPrimary}`}>{formatLargeNumber(selectedCoin.circulating_supply)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCryptocurrencies;
