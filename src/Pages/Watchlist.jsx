import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { FaBell, FaSearch, FaExchangeAlt, FaStar, FaChartLine, FaFire, FaTrophy } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { deleteWatchList, getData } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TradeModal from "./UserProfile/Components/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Utility to check if light mode is active
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

// Sparkline Component
function Sparkline({ data = [], width = 100, height = 40, positive = true }) {
  if (!data || data.length === 0) return <div className="w-24 h-10" />;

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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="drop-shadow-sm">
      <defs>
        <linearGradient id={`gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill={`url(#gradient-${positive ? 'up' : 'down'})`}
        stroke={color}
        strokeWidth="2"
        points={`0,${height} ${points} ${width},${height}`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Remove Confirmation Modal
function RemoveConfirmationModal({ show, onClose, onConfirm, coin }) {
  const isLight = useThemeCheck();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className={`rounded-2xl p-6 max-w-md w-full mx-auto fade-in shadow-2xl border ${
        isLight ? "bg-white border-gray-200" : "bg-gray-800/90 backdrop-blur-md border-gray-700"
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isLight ? "bg-red-100" : "bg-red-500/20"
          }`}>
            <MdDeleteForever className={`text-3xl ${isLight ? "text-red-600" : "text-red-400"}`} />
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${isLight ? "text-gray-900" : "text-white"}`}>
            Remove from Watchlist?
          </h3>
          
          <p className={`text-sm mb-6 ${isLight ? "text-gray-600" : "text-gray-400"}`}>
            Are you sure you want to remove <span className={`font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>{coin?.name}</span> from your watchlist?
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                isLight ? "bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200" : "bg-gray-700 text-white border-gray-600 hover:bg-gray-600"
              }`}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg">
              <MdDeleteForever className="text-lg" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Watchlist = () => {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { coins: liveCoins } = useCoinContext();
  const { purchasedCoins, refreshPurchasedCoins } = usePurchasedCoins();
  const navigate = useNavigate();

  const userFromLocalStorage = JSON.parse(localStorage.getItem("NEXCHAIN_USER"));
  const userId = user?.id || userFromLocalStorage?.id;

  const [watchlistData, setWatchlistData] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [tradeModal, setTradeModal] = useState({ show: false, coin: null, type: "buy" });
  const [removeModal, setRemoveModal] = useState({ show: false, coin: null });

  const ws = useRef(null);
  const livePricesRef = useRef({});
  const itemsPerPage = 10;

  // Theme Classes
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgCard: isLight 
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    bgStatsCard: isLight
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25",
    bgHeader: isLight ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-gray-900/80 backdrop-blur-md shadow-md",
    skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
    skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
  }), [isLight]);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    livePricesRef.current = livePrices;
  }, [livePrices]);

  const mergedCoins = useMemo(() => {
    return watchlistData
      .map((item) => {
        const liveCoin = liveCoins.find((coin) => coin.id === item.id);
        const livePriceData = livePrices[item.id];
        
        // Match user holdings - purchasedCoins uses 'coinId' field
        const userHolding = purchasedCoins.find(
          (pc) => pc.coinId === item.id
        );

        const combinedCoin = {
          ...item,
          ...(liveCoin || {}),
          ...(livePriceData || {}),
          userHolding: userHolding || null,
        };

        if (livePriceData?.current_price) {
          combinedCoin.current_price = livePriceData.current_price;
          combinedCoin.price_change_percentage_24h = livePriceData.price_change_percentage_24h;
        }

        return combinedCoin;
      })
      .filter(Boolean);
  }, [watchlistData, liveCoins, livePrices, purchasedCoins]);

  // WebSocket for live prices
  useEffect(() => {
    if (watchlistData.length === 0) return;

    const symbolMap = {
      bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt", 
      cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt",
      "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt"
    };

    const symbols = watchlistData
      .map(coin => symbolMap[coin.id] ? `${symbolMap[coin.id]}@ticker` : null)
      .filter(Boolean);

    if (symbols.length === 0) return;

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${symbols.join('/')}`);
      
      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace('@ticker', '');
          const coinId = Object.keys(symbolMap).find(key => symbolMap[key] === symbol);
          
          if (coinId) {
            setLivePrices(prev => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(message.data.c),
                price_change_percentage_24h: parseFloat(message.data.P),
              }
            }));
          }
        }
      };
    } catch (error) {
      console.error('WebSocket setup failed:', error);
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [watchlistData]);

  const filteredCoins = useMemo(() => {
    if (!searchTerm) return mergedCoins;
    return mergedCoins.filter(
      (coin) =>
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
  }, [filteredCoins, currentPage]);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getData("/watchlist", { user_id: userId });
      setWatchlistData(res || []);
    } catch (err) {
      console.error("Failed to fetch watchlist data", err);
      toast.error("Failed to fetch watchlist data");
      setWatchlistData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeModal.coin || !userId) return;
    setLoading(true);
    try {
      await deleteWatchList("/watchlist/remove", { id: removeModal.coin?.id, user_id: userId });
      toast.success("Removed from watchlist!");
      fetchData();
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      toast.error("Failed to remove coin");
    } finally {
      setLoading(false);
      setRemoveModal({ show: false, coin: null });
    }
  }, [removeModal.coin, userId, fetchData]);

  const handleTrade = useCallback((coin) => {
    setTradeModal({ show: true, coin, type: "buy" });
  }, []);

  const handleTradeClose = useCallback(async () => {
    setTradeModal({ show: false, coin: null, type: "buy" });
    if (refreshPurchasedCoins) {
      try {
        await refreshPurchasedCoins();
      } catch (error) {
        console.error("Failed to refresh purchased coins:", error);
      }
    }
  }, [refreshPurchasedCoins]);

  const handleCoinClick = useCallback(
    (coin) => { navigate(`/coin/coin-details/${coin.id}`); },
    [navigate]
  );

  // Stats calculation
  const stats = useMemo(() => {
    const totalValue = mergedCoins.reduce((sum, coin) => {
      const holding = coin.userHolding;
      if (holding) {
        const qty = holding.totalQuantity || holding.quantity || 0;
        return sum + (qty * (coin.current_price || 0));
      }
      return sum;
    }, 0);

    const gainers = mergedCoins.filter(c => (c.price_change_percentage_24h || 0) > 0).length;
    const losers = mergedCoins.filter(c => (c.price_change_percentage_24h || 0) < 0).length;

    return { total: mergedCoins.length, totalValue, gainers, losers };
  }, [mergedCoins]);

  return (
    <>
      <main className={`min-h-screen ${TC.textPrimary} p-2 sm:p-4 lg:p-6 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <Outlet />

        {/* Header */}
        <div className={`sticky top-2 z-40 max-w-7xl mx-auto rounded-2xl shadow-lg mb-6 ${TC.bgHeader} transition-colors duration-300`}>
          <div className="px-4 lg:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isLight ? "bg-yellow-50 text-yellow-600" : "bg-yellow-500/10 text-yellow-400"}`}>
                  <FaStar className="text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold leading-none">My Watchlist</h1>
                  <p className={`text-xs mt-1 ${TC.textSecondary}`}>
                    Track your favorite cryptocurrencies
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${TC.textSecondary} text-sm`} />
                <input
                  type="text"
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all duration-200 text-sm ${
                    isLight ? "bg-gray-100 border-gray-200 text-gray-900 focus:border-cyan-500" : "bg-gray-800 border-gray-700 text-white focus:border-cyan-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "0.1s" }}>
            {[
              { label: "Total Coins", value: stats.total, icon: FaStar, color: "yellow" },
              { label: "Portfolio Value", value: `$${stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: FaChartLine, color: "cyan" },
              { label: "Gainers", value: stats.gainers, icon: FaTrophy, color: "green" },
              { label: "Losers", value: stats.losers, icon: FaFire, color: "red" },
            ].map((stat, i) => (
              <div key={i} className={`
                rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-in-out 
                transform hover:scale-[1.02] hover:-translate-y-1 will-change-transform
                ${TC.bgStatsCard}
              `}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    stat.color === 'yellow' ? (isLight ? "bg-yellow-50 text-yellow-600" : "bg-yellow-500/10 text-yellow-400") :
                    stat.color === 'cyan' ? (isLight ? "bg-cyan-50 text-cyan-600" : "bg-cyan-500/10 text-cyan-400") :
                    stat.color === 'green' ? (isLight ? "bg-green-50 text-green-600" : "bg-green-500/10 text-green-400") :
                    (isLight ? "bg-red-50 text-red-600" : "bg-red-500/10 text-red-400")
                  }`}>
                    <stat.icon className="text-lg" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${TC.textPrimary}`}>{stat.value}</p>
                <p className={`text-xs mt-1 ${TC.textSecondary}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Coins Table */}
          {loading ? (
            <div className={`rounded-2xl overflow-hidden ${TC.bgCard}`}>
              <div className="p-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="mb-4">
                    <Skeleton height={60} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} borderRadius="0.5rem" />
                  </div>
                ))}
              </div>
            </div>
          ) : paginatedCoins.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl ${TC.bgCard} fade-in`}>
              <div className="text-6xl mb-4">⭐</div>
              <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>
                {searchTerm ? `No coins found matching "${searchTerm}"` : "Your watchlist is empty"}
              </h3>
              <p className={TC.textSecondary}>
                {!searchTerm && "Add coins to your watchlist to track them here"}
              </p>
            </div>
          ) : (
            <>
            <div className={`hidden md:block rounded-2xl overflow-hidden fade-in ${TC.bgCard}`} style={{ animationDelay: "0.2s" }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`${isLight ? "bg-gray-50 border-b border-gray-200" : "bg-gray-900/50 border-b border-gray-700"}`}>
                      <th className={`py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                        Coin
                      </th>
                      <th className={`py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                        Price
                      </th>
                      <th className={`py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                        24h Change
                      </th>
                      <th className={`py-4 px-6 text-right text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                        Market Cap
                      </th>
                      <th className={`py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                        7d Trend
                      </th>
                      <th className={`py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                        Holdings
                      </th>
                      <th className={`py-4 px-6 text-center text-xs font-semibold uppercase tracking-wider ${TC.textSecondary}`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? "divide-gray-200" : "divide-gray-700"}`}>
                    {paginatedCoins.map((coin, index) => (
                      <tr
                        key={coin.id}
                        onClick={() => handleCoinClick(coin)}
                        className={`transition-all duration-200 cursor-pointer group fade-in ${
                          isLight ? "hover:bg-gray-50" : "hover:bg-gray-700/30"
                        }`}
                        style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                      >
                        {/* Coin Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img 
                              src={coin.image} 
                              alt={coin.name} 
                              className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300" 
                            />
                            <div className="min-w-0">
                              <div className={`font-semibold text-base truncate group-hover:text-cyan-400 transition-colors ${TC.textPrimary}`}>
                                {coin.name}
                              </div>
                              <div className={`text-sm uppercase ${TC.textSecondary}`}>
                                {coin.symbol}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className={`py-4 px-6 text-right ${TC.textPrimary}`}>
                          <div className="font-semibold text-base">
                            ${coin.current_price?.toLocaleString("en-IN", { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: coin.current_price < 1 ? 6 : 2 
                            }) || "0"}
                          </div>
                        </td>

                        {/* 24h Change */}
                        <td className="py-4 px-6 text-right">
                          <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                            (coin.price_change_percentage_24h || 0) >= 0
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {(coin.price_change_percentage_24h || 0) >= 0 ? "↑" : "↓"}
                            {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                          </div>
                        </td>

                        {/* Market Cap */}
                        <td className={`py-4 px-6 text-right font-medium ${TC.textSecondary}`}>
                          ${(coin.market_cap || 0) >= 1e12 
                            ? ((coin.market_cap || 0) / 1e12).toFixed(2) + "T"
                            : (coin.market_cap || 0) >= 1e9 
                            ? ((coin.market_cap || 0) / 1e9).toFixed(2) + "B"
                            : (coin.market_cap || 0) >= 1e6 
                            ? ((coin.market_cap || 0) / 1e6).toFixed(2) + "M"
                            : (coin.market_cap || 0).toLocaleString("en-IN")}
                        </td>

                        {/* 7d Trend */}
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <Sparkline 
                              data={coin.sparkline_in_7d?.price || []} 
                              width={120} 
                              height={40}
                              positive={(coin.price_change_percentage_24h || 0) >= 0}
                            />
                          </div>
                        </td>

                        {/* Holdings */}
                        <td className="py-4 px-6 text-center">
                          {coin.userHolding ? (
                            <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              isLight ? "bg-green-100 text-green-700" : "bg-green-500/20 text-green-400"
                            }`}>
                              {(coin.userHolding.totalQuantity || coin.userHolding.quantity || 0).toFixed(4)} {coin.symbol.toUpperCase()}
                            </div>
                          ) : (
                            <span className={`text-sm ${TC.textSecondary}`}>—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleTrade(coin)}
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 hover:scale-105 shadow-md"
                            >
                              <FaExchangeAlt className="text-xs" />
                              Trade
                            </button>
                            <button
                              onClick={() => setRemoveModal({ show: true, coin })}
                              className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                                isLight ? "bg-gray-100 text-red-600 hover:bg-red-600 hover:text-white" : "bg-gray-700 text-red-400 hover:bg-red-600 hover:text-white"
                              }`}
                            >
                              <MdDeleteForever className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className={`px-6 py-4 border-t ${isLight ? "bg-gray-50 border-gray-200" : "bg-gray-900/50 border-gray-700"}`}>
                <div className={`flex justify-between items-center text-sm ${TC.textSecondary}`}>
                  <span>Showing {paginatedCoins.length} of {filteredCoins.length} coins</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 fade-in" style={{ animationDelay: "0.2s" }}>
              {paginatedCoins.map((coin, index) => (
                <div 
                  key={coin.id}
                  onClick={() => handleCoinClick(coin)}
                  className={`rounded-2xl p-4 border ${TC.bgCard} ${isLight ? "border-gray-200" : "border-gray-700"} active:scale-[0.98] transition-transform`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
                      <div>
                        <div className={`font-bold ${TC.textPrimary}`}>{coin.symbol.toUpperCase()}</div>
                        <div className={`text-xs ${TC.textSecondary}`}>{coin.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${TC.textPrimary}`}>
                        ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </div>
                      <div className={`text-xs font-semibold ${
                        (coin.price_change_percentage_24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                      }`}>
                        {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                        {coin.price_change_percentage_24h?.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="w-24">
                       <Sparkline 
                         data={coin.sparkline_in_7d?.price || []} 
                         width={96} 
                         height={32}
                         positive={(coin.price_change_percentage_24h || 0) >= 0}
                       />
                    </div>
                    <div className="text-right">
                       <div className={`text-xs ${TC.textSecondary}`}>Market Cap</div>
                       <div className={`text-xs font-medium ${TC.textPrimary}`}>
                         ${(coin.market_cap / 1e9).toFixed(2)}B
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                     <button
                       onClick={() => handleTrade(coin)}
                       className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform hover:scale-105"
                     >
                       Trade
                     </button>
                     <button
                       onClick={() => setRemoveModal({ show: true, coin })}
                       className={`px-4 py-2 rounded-xl border ${isLight ? "border-red-200 text-red-600 bg-red-50" : "border-red-500/30 text-red-400 bg-red-500/10"} active:scale-95 transition-transform hover:scale-105 shadow-sm`}
                     >
                       <MdDeleteForever className="text-lg" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4 fade-in">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                  isLight ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}>
                Prev
              </button>
              <span className={TC.textSecondary}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
                  isLight ? "bg-gray-200 text-gray-900 hover:bg-gray-300" : "bg-gray-700 text-white hover:bg-gray-600"
                }`}>
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      <RemoveConfirmationModal
        show={removeModal.show}
        onClose={() => setRemoveModal({ show: false, coin: null })}
        onConfirm={handleRemoveConfirm}
        coin={removeModal.coin}
      />

      <TradeModal
        show={tradeModal.show}
        onClose={handleTradeClose}
        coin={tradeModal.coin}
        userCoinData={watchlistData}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />
    </>
  );
};

export default Watchlist;