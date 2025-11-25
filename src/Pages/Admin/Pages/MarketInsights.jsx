import React, { useState, useCallback, useMemo, useEffect } from "react";
import { FaSearch, FaEye, FaChartLine, FaCoins, FaArrowUp, FaTimes, FaShoppingCart, FaArrowDown } from "react-icons/fa";

const COINGECKO_MARKETS_ENDPOINT =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h";

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


// Enhanced sparkline chart with color based on price change
function Sparkline({ data = [], width = 100, height = 24, positive = true }) {
  const isLight = useThemeCheck();
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

  // Color logic remains the same, adjusted slightly for light mode contrast
  const color = positive ? (isLight ? "#059669" : "#10B981") : (isLight ? "#DC2626" : "#EF4444");

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

// Small Modal Component for Coin Details (Dual Mode)
function CoinModal({ coin, isOpen, onClose }) {
  const isLight = useThemeCheck();
  if (!isOpen || !coin) return null;

  const TC = {
    bgModal: isLight ? "bg-white border-gray-300 shadow-2xl" : "bg-gray-800/90 backdrop-blur-sm border-gray-700",
    bgItem: isLight ? "bg-gray-100 border-gray-300" : "bg-gray-700/50 border-gray-600",
    bgDetails: isLight ? "bg-gray-50 border-gray-300" : "bg-gray-700/30 border-gray-600",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    borderBase: isLight ? "border-gray-300" : "border-gray-700",
    textPLPositive: isLight ? "text-green-700" : "text-green-400",
    textPLNegative: isLight ? "text-red-700" : "text-red-400",
  };

  const formatCurrency = (value) => {
    if (!value) return "$0";
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  };
  
  const isPositive = coin.price_change_percentage_24h >= 0;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fade-in">
      <div className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${TC.bgModal}`}>
        {/* Modal Header */}
        <div className={`flex items-center justify-between p-6 border-b ${TC.borderBase}`}>
          <div className="flex items-center gap-4">
            <img src={coin.image} alt={coin.name} className={`w-16 h-16 rounded-full border ${TC.borderBase}`} />
            <div>
              <h2 className={`text-2xl font-bold ${TC.textPrimary}`}>{coin.name}</h2>
              <p className={isLight ? "text-cyan-700 text-lg uppercase" : "text-cyan-400 text-lg uppercase"}>{coin.symbol}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 ${isLight ? "text-gray-500 hover:bg-gray-200 hover:text-gray-900" : "text-gray-400 hover:bg-gray-700 hover:text-white"}`}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Price Section */}
          <div className="flex items-end justify-between">
            <div>
              <p className={`text-3xl font-bold ${TC.textPrimary}`}>${coin.current_price?.toLocaleString()}</p>
              <p className={`text-xl font-semibold ${isPositive ? TC.textPLPositive : TC.textPLNegative}`}>
                {isPositive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
              </p>
            </div>
            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25">
              <FaShoppingCart />
              Add to Watchlist
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${TC.bgItem}`}>
              <div className={isLight ? "p-3 bg-cyan-100 rounded-lg" : "p-3 bg-cyan-500/20 rounded-lg"}>
                <FaChartLine className={isLight ? "text-cyan-600 text-xl" : "text-cyan-400 text-xl"} />
              </div>
              <div>
                <p className={`text-sm ${TC.textSecondary}`}>Market Cap</p>
                <p className={`font-semibold text-lg ${TC.textPrimary}`}>{formatCurrency(coin.market_cap)}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg border ${TC.bgItem}`}>
              <div className={isLight ? "p-3 bg-green-100 rounded-lg" : "p-3 bg-green-500/20 rounded-lg"}>
                <FaCoins className={isLight ? "text-green-600 text-xl" : "text-green-400 text-xl"} />
              </div>
              <div>
                <p className={`text-sm ${TC.textSecondary}`}>Volume (24h)</p>
                <p className={`font-semibold text-lg ${TC.textPrimary}`}>{formatCurrency(coin.total_volume)}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg border ${TC.bgItem}`}>
              <div className={isLight ? "p-3 bg-purple-100 rounded-lg" : "p-3 bg-purple-500/20 rounded-lg"}>
                <FaArrowUp className={isLight ? "text-purple-600 text-xl" : "text-purple-400 text-xl"} />
              </div>
              <div>
                <p className={`text-sm ${TC.textSecondary}`}>Rank</p>
                <p className={`font-semibold text-lg ${TC.textPrimary}`}>#{coin.market_cap_rank}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg border ${TC.bgItem}`}>
              <div className={isLight ? "p-3 bg-blue-100 rounded-lg" : "p-3 bg-blue-500/20 rounded-lg"}>
                <FaCoins className={isLight ? "text-blue-600 text-xl" : "text-blue-400 text-xl"} />
              </div>
              <div>
                <p className={`text-sm ${TC.textSecondary}`}>Circulating Supply</p>
                <p className={`font-semibold text-lg ${TC.textPrimary}`}>{coin.circulating_supply?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className={`rounded-lg border p-4 ${TC.bgDetails}`}>
            <h4 className={`font-semibold mb-3 text-lg ${TC.textPrimary}`}>Market Statistics</h4>
            <div className="space-y-3 text-sm">
              <div className={`flex justify-between items-center py-2 border-b ${TC.borderBase}`}>
                <span className={TC.textSecondary}>All-Time High</span>
                <span className={`font-semibold ${TC.textPrimary}`}>${coin.ath?.toLocaleString()}</span>
              </div>
              <div className={`flex justify-between items-center py-2 border-b ${TC.borderBase}`}>
                <span className={TC.textSecondary}>ATH Change</span>
                <span className={`font-semibold ${coin.ath_change_percentage >= 0 ? TC.textPLPositive : TC.textPLNegative}`}>
                  {coin.ath_change_percentage?.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className={TC.textSecondary}>Total Supply</span>
                <span className={`font-semibold ${TC.textPrimary}`}>{coin.total_supply?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`flex justify-end gap-3 p-6 border-t ${TC.borderBase}`}>
          <button
            onClick={onClose}
            className={`px-6 py-2.5 border rounded-lg transition-all duration-200 font-medium ${isLight ? "border-gray-400 text-gray-700 hover:bg-gray-100" : "border-gray-600 text-gray-300 hover:bg-gray-700/50"}`}
          >
            Close
          </button>
          <button className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-200 font-medium shadow-lg hover:shadow-cyan-500/25">
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

// Top Gainers Modal (Dual Mode)
function TopGainersModal({ coins, isOpen, onClose }) {
  const isLight = useThemeCheck();
  if (!isOpen) return null;

  const TC = {
    bgModal: isLight ? "bg-white border-gray-300 shadow-2xl" : "bg-gray-800/90 backdrop-blur-sm border-gray-700",
    bgItem: isLight ? "bg-green-100/50 border-green-300 hover:border-green-600/50" : "bg-gradient-to-br from-green-900/20 to-gray-800/50 border-green-500/20 hover:border-green-400/50",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textAccent: isLight ? "text-green-700" : "text-green-400",
    bgIcon: isLight ? "bg-green-100" : "bg-green-500/20",
    borderBase: isLight ? "border-gray-300" : "border-gray-700",
    textBtn: isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-700/50",
  };

  const topGainers = coins
    .filter(coin => coin.price_change_percentage_24h > 0)
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 10);

  const formatCurrency = (value) => {
    if (!value) return "$0";
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fade-in">
      <div className={`rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden ${TC.bgModal}`}>
        <div className={`flex items-center justify-between p-6 border-b ${TC.borderBase}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${TC.bgIcon}`}>
              <FaArrowUp className={`text-2xl ${TC.textAccent}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${TC.textPrimary}`}>Top 10 Gainers (24h)</h2>
              <p className={`text-lg ${TC.textAccent}`}>Biggest positive price movements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 ${TC.textBtn}`}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topGainers.map((coin) => (
              <div
                key={coin.id}
                className={`rounded-xl p-4 transition-all duration-300 hover:scale-105 ${TC.bgItem}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className={`font-bold text-lg ${TC.textPrimary}`}>{coin.symbol.toUpperCase()}</p>
                      <p className={`text-sm ${TC.textAccent}`}>{coin.name}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-xl ${TC.textAccent}`}>
                    +{coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className={TC.textSecondary}>Price</span>
                    <span className={`font-semibold ${TC.textPrimary}`}>${coin.current_price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={TC.textSecondary}>Market Cap</span>
                    <span className={`font-semibold ${TC.textPrimary}`}>
                      {formatCurrency(coin.market_cap)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={TC.textSecondary}>Volume</span>
                    <span className={`font-semibold ${TC.textPrimary}`}>
                      {formatCurrency(coin.total_volume)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Top Losers Modal (Dual Mode)
function TopLosersModal({ coins, isOpen, onClose }) {
  const isLight = useThemeCheck();
  if (!isOpen) return null;

  const TC = {
    bgModal: isLight ? "bg-white border-gray-300 shadow-2xl" : "bg-gray-800/90 backdrop-blur-sm border-gray-700",
    bgItem: isLight ? "bg-red-100/50 border-red-300 hover:border-red-600/50" : "bg-gradient-to-br from-red-900/20 to-gray-800/50 border-red-500/20 hover:border-red-400/50",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textAccent: isLight ? "text-red-700" : "text-red-400",
    bgIcon: isLight ? "bg-red-100" : "bg-red-500/20",
    borderBase: isLight ? "border-gray-300" : "border-gray-700",
    textBtn: isLight ? "text-gray-700 hover:bg-gray-100" : "text-gray-300 hover:bg-gray-700/50",
  };

  const topLosers = coins
    .filter(coin => coin.price_change_percentage_24h < 0)
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 10);

  const formatCurrency = (value) => {
    if (!value) return "$0";
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] fade-in">
      <div className={`rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden ${TC.bgModal}`}>
        <div className={`flex items-center justify-between p-6 border-b ${TC.borderBase}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${TC.bgIcon}`}>
              <FaArrowDown className={`text-2xl ${TC.textAccent}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${TC.textPrimary}`}>Top 10 Losers (24h)</h2>
              <p className={`text-lg ${TC.textAccent}`}>Biggest negative price movements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-all duration-200 ${TC.textBtn}`}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topLosers.map((coin) => (
              <div
                key={coin.id}
                className={`rounded-xl p-4 transition-all duration-300 hover:scale-105 ${TC.bgItem}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <p className={`font-bold text-lg ${TC.textPrimary}`}>{coin.symbol.toUpperCase()}</p>
                      <p className={`text-sm ${TC.textAccent}`}>{coin.name}</p>
                    </div>
                  </div>
                  <span className={`font-bold text-xl ${TC.textAccent}`}>
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className={TC.textSecondary}>Price</span>
                    <span className={`font-semibold ${TC.textPrimary}`}>${coin.current_price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={TC.textSecondary}>Market Cap</span>
                    <span className={`font-semibold ${TC.textPrimary}`}>
                      {formatCurrency(coin.market_cap)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={TC.textSecondary}>Volume</span>
                    <span className={`font-semibold ${TC.textPrimary}`}>
                      {formatCurrency(coin.total_volume)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketInsight() {
  const isLight = useThemeCheck();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGainersModalOpen, setIsGainersModalOpen] = useState(false);
  const [isLosersModalOpen, setIsLosersModalOpen] = useState(false);
  const itemsPerPage = 10;
  
  // 💡 Theme Classes Helper for Main Component
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    bgContainer: isLight ? "bg-white border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700",
    bgSearch: isLight ? "bg-white border-gray-300 text-gray-900 placeholder-gray-500" : "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400",
    bgItem: isLight ? "bg-gray-50/50 border-gray-300 hover:border-cyan-600/50" : "bg-gradient-to-br from-gray-800/50 to-gray-800/30 border-gray-700 hover:border-cyan-400/50",
    bgTableHead: isLight ? "bg-gray-100 border-gray-300 text-gray-600" : "bg-gray-800/50 border-gray-700 text-gray-400",
    borderDivide: isLight ? "divide-gray-300" : "divide-gray-700",
    btnPagination: isLight ? "bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300" : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50",
    btnPaginationActive: isLight ? "bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-500/25" : "bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-500/25",
  }), [isLight]);


  // Filter coins based on search term
  const filteredCoins = useMemo(() => {
    if (!searchTerm) return coins;
    
    const term = searchTerm.toLowerCase();
    return coins.filter(coin => 
      coin.name.toLowerCase().includes(term) ||
      coin.symbol.toLowerCase().includes(term)
    );
  }, [coins, searchTerm]);

  // Memoized pagination calculations
  const { paginatedCoins, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
    const paginatedCoins = filteredCoins.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { paginatedCoins, totalPages };
  }, [filteredCoins, currentPage, itemsPerPage]);

  // Format currency function
  const formatCurrency = useCallback((value) => {
    if (!value) return "$0";
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  }, []);

  // Stats calculations
  const stats = useMemo(() => {
    const totalCoins = coins.length;
    const gainers = coins.filter(c => c.price_change_percentage_24h > 0).length;
    const losers = coins.filter(c => c.price_change_percentage_24h < 0).length;
    const totalVolume = coins.reduce((sum, coin) => sum + coin.total_volume, 0);
    
    return { totalCoins, gainers, losers, totalVolume };
  }, [coins]);

  // Load data from CoinGecko
  async function loadMarkets() {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(COINGECKO_MARKETS_ENDPOINT);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setCoins(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMarkets();
    const id = setInterval(loadMarkets, 60000); // Poll every 60 seconds
    return () => clearInterval(id);
  }, []);

  // Handle page click
  const handlePageClick = (page) => setCurrentPage(page);

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle view details
  const handleViewDetails = (coin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };

  // Handle open gainers modal
  const handleOpenGainers = () => {
    setIsGainersModalOpen(true);
  };

  // Handle open losers modal
  const handleOpenLosers = () => {
    setIsLosersModalOpen(true);
  };

  // Render pagination buttons
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
        className={`px-3 py-2 rounded-lg border 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-sm ${TC.btnPagination}`}
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
          className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm
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
        className={`px-3 py-2 rounded-lg border 
                   disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-all duration-200 
                   text-sm ${TC.btnPagination}`}
      >
        Next
      </button>
    );

    return buttons;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isLight ? "bg-gray-50" : "bg-gray-900"} flex items-center justify-center p-4 fade-in`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className={TC.textPrimary + " text-lg"}>Loading market data...</p>
          <p className={TC.textSecondary + " text-sm"}>
            Please wait while we fetch market insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen p-4 sm:p-6 fade-in ${TC.textPrimary}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 fade-in">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-t from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Market Insights
              </h1>
              <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${TC.textSecondary}`}>
                Real-time cryptocurrency market data
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full sm:w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`w-full border rounded-lg py-2 px-3 
                           text-sm focus:outline-none 
                           focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300 
                           pr-10 ${TC.bgSearch}`}
                />
                <FaSearch className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${TC.textTertiary}`} />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            {[
              { label: "Total Coins", value: stats.totalCoins, icon: FaCoins, color: "cyan", delay: "0.1s" },
              { label: "24h Gainers", value: stats.gainers, icon: FaArrowUp, color: "green", delay: "0.2s" },
              { label: "24h Losers", value: stats.losers, icon: FaArrowDown, color: "red", delay: "0.3s" },
              { label: "Total Volume", value: formatCurrency(stats.totalVolume), icon: FaChartLine, color: "purple", delay: "0.4s" },
            ].map((stat) => {
              const baseColor = stat.color;
              const accentColor = isLight ? `text-${baseColor}-600` : `text-${baseColor}-400`;
              const bgColor = isLight ? `bg-${baseColor}-100` : `bg-${baseColor}-500/20`;
              const borderColor = isLight ? `border-${baseColor}-300` : `border-${baseColor}-500/30`;
              
              return (
                <div
                  key={stat.label}
                  className={`rounded-xl p-4 sm:p-6 transition-all duration-300 hover:scale-105 group cursor-pointer fade-in ${TC.bgContainer}`}
                  style={{ animationDelay: stat.delay }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs sm:text-sm ${TC.textTertiary}`}>
                        {stat.label}
                      </p>
                      <p
                        className={`text-xl sm:text-2xl font-bold ${accentColor} mb-1 group-hover:scale-110 transition-transform`}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${bgColor} border ${borderColor}`}
                    >
                      <stat.icon
                        className={`text-lg sm:text-xl md:text-2xl ${accentColor}`}
                      />
                    </div>
                  </div>
                  {stat.label === "24h Gainers" && (
                    <p 
                      className={`text-xs mt-2 cursor-pointer hover:underline ${isLight ? "text-green-600" : "text-green-400"}`}
                      onClick={handleOpenGainers}
                    >
                      Click to view top 10
                    </p>
                  )}
                  {stat.label === "24h Losers" && (
                    <p 
                      className={`text-xs mt-2 cursor-pointer hover:underline ${isLight ? "text-red-600" : "text-red-400"}`}
                      onClick={handleOpenLosers}
                    >
                      Click to view top 10
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Coins Grid */}
          <div className={`rounded-xl overflow-hidden fade-in ${TC.bgContainer}`}>
            {/* Mobile/Tablet Card View */}
            <div className="xl:hidden space-y-3 p-4">
              {paginatedCoins.map((coin, index) => {
                const isPositive = coin.price_change_percentage_24h >= 0;
                const plColor = isPositive ? TC.textPLPositive : TC.textPLNegative;
                
                return (
                  <div
                    key={coin.id}
                    className={`rounded-xl p-4 border transition-all duration-300 ease-out hover:border-cyan-400/50 fade-in ${TC.bgItem}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-3 mb-3">
                          <img 
                            src={coin.image} 
                            alt={coin.name} 
                            className={`w-10 h-10 flex-shrink-0 rounded-full border ${isLight ? "border-gray-400" : "border-gray-600"}`} 
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-semibold text-lg truncate ${TC.textPrimary}`}>
                              {coin.name}
                            </h3>
                            <p className={isLight ? "text-cyan-700 text-sm uppercase" : "text-cyan-400 text-sm uppercase"}>
                              {coin.symbol.toUpperCase()}
                            </p>
                          </div>
                          <span className={TC.textTertiary + " text-sm"}>
                            #{coin.market_cap_rank}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className={TC.textTertiary + " text-sm"}>Price</p>
                            <p className={TC.textPrimary + " font-bold text-lg"}>${coin.current_price?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className={TC.textTertiary + " text-sm"}>24h Change</p>
                            <p className={`font-bold text-lg ${plColor}`}>
                              {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className={TC.textTertiary}>Market Cap</p>
                            <p className={TC.textPrimary + " font-medium"}>{formatCurrency(coin.market_cap)}</p>
                          </div>
                          <div>
                            <p className={TC.textTertiary}>Volume</p>
                            <p className={TC.textPrimary + " font-medium"}>{formatCurrency(coin.total_volume)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex-1 mr-4">
                        <Sparkline 
                          data={coin.sparkline_in_7d?.price || []} 
                          width={120} 
                          height={40}
                          positive={isPositive}
                        />
                      </div>
                      <button
                        onClick={() => handleViewDetails(coin)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                      >
                        <FaEye />
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full table-auto text-left">
                <thead className={TC.bgTableHead}>
                  <tr className={`border-b ${TC.borderDivide}`}>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-sm">Coin</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-sm">Price</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-sm">24h %</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-sm">Market Cap</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-sm">Volume</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-sm">Trend</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-sm text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className={`text-base divide-y ${TC.borderDivide}`}>
                  {paginatedCoins.map((coin, index) => {
                    const isPositive = coin.price_change_percentage_24h >= 0;
                    const plColor = isPositive ? TC.textPLPositive : TC.textPLNegative;
                    
                    return (
                      <tr
                        key={coin.id}
                        className={`transition-all duration-300 ease-out fade-in ${isLight ? "hover:bg-gray-50/50" : "hover:bg-gray-800/40"}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <img 
                              src={coin.image} 
                              alt={coin.name} 
                              className={`w-10 h-10 flex-shrink-0 rounded-full border ${isLight ? "border-gray-400" : "border-gray-600"}`} 
                            />
                            <div className="min-w-0 flex-1">
                              <div className={TC.textPrimary + " font-medium"}>{coin.name}</div>
                              <div className={isLight ? "text-cyan-700 text-sm uppercase" : "text-cyan-400 text-sm uppercase"}>{coin.symbol.toUpperCase()}</div>
                            </div>
                            <span className={TC.textTertiary + " text-sm"}>#{coin.market_cap_rank}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={TC.textPrimary + " font-bold"}>
                            ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                          </div>
                        </td>
                        <td className={`py-4 px-6 font-semibold ${plColor}`}>
                          {coin.price_change_percentage_24h?.toFixed(2)}%
                        </td>
                        <td className="py-4 px-6">
                          <div className={TC.textPrimary + " font-medium"}>
                            {formatCurrency(coin.market_cap)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className={TC.textPrimary + " font-medium"}>
                            {formatCurrency(coin.total_volume)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Sparkline 
                            data={coin.sparkline_in_7d?.price || []} 
                            width={100} 
                            height={40}
                            positive={isPositive}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleViewDetails(coin)}
                              className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
                            >
                              <FaEye />
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Section */}
            {totalPages > 1 && (
              <div className={`border-t px-6 py-4 fade-in ${TC.bgTableHead} ${TC.borderDivide}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className={`text-sm ${TC.textSecondary}`}>
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCoins.length)} of {filteredCoins.length} coins
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {renderPaginationButtons()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className={`rounded-xl p-4 fade-in ${isLight ? "bg-red-100 border-red-400" : "bg-red-500/10 border-red-500/20"}`}>
              <p className={`text-sm ${isLight ? "text-red-700" : "text-red-400"}`}>Error loading market data: {error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Coin Details Modal */}
      <CoinModal
        coin={selectedCoin}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Top Gainers Modal */}
      <TopGainersModal
        coins={coins}
        isOpen={isGainersModalOpen}
        onClose={() => setIsGainersModalOpen(false)}
      />

      {/* Top Losers Modal */}
      <TopLosersModal
        coins={coins}
        isOpen={isLosersModalOpen}
        onClose={() => setIsLosersModalOpen(false)}
      />
    </>
  );
}