import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { deleteWatchList, getData } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import useCoinContext from "@/hooks/useCoinContext";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import useThemeCheck from "@/hooks/useThemeCheck";

import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import toast from "react-hot-toast";
import TradeModal from "@/Components/Common/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import WatchlistHeader from "../Components/Watchlist/WatchlistHeader";
import WatchlistStats from "../Components/Watchlist/WatchlistStats";
import WatchlistTable from "../Components/Watchlist/WatchlistTable";
import WatchlistMobileCards from "../Components/Watchlist/WatchlistMobileCards";
import WatchlistPagination from "../Components/Watchlist/WatchlistPagination";
import RemoveConfirmationModal from "../Components/Watchlist/RemoveConfirmationModal";

const Watchlist = () => {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { coins: liveCoins } = useCoinContext();
  const { purchasedCoins, refreshPurchasedCoins } = usePurchasedCoins();

  const navigate = useNavigate();
  const { isVisited, markVisited } = useVisitedRoutes();
  const location = useLocation();
  // Freeze validated state on mount
  const [hasVisited] = useState(() => isVisited(location.pathname));

  useEffect(() => {
    markVisited(location.pathname);
  }, [location.pathname, markVisited]);

  const userFromLocalStorage = JSON.parse(
    localStorage.getItem("NEXCHAIN_USER"),
  );
  const userId = user?.id || userFromLocalStorage?.id;

  const [watchlistData, setWatchlistData] = useState(() => {
    try {
      if (userId) {
        const cached = localStorage.getItem(`user_watchlist_cache_${userId}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Optional: Check if cache is fresh (e.g., < 5 mins) if strictly needed,
          // but for "instant" feel we usually just show it and update in background.
          return data || [];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [livePrices, setLivePrices] = useState({});
  // If we have watchlist data, don't show initial full-screen loading
  const [loading, setLoading] = useState(() => watchlistData.length === 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });
  const [removeModal, setRemoveModal] = useState({ show: false, coin: null });
  const [alertModal, setAlertModal] = useState({ show: false, coin: null });

  const handleAlertClick = (e, coin) => {
    e.stopPropagation();
    setAlertModal({ show: true, coin });
  };

  const ws = useRef(null);
  const livePricesRef = useRef({});
  const itemsPerPage = 10;

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
        : "bg-gray-900/95 backdrop-blur-none shadow-none border-b border-gray-800 isolation-isolate prevent-seam",

      bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",

      textPositive: isLight ? "text-emerald-600" : "text-emerald-400",
      textNegative: isLight ? "text-rose-600" : "text-rose-400",

      btnPrimary:
        "bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 text-sm font-bold",

      bgStatsCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    }),
    [isLight],
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 50);
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

        const userHolding = purchasedCoins.find((pc) => pc.coinId === item.id);

        const combinedCoin = {
          ...item,
          ...(liveCoin || {}),
          ...(livePriceData || {}),
          userHolding: userHolding || null,
        };

        if (livePriceData?.current_price) {
          combinedCoin.current_price = livePriceData.current_price;
          combinedCoin.price_change_percentage_24h =
            livePriceData.price_change_percentage_24h;
        }

        return combinedCoin;
      })
      .filter(Boolean);
  }, [watchlistData, liveCoins, livePrices, purchasedCoins]);

  useEffect(() => {
    if (watchlistData.length === 0) return;

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

    const symbols = watchlistData
      .map((coin) =>
        symbolMap[coin.id] ? `${symbolMap[coin.id]}@ticker` : null,
      )
      .filter(Boolean);

    if (symbols.length === 0) return;

    try {
      ws.current = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${symbols.join("/")}`,
      );

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace("@ticker", "");
          const coinId = Object.keys(symbolMap).find(
            (key) => symbolMap[key] === symbol,
          );

          if (coinId) {
            setLivePrices((prev) => ({
              ...prev,
              [coinId]: {
                current_price: parseFloat(message.data.c),
                price_change_percentage_24h: parseFloat(message.data.P),
              },
            }));
          }
        }
      };
    } catch (error) {
      console.error("WebSocket setup failed:", error);
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
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [mergedCoins, searchTerm]);

  const { paginatedCoins, totalPages } = useMemo(() => {
    const totalPages = Math.ceil(filteredCoins.length / itemsPerPage);
    const paginatedCoins = filteredCoins.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
    return { paginatedCoins, totalPages };
  }, [filteredCoins, currentPage]);

  const fetchData = useCallback(
    async (shouldLoad = true) => {
      if (!userId) return;
      // If we already have data, don't show loading (background refresh)
      // Only show loading if we have NO data AND we are explicitly asked to load
      if (watchlistData.length === 0 && shouldLoad) setLoading(true);

      try {
        const res = await getData("/watchlist", { user_id: userId });
        const newData = res || [];
        setWatchlistData(newData);

        // Update Cache
        localStorage.setItem(
          `user_watchlist_cache_${userId}`,
          JSON.stringify({
            data: newData,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        console.error("Failed to fetch watchlist data", err);
        // Only error toast if we don't have cached data looking good
        if (watchlistData.length === 0) {
          toast.error("Failed to fetch watchlist data", {
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
        }
      } finally {
        if (shouldLoad) setLoading(false);
      }
    },
    [userId, watchlistData.length], // dependence on watchlistData.length to know if we should show loading
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemoveConfirm = useCallback(async () => {
    if (!removeModal.coin || !userId) return;

    const coinIdToRemove = removeModal.coin.id;
    setWatchlistData((prev) =>
      prev.filter((item) => item.id !== coinIdToRemove),
    );
    setRemoveModal({ show: false, coin: null });

    try {
      await deleteWatchList("/watchlist/remove", {
        id: coinIdToRemove,
        user_id: userId,
      });
      toast.success("Removed from watchlist!", {
        style: {
          background: "#DCFCE7",
          color: "#166534",
          fontWeight: "600",
          fontSize: "14px",
          padding: "12px 16px",
          borderRadius: "8px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          border: "none",
        },
        iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" },
      });

      fetchData(false);
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      toast.error("Failed to remove coin", {
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

      fetchData(true);
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
    (coin) => {
      navigate(`/coin/coin-details/${coin.id}`);
    },
    [navigate],
  );

  const stats = useMemo(() => {
    const totalValue = mergedCoins.reduce((sum, coin) => {
      const holding = coin.userHolding;
      if (holding) {
        const qty = holding.totalQuantity || holding.quantity || 0;
        return sum + qty * (coin.current_price || 0);
      }
      return sum;
    }, 0);

    const gainers = mergedCoins.filter(
      (c) => (c.price_change_percentage_24h || 0) > 0,
    ).length;
    const losers = mergedCoins.filter(
      (c) => (c.price_change_percentage_24h || 0) < 0,
    ).length;

    return { total: mergedCoins.length, totalValue, gainers, losers };
  }, [mergedCoins]);

  return (
    <>
      <div
        className={`min-h-screen ${TC.textPrimary} p-2 sm:p-4 lg:p-6 ${hasVisited ? "" : `transition-all duration-300 ease-out transform-gpu ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}`}
      >
        <Outlet />

        {/* Sticky Header */}
        <WatchlistHeader
          TC={TC}
          isLight={isLight}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          disableAnimations={hasVisited}
        />

        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 space-y-6">
          <div
            className={
              hasVisited
                ? ""
                : `transition-all duration-300 ease-out delay-[100ms] ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`
            }
          >
            <WatchlistStats
              stats={stats}
              TC={TC}
              isLight={isLight}
              disableAnimations={hasVisited}
            />
          </div>

          <div
            className={
              hasVisited
                ? ""
                : `transition-all duration-300 ease-out delay-[150ms] ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`
            }
          >
            {loading ? (
              <div className={`rounded-2xl overflow-hidden ${TC.bgCard}`}>
                <div className="p-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="mb-4">
                      <Skeleton
                        height={60}
                        baseColor={TC.skeletonBase}
                        highlightColor={TC.skeletonHighlight}
                        borderRadius="0.5rem"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : paginatedCoins.length === 0 ? (
              <div
                className={`text-center py-16 rounded-2xl ${TC.bgCard} fade-in`}
              >
                <div className="text-6xl mb-4">⭐</div>
                <h3 className={`text-xl font-bold mb-2 ${TC.textPrimary}`}>
                  {searchTerm
                    ? `No coins found matching "${searchTerm}"`
                    : "Your watchlist is empty"}
                </h3>
                <p className={TC.textSecondary}>
                  {!searchTerm &&
                    "Add coins to your watchlist to track them here"}
                </p>
              </div>
            ) : (
              <>
                <WatchlistTable
                  coins={paginatedCoins}
                  TC={TC}
                  isLight={isLight}
                  handleCoinClick={handleCoinClick}
                  handleTrade={handleTrade}
                  setRemoveModal={setRemoveModal}
                  handleAlertClick={handleAlertClick}
                  disableAnimations={hasVisited}
                />

                <WatchlistMobileCards
                  coins={paginatedCoins}
                  TC={TC}
                  isLight={isLight}
                  handleCoinClick={handleCoinClick}
                  handleTrade={handleTrade}
                  setRemoveModal={setRemoveModal}
                  handleAlertClick={handleAlertClick}
                  disableAnimations={hasVisited}
                />
              </>
            )}
          </div>

          <div
            className={
              hasVisited
                ? ""
                : `transition-all duration-300 ease-out delay-[200ms] ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`
            }
          >
            <WatchlistPagination
              currentPage={currentPage}
              totalPages={totalPages}
              setCurrentPage={setCurrentPage}
              TC={TC}
              isLight={isLight}
              disableAnimations={hasVisited}
            />
          </div>
        </div>
      </div>

      <PriceAlertModal
        show={alertModal.show}
        onClose={() => setAlertModal({ show: false, coin: null })}
        coin={alertModal.coin}
      />

      <RemoveConfirmationModal
        show={removeModal.show}
        onClose={() => setRemoveModal({ show: false, coin: null })}
        onConfirm={handleRemoveConfirm}
        coin={removeModal.coin}
        isLight={isLight}
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
