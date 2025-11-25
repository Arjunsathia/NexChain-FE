import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { FaBell, FaSearch, FaExchangeAlt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { deleteWatchList, getData } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TradeModal from "./UserProfile/Components/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";

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

// Remove Confirmation Modal Component (Dual Mode)
function RemoveConfirmationModal({ show, onClose, onConfirm, coin }) {
  const isLight = useThemeCheck();
  if (!show) return null;

  const bgClasses = isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800 border-gray-700 shadow-2xl";
  const textClasses = isLight ? "text-gray-900" : "text-white";
  const subTextClasses = isLight ? "text-gray-600" : "text-gray-300";
  const cancelClasses = isLight ? "bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300" : "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
      <div className={`rounded-xl p-6 max-w-md w-full mx-auto fade-in ${bgClasses}`}>
        <div className="text-center">
          {/* Warning Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLight ? "bg-red-100" : "bg-red-500/20"}`}>
            <MdDeleteForever className={`text-2xl ${isLight ? "text-red-600" : "text-red-400"}`} />
          </div>
          
          {/* Title */}
          <h3 className={`text-lg font-bold mb-2 ${textClasses}`}>
            Remove from Watchlist
          </h3>
          
          {/* Message */}
          <p className={`text-sm mb-6 ${subTextClasses}`}>
            Are you sure you want to remove <span className={`font-semibold ${textClasses}`}>{coin?.name}</span> from your watchlist?
          </p>
          
          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${cancelClasses}`}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              <MdDeleteForever className="text-base" />
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sparkline (same as before)
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
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { coins: liveCoins } = useCoinContext();
  const { purchasedCoins, refreshPurchasedCoins } = usePurchasedCoins();

  // ... (rest of the state and hooks remain the same)
  const userFromLocalStorage = JSON.parse(
    localStorage.getItem("NEXCHAIN_USER")
  );
  const userId = user?.id || userFromLocalStorage?.id;

  const [watchlistData, setWatchlistData] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });
  const [removeModal, setRemoveModal] = useState({
    show: false,
    coin: null,
  });

  // WebSocket ref for live updates
  const ws = useRef(null);
  const livePricesRef = useRef({});

  const itemsPerPage = 10;
  const navigate = useNavigate();

  // ... (useEffects and useMemos remain the same: livePricesRef, mergedCoins, WebSocket logic, filteredCoins, pagination logic)
  useEffect(() => {
    livePricesRef.current = livePrices;
  }, [livePrices]);

  const mergedCoins = useMemo(() => {
    return watchlistData
      .map((item) => {
        const liveCoin = liveCoins.find((coin) => coin.id === item.id);
        const livePriceData = livePrices[item.id];
        
        const combinedCoin = {
          ...item,
          ...(liveCoin || {}),
          ...(livePriceData || {}),
          userHolding: purchasedCoins.find(
            (pc) => pc.coin_id === item.id || pc.id === item.id
          ) || null,
        };

        if (livePriceData && livePriceData.current_price) {
          combinedCoin.current_price = livePriceData.current_price;
          combinedCoin.price_change_percentage_24h = livePriceData.price_change_percentage_24h;
        }

        return combinedCoin;
      })
      .filter(Boolean);
  }, [watchlistData, liveCoins, livePrices, purchasedCoins]);

  useEffect(() => {
    if (watchlistData.length === 0) return;

    const symbols = watchlistData
      .map(coin => {
        const symbolMap = {
          bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt", cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt", "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt", "stellar": "xlmusdt", "cosmos": "atomusdt", "monero": "xmusdt", "ethereum-classic": "etcusdt", "bitcoin-cash": "bchusdt", "filecoin": "filusdt", "theta": "thetausdt", "vechain": "vetusdt", "tron": "trxusdt"
        };
        return symbolMap[coin.id] ? `${symbolMap[coin.id]}@ticker` : null;
      })
      .filter(Boolean);

    if (symbols.length === 0) return;
    const streams = symbols.join('/');

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      ws.current.onopen = () => { console.log('WebSocket connected for watchlist live prices'); };
      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace('@ticker', '');
          const coinData = message.data;
          
          const symbolToCoinId = { "btcusdt": "bitcoin", "ethusdt": "ethereum", "bnbusdt": "binancecoin", "xrpusdt": "ripple", "adausdt": "cardano", "solusdt": "solana", "dogeusdt": "dogecoin", "dotusdt": "polkadot", "maticusdt": "matic-network", "ltcusdt": "litecoin", "linkusdt": "chainlink", "xlmusdt": "stellar", "atomusdt": "cosmos", "xmusdt": "monero", "etcusdt": "ethereum-classic", "bchusdt": "bitcoin-cash", "filusdt": "filecoin", "thetausdt": "theta", "vetusdt": "vechain", "trxusdt": "tron" };

          const coinId = symbolToCoinId[symbol.toLowerCase()]; // Ensure symbol is lowercase for map lookup
          if (coinId) {
            setLivePrices(prev => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(coinData.c),
                price_change_percentage_24h: parseFloat(coinData.P),
                price_change_24h: parseFloat(coinData.p),
                total_volume: parseFloat(coinData.v) * parseFloat(coinData.c),
                market_cap: parseFloat(coinData.c) * (prev[coinId]?.market_cap / prev[coinId]?.current_price || 1000000000)
              }
            }));
          }
        }
      };
      ws.current.onerror = (error) => { console.error('Watchlist WebSocket error:', error); };
      ws.current.onclose = () => { console.log('Watchlist WebSocket disconnected'); };
    } catch (error) {
      console.error('Watchlist WebSocket setup failed:', error);
    }

    return () => {
      if (ws.current) { ws.current.close(); }
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
  }, [filteredCoins, currentPage, itemsPerPage]);

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

  const handleBellClick = useCallback((coin) => {
    toast.info(`Price alert set for ${coin.name}`);
  }, []);

  const showRemoveConfirmation = useCallback((coin) => {
    setRemoveModal({ show: true, coin: coin });
  }, []);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeModal.coin || !userId) return;
    setLoading(true);
    try {
      await deleteWatchList("/watchlist/remove", { id: removeModal.coin?.id, user_id: userId });
      toast.success("Coin removed from watchlist!", {
        icon: "✅",
        style: {
          background: isLight ? "#FFFFFF" : "#111827",
          color: isLight ? "#16A34A" : "#22c55e",
          fontWeight: "600", fontSize: "14px", padding: "12px 16px", borderRadius: "8px",
          boxShadow: isLight ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
        },
      });
      fetchData();
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      toast.error("Failed to remove coin. Please try again.");
    } finally {
      setLoading(false);
      setRemoveModal({ show: false, coin: null });
    }
  }, [removeModal.coin, userId, fetchData, isLight]);

  const handleRemoveCancel = useCallback(() => {
    setRemoveModal({ show: false, coin: null });
  }, []);

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

  const formatCurrency = useCallback((value) => {
    if (!value) return "$0";
    return "$" + (
      value >= 1e12 ? (value / 1e12).toFixed(1) + "T" :
      value >= 1e9 ? (value / 1e9).toFixed(1) + "B" :
      value >= 1e6 ? (value / 1e6).toFixed(1) + "M" :
      value.toLocaleString("en-IN")
    );
  }, []);

  const renderPaginationButtons = useMemo(() => {
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    const baseClass = isLight ? "bg-gray-200 text-gray-800 hover:bg-gray-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600";
    const activeClass = isLight ? "bg-cyan-600 text-white shadow-md" : "bg-cyan-600 text-white shadow-lg";

    return [...Array(endPage - startPage + 1)].map((_, index) => {
      const page = startPage + index;
      return (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 fade-in ${
            currentPage === page ? activeClass : baseClass
          }`}
          style={{ animationDelay: `${0.8 + index * 0.05}s` }}
        >
          {page}
        </button>
      );
    });
  }, [totalPages, currentPage, isLight]);

  // Dynamic Class Definitions based on theme
  const containerClasses = isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800/50 backdrop-blur-sm border-gray-700 shadow-2xl";
  const textClasses = isLight ? "text-gray-900" : "text-white";
  const subTextClasses = isLight ? "text-gray-500" : "text-gray-400";
  const hoverClasses = isLight ? "hover:bg-gray-100 cursor-pointer" : "hover:bg-gray-700/30 cursor-pointer";
  const tableHeaderClasses = isLight ? "border-b border-gray-300 bg-gray-100 text-gray-600" : "border-b border-gray-700 bg-gray-900/50 text-gray-400";
  const tableBodyDivide = isLight ? "divide-gray-200" : "divide-gray-700";
  const searchBgClasses = isLight ? "bg-white border-gray-300 text-gray-800 placeholder-gray-500" : "bg-gray-800 border-gray-700 text-white placeholder-gray-400";
  const livePriceClasses = isLight ? "text-green-600" : "text-green-400";
  const loadingClasses = isLight ? "bg-white border-gray-300 text-cyan-600" : "bg-gray-800/50 border-gray-700 text-cyan-400";
  
  const iconButtonClasses = (hover) => isLight 
    ? `bg-gray-200 flex items-center justify-center ${hover ? "hover:bg-yellow-500/20 hover:text-yellow-600" : ""}` 
    : `bg-gray-700 flex items-center justify-center ${hover ? "hover:bg-yellow-500/20 hover:text-yellow-400" : ""}`;

  return (
    <>
      <main className={`min-h-screen ${isLight ? "text-gray-800" : "text-white"} p-3 sm:p-4 lg:p-6`}>
        <div className="max-w-7xl mx-auto space-y-4">
          <Outlet />

          {/* Header Section */}
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div className="fade-in" style={{ animationDelay: "0.2s" }}>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Watchlist
                </h1>
                <p className={`text-sm mt-1 ${subTextClasses}`}>
                  Track your favorite cryptocurrencies
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64 fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search coins by name or symbol..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className={`w-full ${searchBgClasses} rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm transition-all duration-200 border`}
                  />
                  <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${subTextClasses} text-sm`} />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${subTextClasses} hover:${isLight ? "text-gray-900" : "text-white"} text-lg transition-colors`}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            </div>
            {searchTerm && (
              <div className={`text-sm mb-4 fade-in ${subTextClasses}`} style={{ animationDelay: "0.4s" }}>
                Found {filteredCoins.length} coin
                {filteredCoins.length !== 1 ? "s" : ""} matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-3">
            {loading ? (
              <div className={`backdrop-blur-sm rounded-xl p-8 text-center fade-in ${loadingClasses}`}>
                <div className="flex justify-center items-center gap-3 text-cyan-400">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-base">Loading watchlist...</span>
                </div>
              </div>
            ) : paginatedCoins.length > 0 ? (
              paginatedCoins.map((coin, index) => (
                <div
                  key={coin.id}
                  onClick={() => handleCoinClick(coin)}
                  className={`backdrop-blur-sm rounded-xl p-4 transition-all duration-300 group fade-in shadow-sm border ${isLight ? "bg-white border-gray-300 hover:bg-gray-100" : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-cyan-500/50"}`}
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  {/* Header with Bell, Coin Info, and 24H Change */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBellClick(coin);
                        }}
                        className={`flex-shrink-0 w-8 h-8 rounded-full transition-all duration-200 ${iconButtonClasses(true)}`}
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
                        <div className={`font-semibold text-base truncate transition-colors ${textClasses} group-hover:text-cyan-400`}>
                          {coin.name}
                        </div>
                        <div className={`text-sm uppercase ${subTextClasses}`}>
                          {coin.symbol.toUpperCase()}
                        </div>
                        {/* Show holdings badge if user has this coin */}
                        {coin.userHolding && (
                          <div className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${isLight ? "text-green-700 bg-green-100" : "text-green-400 bg-green-400/20"}`}>
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
                    <div className={`font-bold text-xl ${textClasses}`}>
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
                    {[
                      { value: coin.price_change_percentage_1h_in_currency, label: "1H" },
                      { value: coin.price_change_percentage_24h_in_currency, label: "24H" },
                      { value: coin.price_change_percentage_7d_in_currency, label: "7D" },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className={`text-center p-2 rounded ${
                          stat.value < 0 ? (isLight ? "bg-red-100 text-red-600" : "bg-red-500/20 text-red-400")
                            : (isLight ? "bg-green-100 text-green-600" : "bg-green-500/20 text-green-400")
                        }`}
                      >
                        <div>{stat.label}</div>
                        <div className="font-semibold">
                          {stat.value?.toFixed(2)}%
                        </div>
                      </div>
                    ))}
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
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-lg flex items-center justify-center gap-2 fade-in"
                      style={{ animationDelay: `${0.5 + index * 0.1 + 0.05}s` }}
                    >
                      <FaExchangeAlt className="text-sm" />
                      Trade
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showRemoveConfirmation(coin);
                      }}
                      className={`
                        ${isLight ? "bg-gray-200 text-red-600" : "bg-gray-700/50 text-red-400"} 
                        hover:bg-red-600 hover:text-white rounded-lg px-4 py-2.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium fade-in
                      `}
                      style={{ animationDelay: `${0.5 + index * 0.1 + 0.06}s` }}
                    >
                      <MdDeleteForever className="text-base" />
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-center py-12 rounded-xl fade-in border ${subTextClasses} ${isLight ? "bg-white border-gray-300" : "bg-gray-800/50 border-gray-700"}`} style={{ animationDelay: "0.5s" }}>
                <div className="text-5xl mb-3">⭐</div>
                {searchTerm ? `No coins found matching "${searchTerm}"` : "Your watchlist is empty"}
                {!searchTerm && (
                  <p className={`text-sm mt-2 ${subTextClasses}`}>
                    Add coins to your watchlist to track them here
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block fade-in" style={{ animationDelay: "0.4s" }}>
            <div className={`rounded-xl overflow-hidden shadow-2xl border ${containerClasses}`}>
              {loading ? (
                <div className="p-12 text-center">
                  <div className={`flex justify-center items-center gap-3 ${livePriceClasses}`}>
                    <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-base">Loading watchlist...</span>
                  </div>
                </div>
              ) : paginatedCoins.length === 0 ? (
                <div className={`p-12 text-center fade-in ${subTextClasses}`} style={{ animationDelay: "0.5s" }}>
                  <div className="text-6xl mb-4">⭐</div>
                  <div className="text-xl">
                    {searchTerm ? `No coins found matching "${searchTerm}"` : "Your watchlist is empty"}
                  </div>
                  {!searchTerm && (
                    <p className={`text-sm mt-2 ${subTextClasses}`}>
                      Add coins to your watchlist to track them here
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`fade-in ${tableHeaderClasses}`} style={{ animationDelay: "0.5s" }}>
                        {["Alert", "Coin", "Price", "24h %", "Market Cap", "Volume", "Trend", "Actions"].map((header) => (
                          <th key={header} className={`py-4 px-6 text-${header === "Coin" ? "left" : "right"} text-xs font-semibold uppercase tracking-wider ${header === "Alert" || header === "Trend" || header === "Actions" ? "text-center" : ""}`}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${tableBodyDivide}`}>
                      {paginatedCoins.map((coin, index) => (
                        <tr
                          key={coin.id}
                          onClick={() => handleCoinClick(coin)}
                          className={`${hoverClasses} transition-all duration-200 group fade-in`}
                          style={{ animationDelay: `${0.6 + index * 0.05}s` }}
                        >
                          {/* Bell Icon */}
                          <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleBellClick(coin)}
                              className={`w-8 h-8 rounded-full transition-all duration-200 mx-auto fade-in ${iconButtonClasses(true)}`}
                              style={{ animationDelay: `${0.6 + index * 0.05 + 0.02}s` }}
                              title="Set Alert"
                            >
                              <FaBell className="text-sm" />
                            </button>
                          </td>

                          {/* Coin Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3 fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.03}s` }}>
                              <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full group-hover:scale-110 transition-transform duration-300" />
                              <div className="min-w-0 flex-1">
                                <div className={`text-base font-semibold transition-colors ${textClasses} group-hover:text-cyan-400`}>{coin.name}</div>
                                <div className={`text-sm uppercase ${subTextClasses}`}>{coin.symbol.toUpperCase()}</div>
                                {coin.userHolding && (
                                  <div className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${isLight ? "text-green-700 bg-green-100" : "text-green-400 bg-green-400/20"}`}>
                                    Holding: {coin.userHolding.totalQuantity?.toFixed(6) || coin.userHolding.quantity?.toFixed(6)} {coin.symbol.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Price */}
                          <td className={`py-4 px-6 text-right fade-in ${textClasses}`} style={{ animationDelay: `${0.6 + index * 0.05 + 0.04}s` }}>
                            <div className="text-base font-semibold">
                              ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || "0"}
                            </div>
                          </td>

                          {/* 24H Change */}
                          <td
                            className={`py-4 px-6 text-right font-semibold fade-in ${coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"}`}
                            style={{ animationDelay: `${0.6 + index * 0.05 + 0.05}s` }}
                          >
                            {coin.price_change_percentage_24h?.toFixed(2) || "0.00"}%
                          </td>

                          {/* Market Cap */}
                          <td className={`py-4 px-6 text-right fade-in ${subTextClasses}`} style={{ animationDelay: `${0.6 + index * 0.05 + 0.06}s` }}>
                            <div className="font-medium">{formatCurrency(coin.market_cap)}</div>
                          </td>

                          {/* Volume */}
                          <td className={`py-4 px-6 text-right fade-in ${subTextClasses}`} style={{ animationDelay: `${0.6 + index * 0.05 + 0.07}s` }}>
                            <div className="font-medium">{formatCurrency(coin.total_volume)}</div>
                          </td>

                          {/* Chart */}
                          <td className="py-4 px-6 fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.08}s` }}>
                            <div className="flex justify-center">
                              <Sparkline data={coin.sparkline_in_7d?.price || []} width={100} height={40} positive={coin.price_change_percentage_24h >= 0} />
                            </div>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6 fade-in" style={{ animationDelay: `${0.6 + index * 0.05 + 0.09}s` }}>
                            <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleTrade(coin)}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105"
                              >
                                <FaExchangeAlt className="text-xs" />
                                Trade
                              </button>
                              <button
                                onClick={() => showRemoveConfirmation(coin)}
                                className={`${isLight ? "bg-gray-200 text-red-600 hover:bg-red-600 hover:text-white" : "bg-gray-700/50 hover:bg-red-600 text-red-400 hover:text-white"} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:scale-105`}
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
                <div className={`px-6 py-4 border-t ${isLight ? "bg-gray-100 border-gray-300" : "bg-gray-900/50 border-gray-700"} fade-in`} style={{ animationDelay: "0.7s" }}>
                  <div className={`flex justify-between items-center text-sm ${subTextClasses}`}>
                    <span>Showing {paginatedCoins.length} of {filteredCoins.length} coins</span>
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
                  className={`px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 fade-in ${isLight ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-gray-700 hover:bg-gray-600 text-gray-300"}`}
                  style={{ animationDelay: "0.85s" }}
                >
                  Prev
                </button>
                {renderPaginationButtons}
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 fade-in ${isLight ? "bg-gray-200 hover:bg-gray-300 text-gray-800" : "bg-gray-700 hover:bg-gray-600 text-gray-300"}`}
                  style={{ animationDelay: "0.9s" }}
                >
                  Next
                </button>
              </div>
              <div className={`text-sm fade-in ${subTextClasses}`} style={{ animationDelay: "0.95s" }}>
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Remove Confirmation Modal */}
      <RemoveConfirmationModal
        show={removeModal.show}
        onClose={handleRemoveCancel}
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