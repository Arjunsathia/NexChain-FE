import React, { useState, useEffect, useMemo } from "react";
import {
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaGlobe,
  FaGasPump,
  FaSearch,
  FaEye,
  FaTimes,
  FaSync,
} from "react-icons/fa";
import { toast } from "react-toastify";

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

// Custom Sparkline Component (No external dependency needed)
const SimpleSparkline = ({ data, color = "#06b6d4", width = 100, height = 30 }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  
  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline 
        points={points} 
        fill="none" 
        stroke={color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

// Reusable Modal Component for Coin Lists
const CoinListModal = ({ title, coins, onClose, TC, formatCurrency, isLight }) => {
  if (!coins) return null;
  
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}>
      <div className={`w-full max-w-2xl rounded-2xl max-h-[80vh] flex flex-col ${TC.modalContent} animate-in fade-in zoom-in duration-200`}>
        <div className="p-4 sm:p-6 border-b border-gray-800/10 flex justify-between items-center">
          <h3 className={`text-xl font-bold ${TC.textPrimary}`}>{title}</h3>
          <button onClick={onClose} className={`p-2 rounded-lg hover:bg-gray-500/10 transition-colors ${TC.textSecondary}`}>
            <FaTimes />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 space-y-2">
          {coins.map((coin, index) => (
            <div key={coin.id} className={`flex items-center justify-between p-3 rounded-xl ${TC.bgItem} transition-all hover:scale-[1.01]`}>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono ${TC.textTertiary} w-6`}>{index + 1}</span>
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <p className={`font-bold text-sm ${TC.textPrimary}`}>{coin.name}</p>
                  <p className={`text-xs ${TC.textSecondary}`}>{coin.symbol.toUpperCase()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${TC.textPrimary}`}>{formatCurrency(coin.current_price)}</p>
                <p className={`text-xs font-bold ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MarketInsights = () => {
  const isLight = useThemeCheck();
  
  // Premium Theme Classes - Matches User Dashboard
  const TC = useMemo(() => ({
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
    
    btnPrimary: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25 transition-all duration-300",
    btnSecondary: isLight ? "text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-800/50 hover:text-white",
    
    tableHead: isLight ? "bg-gray-100 text-gray-600" : "bg-gray-900/50 text-gray-400",
    tableRow: isLight ? "hover:bg-gray-50" : "hover:bg-white/5",
    
    modalOverlay: "bg-black/80 backdrop-blur-sm",
    modalContent: isLight ? "bg-white shadow-2xl" : "bg-[#0a0b14] shadow-2xl shadow-black/50",
    
    headerGradient: "from-cyan-400 to-blue-500",
  }), [isLight]);

  const [marketData, setMarketData] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [showTopGainers, setShowTopGainers] = useState(false);
  const [showTopLosers, setShowTopLosers] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setContentLoaded(false);
      // Fetch CoinGecko Data
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d"
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }

      setMarketData(data);

      // Calculate Global Stats
      const totalMarketCap = data.reduce((acc, coin) => acc + coin.market_cap, 0);
      const totalVolume = data.reduce((acc, coin) => acc + coin.total_volume, 0);
      const btcDominance = (data.find((c) => c.symbol === "btc")?.market_cap / totalMarketCap) * 100;

      setGlobalStats({
        marketCap: totalMarketCap,
        volume: totalVolume,
        btcDominance: btcDominance || 0,
        ethDominance: (data.find((c) => c.symbol === "eth")?.market_cap / totalMarketCap) * 100 || 0,
      });
    } catch (error) {
      console.error("Error fetching market data:", error);
      toast.error("Failed to fetch market data. Please try again later.");
      setMarketData([]); // Fallback to empty array
    } finally {
      setLoading(false);
      setTimeout(() => setContentLoaded(true), 300);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCompactNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(number);
  };

  const filteredData = marketData.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const topGainers = [...marketData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
  const topLosers = [...marketData].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);

  // Loading Skeleton Component
  const MarketSkeleton = () => (
    <div className="space-y-6">
      {/* Global Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${TC.bgCard} h-32 rounded-2xl animate-pulse`} />
        ))}
      </div>
      
      {/* Market Movers Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className={`${TC.bgCard} h-64 rounded-2xl animate-pulse`} />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className={`${TC.bgCard} rounded-2xl overflow-hidden p-4`}>
        <div className="space-y-4">
            <div className={`h-10 w-full ${TC.tableHead} rounded animate-pulse`} />
            {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-16 w-full ${TC.bgItem} rounded-xl animate-pulse`} />
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 p-4 lg:p-8 space-y-4 lg:space-y-6 min-h-screen ${TC.textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${TC.headerGradient} bg-clip-text text-transparent`}>
            Market Insights
          </h1>
          <p className={`${TC.textSecondary} mt-1 text-xs sm:text-sm`}>
            Global crypto market analysis and trends
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {loading && (
            <div className="flex items-center text-sm text-gray-300">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Loading...
            </div>
          )}
          <button
            onClick={fetchMarketData}
            disabled={loading}
            className={`px-3 sm:px-4 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-2 ${TC.btnPrimary} w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </div>
      </div>

      {loading ? (
        <MarketSkeleton />
      ) : (
        <div 
          className={`transition-all duration-500 ease-in-out space-y-4 lg:space-y-6 ${
            contentLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg text-blue-400"><FaGlobe className="text-sm sm:text-base" /></div>
              <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>Market Cap</span>
            </div>
            <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>{formatCompactNumber(globalStats.marketCap)}</h3>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          </div>
          <div className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg text-purple-400"><FaChartLine className="text-sm sm:text-base" /></div>
              <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>24h Volume</span>
            </div>
            <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>{formatCompactNumber(globalStats.volume)}</h3>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          </div>
          <div className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-orange-500/10 rounded-lg text-orange-400"><FaGasPump className="text-sm sm:text-base" /></div>
              <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>BTC Dom.</span>
            </div>
            <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>{globalStats.btcDominance.toFixed(1)}%</h3>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          </div>
          <div className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-1.5 sm:p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><FaGasPump className="text-sm sm:text-base" /></div>
              <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>ETH Dom.</span>
            </div>
            <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>{globalStats.ethDominance.toFixed(1)}%</h3>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          </div>
        </div>
      )}

      {/* Market Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Top Gainers */}
        <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${TC.textPrimary}`}>
              <FaArrowUp className="text-green-400 text-sm sm:text-base" /> Top Gainers
            </h3>
            <button onClick={() => setShowTopGainers(true)} className="text-xs text-cyan-400 hover:text-cyan-300 hidden sm:block">View All</button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {topGainers.map((coin) => (
              <div key={coin.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-all duration-200 hover:scale-[1.02]`}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-xs sm:text-sm ${TC.textPrimary} truncate`}>{coin.symbol.toUpperCase()}</p>
                    <p className={`text-[10px] sm:text-xs ${TC.textSecondary} truncate`}>{formatCurrency(coin.current_price)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-green-400 font-bold text-xs sm:text-sm whitespace-nowrap">+{coin.price_change_percentage_24h.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${TC.textPrimary}`}>
              <FaArrowDown className="text-red-400 text-sm sm:text-base" /> Top Losers
            </h3>
            <button onClick={() => setShowTopLosers(true)} className="text-xs text-cyan-400 hover:text-cyan-300 hidden sm:block">View All</button>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {topLosers.map((coin) => (
              <div key={coin.id} className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-all duration-200 hover:scale-[1.02]`}>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-xs sm:text-sm ${TC.textPrimary} truncate`}>{coin.symbol.toUpperCase()}</p>
                    <p className={`text-[10px] sm:text-xs ${TC.textSecondary} truncate`}>{formatCurrency(coin.current_price)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="text-red-400 font-bold text-xs sm:text-sm whitespace-nowrap">{coin.price_change_percentage_24h.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Market Table */}
      <div className={`${TC.bgCard} rounded-2xl overflow-hidden`}>
        <div className="p-3 sm:p-4 border-b border-gray-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <h3 className={`text-base sm:text-lg font-bold ${TC.textPrimary}`}>Market Overview</h3>
          <div className="relative w-full sm:w-72 group">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className={TC.tableHead}>
              <tr>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Asset</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Price</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">24h Change</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden md:table-cell">7d Trend</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">Market Cap</th>
                <th className="py-3 px-3 sm:py-4 sm:px-6 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {currentItems.map((coin) => (
                <tr key={coin.id} className={`${TC.tableRow} transition-all duration-200 hover:bg-gray-800/30`}>
                  <td className="py-3 px-3 sm:py-4 sm:px-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`text-[10px] sm:text-xs ${TC.textSecondary} w-3 sm:w-4`}>{coin.market_cap_rank}</span>
                      <img src={coin.image} alt={coin.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className={`font-bold text-xs sm:text-sm ${TC.textPrimary} truncate`}>{coin.name}</p>
                        <p className={`text-[10px] sm:text-xs ${TC.textSecondary} uppercase`}>{coin.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`py-3 px-3 sm:py-4 sm:px-6 font-medium text-xs sm:text-sm ${TC.textPrimary}`}>{formatCurrency(coin.current_price)}</td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6 hidden sm:table-cell">
                    <span className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {coin.price_change_percentage_24h >= 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6 w-24 sm:w-32 hidden md:table-cell">
                    <SimpleSparkline 
                      data={coin.sparkline_in_7d.price} 
                      color={coin.price_change_percentage_7d_in_currency >= 0 ? "#4ade80" : "#f87171"} 
                      width={100} 
                      height={30} 
                    />
                  </td>
                  <td className={`py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm ${TC.textSecondary} hidden lg:table-cell`}>{formatCompactNumber(coin.market_cap)}</td>
                  <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                    <button
                      onClick={() => setSelectedCoin(coin)}
                      className={`p-1.5 sm:p-2 rounded-lg ${TC.btnSecondary}`}
                    >
                      <FaEye className="text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1
                ? "opacity-50 cursor-not-allowed " + TC.textSecondary
                : TC.btnSecondary
            }`}
          >
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }).map((_, i) => {
              // Show limited page numbers for better UX
              if (
                i + 1 === 1 ||
                i + 1 === Math.ceil(filteredData.length / itemsPerPage) ||
                (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                        : TC.btnSecondary
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              } else if (
                (i + 1 === currentPage - 2 && currentPage > 3) ||
                (i + 1 === currentPage + 2 && currentPage < Math.ceil(filteredData.length / itemsPerPage) - 2)
              ) {
                return <span key={i} className={`px-1 ${TC.textSecondary}`}>...</span>;
              }
              return null;
            })}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === Math.ceil(filteredData.length / itemsPerPage)
                ? "opacity-50 cursor-not-allowed " + TC.textSecondary
                : TC.btnSecondary
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )}

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
                  <p className={`text-lg font-bold ${TC.textPrimary}`}>{formatCompactNumber(selectedCoin.market_cap)}</p>
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
              
              <div className={`p-4 rounded-xl ${TC.bgItem}`}>
                <h3 className={`text-lg font-bold mb-4 ${TC.textPrimary}`}>Price Performance (7d)</h3>
                <div className="h-32 w-full flex items-center justify-center">
                  <SimpleSparkline 
                    data={selectedCoin.sparkline_in_7d.price} 
                    color="#06b6d4" 
                    width={500} 
                    height={100} 
                  />
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
                  <p className={`text-lg font-bold ${TC.textPrimary}`}>{formatCompactNumber(selectedCoin.circulating_supply)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Top Gainers Modal */}
      {showTopGainers && (
        <CoinListModal 
          title="Top Gainers (24h)" 
          coins={[...marketData]
            .filter(coin => coin.price_change_percentage_24h > 0)
            .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          } 
          onClose={() => setShowTopGainers(false)} 
          TC={TC} 
          formatCurrency={formatCurrency}
          isLight={isLight}
        />
      )}

      {/* Top Losers Modal */}
      {showTopLosers && (
        <CoinListModal 
          title="Top Losers (24h)" 
          coins={[...marketData]
            .filter(coin => coin.price_change_percentage_24h < 0)
            .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
          } 
          onClose={() => setShowTopLosers(false)} 
          TC={TC} 
          formatCurrency={formatCurrency}
          isLight={isLight}
        />
      )}
    </div>
  );
};

export default MarketInsights;