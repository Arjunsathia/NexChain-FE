import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { getCoinById } from "@/api/coinApis";
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
} from "react-icons/fa";
import TradeModal from "../UserProfile/Components/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import TradingViewWidget from "@/Pages/CoinDetails/TradingViewWidget";
import OrderBook from "@/Pages/CoinDetails/OrderBook";
import TradeHistory from "@/Pages/CoinDetails/TradeHistory";

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

function CoinDetailsPage() {
  const isLight = useThemeCheck();
  const { coinId } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const ws = useRef(null);

  const { user } = useUserContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { coins: liveCoins } = useCoinContext();

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgCard: isLight ? "bg-white border-gray-300 shadow-xl" : "bg-gray-800/50 backdrop-blur-sm border-gray-700",
    bgItem: isLight ? "bg-gray-100/70 border-gray-300" : "bg-gray-800/30 border-gray-700",
    
    // Header
    coinRankBg: isLight ? "bg-blue-100 text-blue-600 border-blue-300" : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    coinSymbolText: isLight ? "text-blue-600" : "text-cyan-400",
    
    // Holdings Badge
    bgHoldings: isLight ? "bg-green-100 border-green-300 text-green-700" : "bg-green-500/20 border-green-500/30 text-green-400",

    // Live Price Indicator
    bgLive: isLight ? "bg-green-100 border-green-300 text-green-700" : "bg-green-400/10 border-green-400/20 text-green-400",

    // Price Change Colors
    textPositive: isLight ? "text-green-700" : "text-green-400",
    textNegative: isLight ? "text-red-700" : "text-red-400",
    
    // Trade Button
    btnTrade: "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105",

    // Quick Links
    bgLink: isLight ? "bg-gray-100 hover:bg-gray-200 border-gray-300 hover:border-blue-400" : "bg-gray-800 hover:bg-gray-700 border-gray-700 hover:border-cyan-500",
    textLink: isLight ? "text-blue-600 hover:text-blue-500" : "text-cyan-400 hover:text-cyan-300",

    // Skeleton
    bgSkeletonItem: isLight ? "bg-gray-200/50" : "bg-gray-800/50",
    bgSkeletonInner: isLight ? "bg-gray-300" : "bg-gray-700",

    // Stat Icon Colors (Base colors remain similar for consistency, but the text changes)
    statColors: {
      cyan: { text: isLight ? "text-cyan-700" : "text-cyan-400", bg: isLight ? "bg-cyan-100" : "bg-cyan-500/20", border: isLight ? "border-cyan-300" : "border-cyan-500/30" },
      purple: { text: isLight ? "text-purple-700" : "text-purple-400", bg: isLight ? "bg-purple-100" : "bg-purple-500/20", border: isLight ? "border-purple-300" : "border-purple-500/30" },
      green: { text: isLight ? "text-green-700" : "text-green-400", bg: isLight ? "bg-green-100" : "bg-green-500/20", border: isLight ? "border-green-300" : "border-green-500/30" },
      red: { text: isLight ? "text-red-700" : "text-red-400", bg: isLight ? "bg-red-100" : "bg-red-500/20", border: isLight ? "border-red-300" : "border-red-500/30" },
      blue: { text: isLight ? "text-blue-700" : "text-blue-400", bg: isLight ? "bg-blue-100" : "bg-blue-500/20", border: isLight ? "border-blue-300" : "border-blue-500/30" },
      yellow: { text: isLight ? "text-yellow-700" : "text-yellow-400", bg: isLight ? "bg-yellow-100" : "bg-yellow-500/20", border: isLight ? "border-yellow-300" : "border-yellow-500/30" },
    }
  }), [isLight]);


  // Check if user has holdings of this coin
  const userHoldings = useMemo(() => {
    if (!coinId || !purchasedCoins || purchasedCoins.length === 0) return null;
    return purchasedCoins.find(holding => 
      holding.coin_id === coinId || holding.id === coinId
    );
  }, [coinId, purchasedCoins]);

  const hasHoldings = useMemo(() => {
    return userHoldings && (userHoldings.totalQuantity > 0 || userHoldings.quantity > 0);
  }, [userHoldings]);

  // Find the live coin data
  const liveCoin = useMemo(() => {
    return liveCoins.find(c => c.id === coinId);
  }, [liveCoins, coinId]);

  // Get symbol for WebSocket
  const coinSymbol = useMemo(() => {
    const symbolMap = {
      bitcoin: "btcusdt",
      ethereum: "ethusdt",
      binancecoin: "bnbusdt",
      ripple: "xrpusdt",
      cardano: "adausdt",
      solana: "solusdt",
      dogecoin: "dogeusdt",
      polkadot: "dotusdt",
      "matic-network": "maticusdt",
      litecoin: "ltcusdt",
      chainlink: "linkusdt",
      stellar: "xlmusdt",
      cosmos: "atomusdt",
      monero: "xmrusdt",
      "ethereum-classic": "etcusdt",
      "bitcoin-cash": "bchusdt",
      filecoin: "filusdt",
      theta: "thetausdt",
      vechain: "vetusdt",
      tron: "trxusdt"
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

    ws.current.onerror = (error) => {
      console.error('Price WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [coinSymbol]);

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

  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

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

    setTradeModal({
      show: true,
      coin: tradeCoin,
      type: "buy",
    });
  }, [coin, user, liveCoin, livePrice]);

  const toggleWishlist = useCallback(() => {
    setWishlist((prev) => !prev);
  }, []);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "$0";
    const num = Number(value);
    return "$" + num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });
  }, []);

  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "0";
    const num = Number(value);
    return num.toLocaleString('en-US');
  }, []);

  if (loading || !coin) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 fade-in ${isLight ? "bg-gray-50" : "bg-gray-900"}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`${TC.bgSkeletonInner} h-8 w-32 rounded animate-pulse mb-6`}></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className={`h-64 ${TC.bgSkeletonItem} rounded-xl animate-pulse`}></div>
              <div className={`h-96 ${TC.bgSkeletonItem} rounded-xl animate-pulse`}></div>
            </div>
            <div className="space-y-6">
              <div className={`h-96 ${TC.bgSkeletonItem} rounded-xl animate-pulse`}></div>
              <div className={`h-96 ${TC.bgSkeletonItem} rounded-xl animate-pulse`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice = livePrice?.price || coin.market_data?.current_price?.usd || 0;
  const priceChange24h = livePrice?.change24h || coin.market_data?.price_change_percentage_24h || 0;
  const priceChangeColor = priceChange24h >= 0 ? TC.textPositive : TC.textNegative;

  return (
    <>
      <div className={`min-h-screen p-4 sm:p-6 fade-in`}>
        <div className="max-w-7xl mx-auto">


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Coin Header */}
              <div
                className={`${TC.bgCard} rounded-xl p-6 fade-in`}
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={coin.image?.large}
                      alt={coin.name}
                      className={`w-16 h-16 rounded-full border ${isLight ? "border-gray-400" : "border-gray-600"}`}
                    />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h1 className={`text-3xl font-bold ${TC.textPrimary}`}>
                          {coin.name}
                        </h1>
                        <span className={`text-base uppercase px-3 py-1 rounded border ${TC.coinRankBg}`}>
                          {coin.symbol}
                        </span>
                      </div>
                      <p className={`${TC.textSecondary} text-sm`}>
                        Rank #{coin.market_cap_rank || "N/A"}
                      </p>
                      {hasHoldings && (
                        <div className={`text-xs px-2 py-1 rounded-full mt-2 inline-block border ${TC.bgHoldings}`}>
                          🪙 In your portfolio
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={toggleWishlist}
                    className="text-2xl text-yellow-400 hover:scale-110 transition-transform"
                  >
                    {wishlist ? <FaStar /> : <FaRegStar />}
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <h2 className={`text-4xl font-bold ${TC.textPrimary}`}>
                    ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <span className={`text-lg font-semibold ${priceChangeColor} flex items-center gap-1`}>
                    {priceChange24h >= 0 ? <FaArrowUp className="text-sm" /> : <FaArrowDown className="text-sm" />}
                    {priceChange24h >= 0 ? "+" : ""}
                    {priceChange24h.toFixed(2)}%
                  </span>
                  {livePrice && (
                    <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full border ${TC.bgLive}`}>
                      <div className={`w-1.5 h-1.5 ${isLight ? "bg-green-700" : "bg-green-400"} rounded-full`}></div>
                      <span className="font-semibold">Live</span>
                    </div>
                  )}
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    {
                      label: "Market Cap",
                      value: formatCurrency(coin.market_data?.market_cap?.usd),
                      icon: FaChartLine,
                      color: "cyan",
                    },
                    {
                      label: "24h Volume",
                      value: formatCurrency(livePrice?.volume24h || coin.market_data?.total_volume?.usd),
                      icon: FaCoins,
                      color: "purple",
                    },
                    {
                      label: "24h High",
                      value: formatCurrency(livePrice?.high24h || coin.market_data?.high_24h?.usd),
                      icon: FaArrowUp,
                      color: "green",
                    },
                    {
                      label: "24h Low",
                      value: formatCurrency(livePrice?.low24h || coin.market_data?.low_24h?.usd),
                      icon: FaArrowDown,
                      color: "red",
                    },
                    {
                      label: "Circulating Supply",
                      value: `${formatNumber(coin.market_data?.circulating_supply)} ${coin.symbol?.toUpperCase()}`,
                      icon: FaCoins,
                      color: "blue",
                    },
                    {
                      label: "All Time High",
                      value: formatCurrency(coin.market_data?.ath?.usd),
                      icon: FaArrowUp,
                      color: "yellow",
                    },
                  ].map((stat, index) => {
                      const colors = TC.statColors[stat.color] || TC.statColors.cyan;
                      return (
                        <div
                          key={index}
                          className={`flex flex-col gap-2 p-3 rounded-lg border ${TC.bgItem} fade-in`}
                          style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${colors.bg} ${colors.border}`}>
                              <stat.icon className={`text-xs ${colors.text}`} />
                            </div>
                            <span className={`${TC.textSecondary} text-xs`}>{stat.label}</span>
                          </div>
                          <span className={`${TC.textPrimary} font-semibold text-sm`}>{stat.value}</span>
                        </div>
                      );
                  })}
                </div>

                {/* Trade Button */}
                <button
                  onClick={handleTrade}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition-all duration-200 ${TC.btnTrade} flex items-center justify-center gap-2`}
                >
                  <FaExchangeAlt />
                  Trade {coin.symbol?.toUpperCase()}
                </button>
              </div>

              {/* TradingView Chart */}
              <div
                className={`${TC.bgCard} rounded-xl overflow-hidden fade-in`}
                style={{ animationDelay: "0.4s", height: "600px" }}
              >
                <TradingViewWidget symbol={coin.symbol?.toUpperCase() + "USD"} theme={isLight ? 'light' : 'dark'} />
              </div>
            </div>

            {/* Right Column - Order Book & Trade History */}
            <div className="space-y-4">
              {/* Order Book */}
              <div
                className="fade-in"
                style={{ animationDelay: "0.5s", height: "450px" }}
              >
                {/* These external widgets need internal theme handling if possible */}
                <OrderBook symbol={coinSymbol} /> 
              </div>

              {/* Trade History */}
              <div
                className="fade-in"
                style={{ animationDelay: "0.6s", height: "450px" }}
              >
                <TradeHistory symbol={coinSymbol} />
              </div>

              {/* Links - Compact */}
              <div
                className={`${TC.bgCard} rounded-xl p-3 fade-in`}
                style={{ animationDelay: "0.7s" }}
              >
                <h3 className={`text-sm font-semibold mb-2 ${TC.coinSymbolText}`}>
                  Quick Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  {coin.links?.homepage?.[0] && (
                    <a
                      href={coin.links.homepage[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 transition-colors px-2 py-1 rounded text-xs border ${TC.bgLink} ${TC.textLink}`}
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      Website
                    </a>
                  )}
                  {coin.links?.blockchain_site?.[0] && (
                    <a
                      href={coin.links.blockchain_site[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 transition-colors px-2 py-1 rounded text-xs border ${TC.bgLink} ${TC.textLink}`}
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      Explorer
                    </a>
                  )}
                  {coin.links?.official_forum_url?.[0] && (
                    <a
                      href={coin.links.official_forum_url[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 transition-colors px-2 py-1 rounded text-xs border ${TC.bgLink} ${TC.textLink}`}
                    >
                      <FaExternalLinkAlt className="text-xs" />
                      Forum
                    </a>
                  )}
                </div>
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