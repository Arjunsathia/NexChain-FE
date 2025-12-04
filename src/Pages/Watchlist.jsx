import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { deleteWatchList, getData } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import useCoinContext from "@/Context/CoinContext/useCoinContext";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import TradeModal from "@/Components/Common/TradeModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Components
import WatchlistHeader from "../Components/Watchlist/WatchlistHeader";
import WatchlistStats from "../Components/Watchlist/WatchlistStats";
import WatchlistTable from "../Components/Watchlist/WatchlistTable";
import WatchlistMobileCards from "../Components/Watchlist/WatchlistMobileCards";
import WatchlistPagination from "../Components/Watchlist/WatchlistPagination";
import RemoveConfirmationModal from "../Components/Watchlist/RemoveConfirmationModal";

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

      fetchData();
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
        <WatchlistHeader 
          TC={TC} 
          isLight={isLight} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />

        <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 space-y-6">
          {/* Stats Grid */}
          <WatchlistStats stats={stats} TC={TC} isLight={isLight} />

          {/* Coins Table / Loading / Empty State */}
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
              {/* Desktop Table */}
              <WatchlistTable 
                coins={paginatedCoins} 
                TC={TC} 
                isLight={isLight} 
                handleCoinClick={handleCoinClick} 
                handleTrade={handleTrade} 
                setRemoveModal={setRemoveModal} 
              />

              {/* Mobile Card View */}
              <WatchlistMobileCards 
                coins={paginatedCoins} 
                TC={TC} 
                isLight={isLight} 
                handleCoinClick={handleCoinClick} 
                handleTrade={handleTrade} 
                setRemoveModal={setRemoveModal} 
              />
            </>
          )}

          {/* Pagination */}
          <WatchlistPagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            setCurrentPage={setCurrentPage} 
            TC={TC} 
            isLight={isLight} 
          />
        </div>
      </main>

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