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
import toast from "react-hot-toast";
import useUserContext from "@/Context/UserContext/useUserContext";
import TradeModal from "@/Components/Common/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Extracted Components
import TradingViewWidget from "@/Components/CoinDetails/TradingViewWidget";
import OrderBook from "@/Components/CoinDetails/OrderBook";
import TradeHistory from "@/Components/CoinDetails/TradeHistory";
import CoinHeader from "@/Components/CoinDetails/CoinHeader";
import CoinStats from "@/Components/CoinDetails/CoinStats";
import AdditionalStats from "@/Components/CoinDetails/AdditionalStats";
import QuickLinks from "@/Components/CoinDetails/QuickLinks";
import HoldingsBadge from "@/Components/CoinDetails/HoldingsBadge";

// Utility to check if light mode is active
const useThemeCheck = () => {
  const [isLight, setIsLight] = useState(
    !document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(!document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
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
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      bgCard: isLight
        ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none"
        : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
      bgHeader: isLight
        ? "bg-white/80 backdrop-blur-xl shadow-lg border-none"
        : "bg-gray-900/80 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    }),
    [isLight]
  );

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if user has holdings
  const userHoldings = useMemo(() => {
    if (!coinId || !purchasedCoins || purchasedCoins.length === 0) return null;
    return purchasedCoins.find((holding) => holding.coinId === coinId);
  }, [coinId, purchasedCoins]);

  const hasHoldings = useMemo(() => {
    return (
      userHoldings && (userHoldings.totalQuantity > 0 || userHoldings.quantity > 0)
    );
  }, [userHoldings]);

  // Find live coin data
  const liveCoin = useMemo(() => {
    return liveCoins.find((c) => c.id === coinId);
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
      const watchlistIds = (res || []).map((item) => item.id || item.coin_id);
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
      id: coin.id,
    };

    setTradeModal({ show: true, coin: tradeCoin, type: "buy" });
  }, [coin, user, liveCoin, livePrice]);

  // Watchlist toggle with backend integration
  const toggleWatchlist = useCallback(async () => {
    if (!user?.id) {
      toast.error("Please login to manage watchlist", {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
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
      price_change_percentage_24h:
        livePrice?.change24h || coin.market_data?.price_change_percentage_24h,
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
          style: {
            background: "#DCFCE7", // Light green
            color: "#166534", // Dark green
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            border: "none",
          },
          iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
        });

      } else {
        // Add to watchlist
        await postForm("/watchlist/add", postData);
        toast.success("Added to watchlist!", {
          style: {
            background: "#FEFCE8", // Light yellow/gold
            color: "#854D0E", // Dark gold/brown
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            border: "none",
          },
          iconTheme: {
            primary: "#EAB308", // Gold icon
            secondary: "#FFFFFF",
          },
        });
      }
      // Refresh watchlist status
      await checkWatchlistStatus();
    } catch (err) {
      console.error("Watchlist operation failed:", err);
      // Revert optimistic update on error
      setIsInWatchlist(wasInWatchlist);
      toast.error("Operation failed. Please try again.", {
        style: {
          background: "#FEE2E2",
          color: "#991B1B",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          borderRadius: "8px",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          border: "none",
        },
        iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" },
      });
    } finally {
      setLoadingWatchlist(false);
    }
  }, [
    isInWatchlist,
    user?.id,
    coin,
    coinId,
    livePrice,
    isLight,
    checkWatchlistStatus,
  ]);

  const formatCurrency = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "$0";
    const num = Number(value);
    return (
      "$" +
      num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: num < 1 ? 6 : 2,
      })
    );
  }, []);

  const formatNumber = useCallback((value) => {
    if (value === null || value === undefined || isNaN(Number(value)))
      return "0";
    return Number(value).toLocaleString("en-US");
  }, []);

  if (loading || !coin) {
    return (
      <div
        className={`min-h-screen ${TC.textPrimary} transition-opacity duration-500 ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`rounded-2xl ${TC.bgCard} p-6`}>
              <Skeleton
                height={200}
                baseColor={TC.skeletonBase}
                highlightColor={TC.skeletonHighlight}
                borderRadius="1rem"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentPrice =
    livePrice?.price || coin.market_data?.current_price?.usd || 0;
  const priceChange24h =
    livePrice?.change24h || coin.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange24h >= 0;

  return (
    <>
      <div
        className={`min-h-screen ${TC.textPrimary} p-2 sm:p-4 lg:p-6 transition-opacity duration-500 ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Sticky Header */}
        <CoinHeader
          coin={coin}
          currentPrice={currentPrice}
          priceChange24h={priceChange24h}
          isPositive={isPositive}
          isInWatchlist={isInWatchlist}
          loadingWatchlist={loadingWatchlist}
          toggleWatchlist={toggleWatchlist}
          handleTrade={handleTrade}
          isLight={isLight}
          TC={TC}
        />

        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 space-y-6">
          {/* Holdings Badge */}
          <HoldingsBadge
            hasHoldings={hasHoldings}
            userHoldings={userHoldings}
            coin={coin}
            isLight={isLight}
          />

          {/* Stats Grid */}
          <CoinStats
            coin={coin}
            livePrice={livePrice}
            formatCurrency={formatCurrency}
            TC={TC}
            isLight={isLight}
          />

          {/* Main Content Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
            {/* Left Column - Chart */}
            <div className="contents lg:block lg:col-span-8 lg:space-y-6">
              {/* TradingView Chart */}
              <div
                className={`order-1 rounded-2xl overflow-hidden fade-in h-[400px] md:h-[600px] ${TC.bgCard}`}
                style={{ animationDelay: "0.3s" }}
              >
                <TradingViewWidget
                  symbol={coin.symbol?.toUpperCase() + "USDT"}
                  theme={isLight ? "light" : "dark"}
                />
              </div>

              {/* Additional Stats */}
              <AdditionalStats
                coin={coin}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
                TC={TC}
                isLight={isLight}
              />

              {/* Quick Links */}
              <QuickLinks coin={coin} TC={TC} isLight={isLight} />
            </div>

            {/* Right Column - Order Book & Trade History */}
            <div className="contents lg:block lg:col-span-4 lg:space-y-6">
              <div
                className="fade-in order-2 h-[350px] md:h-[450px]"
                style={{ animationDelay: "0.6s" }}
              >
                <OrderBook symbol={coinSymbol} />
              </div>
              <div
                className="fade-in order-3 h-[350px] md:h-[450px]"
                style={{ animationDelay: "0.7s" }}
              >
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