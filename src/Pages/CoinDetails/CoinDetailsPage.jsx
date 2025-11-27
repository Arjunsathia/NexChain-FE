import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { getCoinById } from "@/api/coinApis";
import { postForm, getData, deleteWatchList } from "@/api/axiosConfig";
import { toast } from "react-toastify";
import useUserContext from "@/Context/UserContext/useUserContext";
import {
  FaExternalLinkAlt,
  FaStar,
  FaRegStar,
  FaExchangeAlt,
  FaChartLine,
  FaCoins,
  FaArrowUp,
  FaArrowDown,
  FaGlobe,
  FaBook,
  FaWallet,
  FaTrophy,
} from "react-icons/fa";
import TradeModal from "../UserProfile/Components/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import TradingViewWidget from "@/Pages/CoinDetails/TradingViewWidget";
import OrderBook from "@/Pages/CoinDetails/OrderBook";
import TradeHistory from "@/Pages/CoinDetails/TradeHistory";
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

function CoinDetailsPage() {
  const isLight = useThemeCheck();
  const { coinId } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const ws = useRef(null);

  const { user } = useUserContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { coins: liveCoins } = useCoinContext();

  // Theme Classes
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgCard: isLight ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    bgHeader: isLight ? "bg-white/80 backdrop-blur-xl shadow-lg border-none" : "bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
    skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
  }), [isLight]);

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if user has holdings
  const userHoldings = useMemo(() => {
    if (!coinId || !purchasedCoins || purchasedCoins.length === 0) return null;
    return purchasedCoins.find(holding => holding.coinId === coinId);
  }, [coinId, purchasedCoins]);

  const hasHoldings = useMemo(() => {
    return userHoldings && (userHoldings.totalQuantity > 0 || userHoldings.quantity > 0);
  }, [userHoldings]);

  // Find live coin data
  const liveCoin = useMemo(() => {
    return liveCoins.find(c => c.id === coinId);
  }, [liveCoins, coinId]);

  // Get symbol for WebSocket
  const coinSymbol = useMemo(() => {
    const symbolMap = {
      bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt",
      cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt",
      "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt"
    };
    return symbolMap[coinId] || `${coin?.symbol}usdt`.toLowerCase();
  }, [coinId, coin]);

  // WebSocket for live price
  useEffect(() => {
    if (!coinSymbol) return;

    const wsUrl = `wss://stream.binance.com:9443/ws/${coinSymbol}@ticker`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLivePrice({
        price: parseFloat(data.c),
        change24h: parseFloat(data.P),
        high24h: parseFloat(data.h),
        low24h: parseFloat(data.l),
        volume24h: parseFloat(data.v) * parseFloat(data.c),
      });
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [coinSymbol]);

  // Fetch watchlist status
  const checkWatchlistStatus = useCallback(async () => {
    if (!user?.id || !coinId) return;

    setLoadingWatchlist(true);
    try {
      const res = await getData("/watchlist", { user_id: user.id });
      const watchlistIds = (res || []).map(item => item.id || item.coin_id);
      setIsInWatchlist(watchlistIds.includes(coinId));
    } catch (err) {
      console.error("Failed to fetch watchlist status", err);
    } finally {
      setLoadingWatchlist(false);
    }
  }, [user?.id, coinId]);

  useEffect(() => {
    checkWatchlistStatus();
  }, [checkWatchlistStatus]);

  // Fetch coin details
  const fetchCoin = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCoinById(coinId);
      setCoin(res?.data ?? res);
    } catch (err) {
      console.error("Error fetching coin", err);
      setCoin(null);
    } finally {
      setLoading(false);
    }
  }, [coinId]);

  useEffect(() => {
    if (!coinId) return;
    fetchCoin();
  }, [fetchCoin, coinId]);

  const [tradeModal, setTradeModal] = useState({ show: false, coin: null, type: "buy" });

  const handleTrade = useCallback(() => {
    if (!coin || !user) {
      alert("Please login to trade cryptocurrency");
      return;
    }

    const tradeCoin = liveCoin || {
      ...coin,
      current_price: livePrice?.price || coin?.market_data?.current_price?.usd,
      image: coin.image?.large,
      symbol: coin.symbol,
      name: coin.name,
      id: coin.id
    };

    setTradeModal({ show: true, coin: tradeCoin, type: "buy" });
  }, [coin, user, liveCoin, livePrice]);

  // Watchlist toggle with backend integration
  const toggleWatchlist = useCallback(async () => {
    if (!user?.id) {
      toast.error("Please login to manage watchlist");
      return;
    }

    if (!coin) return;

    const wasInWatchlist = isInWatchlist;
    
    // Optimistic update
    setIsInWatchlist(!wasInWatchlist);

    const postData = {
      user_id: user.id,
      id: coin.id,
      image: coin.image?.large || coin.image?.small,
      symbol: coin.symbol,
      name: coin.name,
      current_price: livePrice?.price || coin.market_data?.current_price?.usd,
      price_change_percentage_24h: livePrice?.change24h || coin.market_data?.price_change_percentage_24h,
      market_cap: coin.market_data?.market_cap?.usd,
      total_volume: livePrice?.volume24h || coin.market_data?.total_volume?.usd,
      sparkline_in_7d: { price: [] },
    };

    setLoadingWatchlist(true);
    try {
      if (wasInWatchlist) {
        // Remove from watchlist
        await deleteWatchList("/watchlist/remove", {
          id: coinId,
          user_id: user.id,
        });
        toast.success("Removed from watchlist!", {
          icon: "✅",
          style: {
            background: isLight ? "#FFFFFF" : "#111827",
            color: isLight ? "#16A34A" : "#22c55e",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: isLight ? "0 4px 6px rgba(0,0,0,0.1)" : "0 4px 6px rgba(0,0,0,0.4)",
          },
        });
      } else {
        // Add to watchlist
        await postForm("/watchlist/add", postData);
        toast.success("Added to watchlist!", {
          icon: "⭐",
          style: {
            background: isLight ? "#FFFFFF" : "#111827",
            color: isLight ? "#FACC15" : "#eab308",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: isLight ? "0 4px 6px rgba(0,0,0,0.1)" : "0 4px 6px rgba(0,0,0,0.4)",
          },
        });
      }
      // Refresh watchlist status
      await checkWatchlistStatus();
    } catch (err) {
      console.error("Watchlist operation failed:", err);
      // Revert optimistic update on error
      setIsInWatchlist(wasInWatchlist);
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoadingWatchlist(false);
    }
  }, [isInWatchlist, user?.id, coin, coinId, livePrice, isLight, checkWatchlistStatus]);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return "$0";
    const num = Number(value);
    return "$" + num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: num < 1 ? 6 : 2
    });
  }, []);

  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value))) return "0";
    return Number(value).toLocaleString('en-US');
  }, []);

  if (loading || !coin) {
    return (
      <div className={`min-h-screen ${TC.textPrimary} transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-2xl ${TC.bgCard} p-6`}>
              <Skeleton height={200} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} borderRadius="1rem" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentPrice = livePrice?.price || coin.market_data?.current_price?.usd || 0;
  const priceChange24h = livePrice?.change24h || coin.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange24h >= 0;

  return (
    <>
      <div className={`min-h-screen ${TC.textPrimary} p-2 sm:p-4 lg:p-6 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Sticky Header */}
        <div className={`sticky top-2 z-40 max-w-7xl mx-auto rounded-2xl mb-6 ${TC.bgHeader} transition-colors duration-300`}>
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={coin.image?.large}
                  alt={coin.name}
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-md"
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg md:text-2xl font-bold leading-none">{coin.name}</h1>
                    <span className={`text-xs md:text-sm uppercase px-2 py-1 rounded-lg ${isLight ? "bg-cyan-100 text-cyan-700" : "bg-cyan-500/20 text-cyan-400"}`}>
                      {coin.symbol}
                    </span>
                    <button
                      onClick={toggleWatchlist}
                      disabled={loadingWatchlist}
                      className={`text-lg md:text-xl transition-transform ${loadingWatchlist ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} ${isInWatchlist ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {isInWatchlist ? <FaStar /> : <FaRegStar />}
                    </button>
                  </div>
                  <p className={`text-xs mt-1 ${TC.textSecondary}`}>
                    Rank #{coin.market_cap_rank || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className="text-2xl font-bold">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={`text-sm font-semibold flex items-center justify-end gap-1 ${isPositive ? "text-green-400" : "text-red-400"}`}>
                    {isPositive ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
                    {isPositive ? "+" : ""}{priceChange24h.toFixed(2)}%
                  </div>
                </div>
                
                <button
                  onClick={handleTrade}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 text-sm md:px-6 md:py-2.5 md:text-base rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105 hover:shadow-cyan-500/25">
                  <FaExchangeAlt />
                  Trade
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 space-y-6">
          
          {/* Holdings Badge - Moved to top */}
          {hasHoldings && (
            <div className={`rounded-2xl px-4 py-3 fade-in ${isLight ? "bg-green-50" : "bg-green-500/10"}`} style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isLight ? "bg-green-100" : "bg-green-500/20"}`}>
                  <FaWallet className={`text-base ${isLight ? "text-green-600" : "text-green-400"}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isLight ? "text-green-900" : "text-green-400"}`}>You own this asset</p>
                  <p className={`text-xs truncate ${isLight ? "text-green-700" : "text-green-500"}`}>
                    {(userHoldings.totalQuantity || userHoldings.quantity || 0).toFixed(6)} {coin.symbol?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "0.2s" }}>
            {[
              { label: "Market Cap", value: formatCurrency(coin.market_data?.market_cap?.usd), icon: FaChartLine, color: "cyan" },
              { label: "24h Volume", value: formatCurrency(livePrice?.volume24h || coin.market_data?.total_volume?.usd), icon: FaCoins, color: "purple" },
              { label: "24h High", value: formatCurrency(livePrice?.high24h || coin.market_data?.high_24h?.usd), icon: FaArrowUp, color: "green" },
              { label: "24h Low", value: formatCurrency(livePrice?.low24h || coin.market_data?.low_24h?.usd), icon: FaArrowDown, color: "red" },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-105 ${TC.bgCard}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    stat.color === 'cyan' ? (isLight ? "bg-cyan-50 text-cyan-600" : "bg-cyan-500/10 text-cyan-400") :
                    stat.color === 'purple' ? (isLight ? "bg-purple-50 text-purple-600" : "bg-purple-500/10 text-purple-400") :
                    stat.color === 'green' ? (isLight ? "bg-green-50 text-green-600" : "bg-green-500/10 text-green-400") :
                    (isLight ? "bg-red-50 text-red-600" : "bg-red-500/10 text-red-400")
                  }`}>
                    <stat.icon className="text-lg" />
                  </div>
                </div>
                <p className={`text-sm sm:text-lg md:text-xl font-bold truncate ${TC.textPrimary}`}>{stat.value}</p>
                <p className={`text-xs mt-1 ${TC.textSecondary}`}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
            
            {/* Left Column - Chart */}
            <div className="contents lg:block lg:col-span-8 lg:space-y-6">
              {/* TradingView Chart */}
              <div className={`order-1 rounded-2xl overflow-hidden fade-in h-[400px] md:h-[600px] ${TC.bgCard}`} style={{ animationDelay: "0.3s" }}>
                <TradingViewWidget symbol={coin.symbol?.toUpperCase() + "USD"} theme={isLight ? 'light' : 'dark'} />
              </div>

              {/* Additional Stats */}
              <div className={`order-4 rounded-2xl p-6 fade-in ${TC.bgCard}`} style={{ animationDelay: "0.4s" }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  Additional Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Circulating Supply", value: `${formatNumber(coin.market_data?.circulating_supply)} ${coin.symbol?.toUpperCase()}` },
                    { label: "Total Supply", value: `${formatNumber(coin.market_data?.total_supply)} ${coin.symbol?.toUpperCase()}` },
                    { label: "All Time High", value: formatCurrency(coin.market_data?.ath?.usd) },
                    { label: "ATH Date", value: new Date(coin.market_data?.ath_date?.usd).toLocaleDateString() },
                    { label: "All Time Low", value: formatCurrency(coin.market_data?.atl?.usd) },
                    { label: "ATL Date", value: new Date(coin.market_data?.atl_date?.usd).toLocaleDateString() },
                  ].map((stat, i) => (
                    <div key={i} className={`p-3 rounded-lg ${isLight ? "bg-gray-50" : "bg-gray-700/30"}`}>
                      <p className={`text-xs mb-1 ${TC.textSecondary}`}>{stat.label}</p>
                      <p className={`text-xs sm:text-sm font-semibold truncate ${TC.textPrimary}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className={`order-5 rounded-2xl p-6 fade-in ${TC.bgCard}`} style={{ animationDelay: "0.5s" }}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaGlobe className="text-blue-500" />
                  Quick Links
                </h3>
                <div className="flex flex-wrap gap-3">
                  {coin.links?.homepage?.[0] && (
                    <a
                      href={coin.links.homepage[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                        isLight ? "bg-gray-100 text-blue-600 hover:bg-blue-50" : "bg-gray-700 text-cyan-400 hover:bg-gray-600"
                      }`}>
                      <FaExternalLinkAlt className="text-sm" />
                      Website
                    </a>
                  )}
                  {coin.links?.blockchain_site?.[0] && (
                    <a
                      href={coin.links.blockchain_site[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                        isLight ? "bg-gray-100 text-blue-600 hover:bg-blue-50" : "bg-gray-700 text-cyan-400 hover:bg-gray-600"
                      }`}>
                      <FaExternalLinkAlt className="text-sm" />
                      Explorer
                    </a>
                  )}
                  {coin.links?.official_forum_url?.[0] && (
                    <a
                      href={coin.links.official_forum_url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                        isLight ? "bg-gray-100 text-blue-600 hover:bg-blue-50" : "bg-gray-700 text-cyan-400 hover:bg-gray-600"
                      }`}>
                      <FaBook className="text-sm" />
                      Forum
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Order Book & Trade History */}
            <div className="contents lg:block lg:col-span-4 lg:space-y-6">
              <div className="fade-in order-2 h-[350px] md:h-[450px]" style={{ animationDelay: "0.6s" }}>
                <OrderBook symbol={coinSymbol} />
              </div>
              <div className="fade-in order-3 h-[350px] md:h-[450px]" style={{ animationDelay: "0.7s" }}>
                <TradeHistory symbol={coinSymbol} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal({ show: false, coin: null, type: "buy" })}
        coin={tradeModal.coin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />
    </>
  );
}

export default CoinDetailsPage;