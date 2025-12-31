import useThemeCheck from '@/hooks/useThemeCheck';
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams, useLocation } from "react-router-dom";
import { getCoinById } from "@/api/coinApis";
import { postForm, getData, deleteWatchList } from "@/api/axiosConfig";
import toast from "react-hot-toast";
import useUserContext from "@/hooks/useUserContext";
import TradeModal from "@/Components/Common/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import useCoinContext from "@/hooks/useCoinContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


import TradingViewWidget from "@/Components/CoinDetails/TradingViewWidget";
import OrderBook from "@/Components/CoinDetails/OrderBook";
import TradeHistory from "@/Components/CoinDetails/TradeHistory";
import CoinHeader from "@/Components/CoinDetails/CoinHeader";
import CoinStats from "@/Components/CoinDetails/CoinStats";
import AdditionalStats from "@/Components/CoinDetails/AdditionalStats";
import QuickLinks from "@/Components/CoinDetails/QuickLinks";

function CoinDetailsPage() {
  const isLight = useThemeCheck();
  const { coinId } = useParams();
  const location = useLocation();
  const passedCoin = location.state?.coin;

  const { user } = useUserContext();
  const { purchasedCoins } = usePurchasedCoins();
  const { coins: liveCoins } = useCoinContext();

  const liveCoin = useMemo(() => {
    if (!Array.isArray(liveCoins)) return null;
    return liveCoins.find((c) => c.id === coinId);
  }, [liveCoins, coinId]);

  const userHoldings = useMemo(() => {
    if (!coinId || !purchasedCoins || !Array.isArray(purchasedCoins)) return null;
    return purchasedCoins.find((holding) => holding.coinId === coinId);
  }, [coinId, purchasedCoins]);

  const [loading, setLoading] = useState(!liveCoin && !passedCoin);
  const [coin, setCoin] = useState(null);

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [widgetsReady, setWidgetsReady] = useState(false);
  const ws = useRef(null);

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",

      // Glassmorphism Cards - Synced with Dashboard Quality
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      bgHeader: isLight
        ? "bg-white/80 backdrop-blur-md shadow-sm border border-gray-100"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border-b border-gray-700/50 isolation-isolate prevent-seam",

      bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",

      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",

      btnPrimary: "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 text-sm font-bold",

      textPositive: isLight ? "text-emerald-600" : "text-emerald-400",
      textNegative: isLight ? "text-rose-600" : "text-rose-400",
    }),
    [isLight]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 10);
    const widgetTimer = setTimeout(() => setWidgetsReady(true), 50);
    return () => {
      clearTimeout(timer);
      clearTimeout(widgetTimer);
    };
  }, []);

  const displayCoin = useMemo(() => {
    if (coin) return coin;

    if (passedCoin) {
      const existingMarket = passedCoin.market_data || {};
      const flatData = passedCoin;

      return {
        ...passedCoin,
        image: typeof passedCoin.image === 'string'
          ? { large: passedCoin.image, small: passedCoin.image, thumb: passedCoin.image }
          : (passedCoin.image || {}),
        market_data: {
          current_price: { usd: existingMarket.current_price?.usd || flatData.current_price || 0 },
          price_change_percentage_24h: existingMarket.price_change_percentage_24h || flatData.price_change_percentage_24h || 0,
          market_cap: { usd: existingMarket.market_cap?.usd || flatData.market_cap || 0 },
          total_volume: { usd: existingMarket.total_volume?.usd || flatData.total_volume || 0 },
          high_24h: { usd: existingMarket.high_24h?.usd || flatData.high_24h || 0 },
          low_24h: { usd: existingMarket.low_24h?.usd || flatData.low_24h || 0 },
          price_change_24h: existingMarket.price_change_24h || flatData.price_change_24h || 0,

          ath: { usd: existingMarket.ath?.usd || flatData.ath || 0 },
          atl: { usd: existingMarket.atl?.usd || flatData.atl || 0 },
          ath_date: { usd: existingMarket.ath_date?.usd || flatData.ath_date || null },
          atl_date: { usd: existingMarket.atl_date?.usd || flatData.atl_date || null },
          circulating_supply: existingMarket.circulating_supply || flatData.circulating_supply || 0,
          total_supply: existingMarket.total_supply || flatData.total_supply || 0,
          max_supply: existingMarket.max_supply || flatData.max_supply || 0,
        }
      }
    }

    if (liveCoin) {
      return {
        ...liveCoin,
        name: liveCoin.name,
        symbol: liveCoin.symbol,
        image: typeof liveCoin.image === 'string'
          ? { large: liveCoin.image, small: liveCoin.image, thumb: liveCoin.image }
          : (liveCoin.image || {}),
        market_data: {
          current_price: { usd: liveCoin.current_price || 0 },
          price_change_percentage_24h: liveCoin.price_change_percentage_24h || 0,
          market_cap: { usd: liveCoin.market_cap || 0 },
          total_volume: { usd: liveCoin.total_volume || 0 },
          high_24h: { usd: liveCoin.high_24h || 0 },
          low_24h: { usd: liveCoin.low_24h || 0 },

          ath: { usd: 0 }, atl: { usd: 0 },
          ath_date: { usd: null }, atl_date: { usd: null },
          circulating_supply: 0, total_supply: 0, max_supply: 0
        }
      }
    }
    return null;
  }, [coin, passedCoin, liveCoin]);


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
    return symbolMap[coinId] || (displayCoin?.symbol ? `${displayCoin.symbol}usdt`.toLowerCase() : null);
  }, [coinId, displayCoin]);


  useEffect(() => {
    if (!coinSymbol) return;

    try {
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
    } catch (e) {
      console.warn("WS Connection failed", e);
    }

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [coinSymbol]);


  const checkWatchlistStatus = useCallback(async () => {
    if (!user?.id || !coinId) return;


    try {
      const res = await getData("/watchlist", { user_id: user.id });

      const list = Array.isArray(res) ? res : (res?.data || res?.watchlist || []);
      const watchlistIds = list.map((item) => item.id || item.coin_id);
      setIsInWatchlist(watchlistIds.includes(coinId));
    } catch (err) {
      console.error("Failed to fetch watchlist status", err);
    }
  }, [user?.id, coinId]);

  useEffect(() => {
    checkWatchlistStatus();
  }, [checkWatchlistStatus]);


  const fetchCoin = useCallback(async () => {


    if (!liveCoin) setLoading(true);

    try {
      const res = await getCoinById(coinId);
      setCoin(res?.data ?? res);
    } catch (err) {
      console.error("Error fetching coin", err);
      if (!liveCoin) setCoin(null);
    } finally {
      setLoading(false);
    }
  }, [coinId, liveCoin]);

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
    if (!user) {
      toast.error("Please login to trade");
      return;
    }

    const tradeCoin = displayCoin || liveCoin;

    if (!tradeCoin) return;

    setTradeModal({ show: true, coin: tradeCoin, type: "buy" });
  }, [displayCoin, user, liveCoin]);


  const toggleWatchlist = useCallback(async () => {
    if (!user?.id) {
      toast.error("Please login to manage watchlist");
      return;
    }

    if (!displayCoin) return;

    const wasInWatchlist = isInWatchlist;


    setIsInWatchlist(!wasInWatchlist);


    if (wasInWatchlist) {
      toast.success("Removed from watchlist");
    } else {
      toast.success("Added to watchlist");
    }

    const coinData = displayCoin;
    const currentP = livePrice?.price || coinData.market_data?.current_price?.usd || coinData.current_price;

    const postData = {
      user_id: user.id,
      id: coinData.id,
      image: coinData.image?.large || coinData.image?.small || coinData.image,
      symbol: coinData.symbol,
      name: coinData.name,
      current_price: currentP,
      price_change_percentage_24h:
        livePrice?.change24h || coinData.market_data?.price_change_percentage_24h || coinData.price_change_percentage_24h,
      market_cap: coinData.market_data?.market_cap?.usd || coinData.market_cap,
      total_volume: livePrice?.volume24h || coinData.market_data?.total_volume?.usd || coinData.total_volume,
      sparkline_in_7d: { price: [] },
    };

    setLoadingWatchlist(true);
    try {
      if (wasInWatchlist) {
        await deleteWatchList("/watchlist/remove", {
          id: coinId,
          user_id: user.id,
        });

      } else {
        await postForm("/watchlist/add", postData);

      }
      await checkWatchlistStatus();
    } catch (err) {
      console.error("Watchlist operation failed:", err);
      setIsInWatchlist(wasInWatchlist);
      toast.error("Operation failed");
    } finally {
      setLoadingWatchlist(false);
    }
  }, [
    isInWatchlist,
    user?.id,
    displayCoin,
    coinId,
    livePrice,
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


  if (loading && !displayCoin) {
    return (
      <div
        className={`min-h-screen ${TC.textPrimary} transition-opacity duration-300 ${isMounted ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          { }
          <div className={`rounded-2xl ${TC.bgCard} p-6 h-[200px]`}>
            <Skeleton height="100%" baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} borderRadius="1rem" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`col-span-2 rounded-2xl ${TC.bgCard} h-[500px] p-6`}>
              <Skeleton height="100%" baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            </div>
            <div className={`col-span-1 rounded-2xl ${TC.bgCard} h-[500px] p-6`}>
              <Skeleton height="100%" baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPrice =
    livePrice?.price || displayCoin?.market_data?.current_price?.usd || 0;
  const priceChange24h =
    livePrice?.change24h || displayCoin?.market_data?.price_change_percentage_24h || 0;
  const isPositive = priceChange24h >= 0;

  return (
    <>
      <div
        className={`min-h-screen ${TC.textPrimary} p-2 sm:p-4 lg:p-6 transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"
          }`}
      >
        { }
        <CoinHeader
          coin={displayCoin}
          currentPrice={currentPrice}
          priceChange24h={priceChange24h}
          isPositive={isPositive}
          isInWatchlist={isInWatchlist}
          loadingWatchlist={loadingWatchlist}
          toggleWatchlist={toggleWatchlist}
          handleTrade={handleTrade}
          isLight={isLight}
          TC={TC}
          userHoldings={userHoldings}
        />

        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 space-y-6">


          { }
          <CoinStats
            coin={displayCoin}
            livePrice={livePrice}
            formatCurrency={formatCurrency}
            TC={TC}
            isLight={isLight}
          />

          { }
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
            { }
            <div className="contents lg:block lg:col-span-8 lg:space-y-6">
              { }
              <div
                className={`order-1 rounded-lg md:rounded-2xl overflow-hidden fade-in h-[400px] md:h-[600px] ${TC.bgCard}`}
                style={{ animationDelay: "0.1s" }}
              >
                {widgetsReady ? (
                  <TradingViewWidget
                    symbol={displayCoin?.symbol?.toUpperCase() + "USDT"}
                    theme={isLight ? "light" : "dark"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton height="100%" width="100%" baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                  </div>
                )}
              </div>

              { }
              <AdditionalStats
                coin={displayCoin}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
                TC={TC}
                isLight={isLight}
              />

              { }
              <QuickLinks coin={displayCoin} TC={TC} isLight={isLight} />
            </div>

            { }
            <div className="contents lg:block lg:col-span-4 lg:space-y-6">
              <div
                className="fade-in order-2 h-[350px] md:h-[450px]"
                style={{ animationDelay: "0.2s" }}
              >
                {widgetsReady ? (
                  <OrderBook symbol={coinSymbol} />
                ) : (
                  <div className={`w-full h-full rounded-2xl p-4 ${TC.bgCard}`}>
                    <Skeleton count={10} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                  </div>
                )}
              </div>
              <div
                className="fade-in order-3 h-[350px] md:h-[450px]"
                style={{ animationDelay: "0.3s" }}
              >
                {widgetsReady ? (
                  <TradeHistory symbol={coinSymbol} />
                ) : (
                  <div className={`w-full h-full rounded-2xl p-4 ${TC.bgCard}`}>
                    <Skeleton count={10} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      { }
      { }
      <TradeModal
        show={tradeModal.show}
        onClose={() => setTradeModal((prev) => ({ ...prev, show: false }))}
        coin={tradeModal.coin || displayCoin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />
    </>
  );
}

export default CoinDetailsPage;