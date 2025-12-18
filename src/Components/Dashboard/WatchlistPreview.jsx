import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useEffect, useState, useRef, useMemo } from "react";
import { getData } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { FaStar, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";

function WatchlistPreview() {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const userId = user?.id;
  const [watchlistData, setWatchlistData] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const ws = useRef(null);
  const livePricesRef = useRef({});

  // 🔁 Fade-in mount effect
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 💡 Minimal Styles (Matching RecentTradesCard)
  const TC = useMemo(() => ({
    bgContainer: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl border border-gray-700/50",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    
    // Items
    bgItem: isLight 
      ? "hover:bg-blue-50/50 border-b border-gray-100 last:border-0" 
      : "hover:bg-white/5 border-b border-gray-700/50 last:border-0",
    
    // Values
    textPricePositive: isLight ? "text-green-600" : "text-green-400",
    textPriceNegative: isLight ? "text-red-600" : "text-red-400",
    
    bgIcon: isLight ? "bg-cyan-100/50 text-cyan-600" : "bg-cyan-500/10 text-cyan-400",
    bgEmpty: isLight ? "bg-gray-50" : "bg-gray-800/30",
    
    skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
    skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
  }), [isLight]);

  useEffect(() => {
    livePricesRef.current = livePrices;
  }, [livePrices]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getData("/watchlist", { user_id: userId });
        // Handle various response formats (array, { data: [] }, { watchlist: [] })
        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && Array.isArray(res.watchlist)) {
            list = res.watchlist;
        }
        setWatchlistData(list);
      } catch (err) {
        console.error("Failed to fetch watchlist preview:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchWatchlist();
  }, [userId]);

  useEffect(() => {
    if (watchlistData.length === 0) return;

    const symbols = watchlistData
      .map((coin) => {
        const symbolMap = {
          bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt",
          cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt",
          "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt",
          stellar: "xlmusdt", cosmos: "atomusdt", monero: "xmusdt", "ethereum-classic": "etcusdt",
          "bitcoin-cash": "bchusdt", filecoin: "filusdt", theta: "thetausdt", vechain: "vetusdt",
          trxusdt: "trxusdt",
        };
        return symbolMap[coin.id] ? `${symbolMap[coin.id]}@ticker` : null;
      })
      .filter(Boolean);

    if (symbols.length === 0) return;
    const streams = symbols.join("/");

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace("@ticker", "");
          const coinData = message.data;
          // Simple reverse map match
          const coinId = watchlistData.find(c => {
             // simplified check for demo, ideally robust map again
             const sMap = { bitcoin: "btcusdt", ethereum: "ethusdt" }; // reduced for brevity in logic
             return true; // We rely on stored data logic usually, but here just updating what we can
          })?.id; 
          
          // Better logic: iterate known map again or just update by finding matching symbol in map
          // To save space, standard implementation:
          const symbolToCoinId = {
            btcusdt: "bitcoin", ethusdt: "ethereum", bnbusdt: "binancecoin", xrpusdt: "ripple",
            adausdt: "cardano", solusdt: "solana", dogeusdt: "dogecoin", dotusdt: "polkadot",
            maticusdt: "matic-network", ltcusdt: "litecoin", linkusdt: "chainlink", xlmusdt: "stellar",
            atomusdt: "cosmos", xmusdt: "monero", etcusdt: "ethereum-classic", bchusdt: "bitcoin-cash",
            filusdt: "filecoin", thetausdt: "theta", vetusdt: "vechain", trxusdt: "tron",
          };
          const foundId = symbolToCoinId[symbol];
          
          if (foundId) {
            setLivePrices((prev) => ({
              ...prev,
              [foundId]: {
                current_price: parseFloat(coinData.c),
                price_change_percentage_24h: parseFloat(coinData.P),
                price_change_24h: parseFloat(coinData.p),
              },
            }));
          }
        }
      };
    } catch (err) {
      console.error("WS error:", err);
    }
    return () => { if (ws.current) ws.current.close(); };
  }, [watchlistData]);

  // Merge Live Coins
  const mergedCoins = useMemo(() => {
    if (!Array.isArray(watchlistData)) return [];
    
    return watchlistData.map((coin) => ({
      ...coin,
      ...(livePrices[coin.id] || {}),
    })).filter(Boolean);
  }, [watchlistData, livePrices]);

  if (loading) {
     return (
        <div className={`p-4 rounded-xl h-full flex flex-col ${TC.bgContainer}`}>
             <div className="flex items-center gap-2 mb-3">
                <Skeleton circle width={24} height={24} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                <Skeleton width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
             </div>
             <div className="space-y-2">
                <Skeleton height={40} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                <Skeleton height={40} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
             </div>
        </div>
     );
  }

  return (
    <div className={`p-1 rounded-xl h-full flex flex-col fade-in ${TC.bgContainer} ${isMounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
           <FaStar className="text-cyan-500" />
           Watchlist
        </h3>
        {mergedCoins.length > 0 && (
            <span className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border ${isLight ? "border-gray-200" : "border-gray-700"}`}>
                {mergedCoins.length} {mergedCoins.length === 1 ? 'Coin' : 'Coins'}
            </span>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-hide">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
             <div className={`p-2 rounded-full mb-2 bg-yellow-100 text-yellow-600`}>
                <FaExclamationTriangle />
             </div>
             <p className={`text-xs ${TC.textSecondary}`}>Error loading</p>
             <button onClick={() => window.location.reload()} className="text-[10px] text-blue-500 mt-1 hover:underline">Retry</button>
          </div>
        ) : mergedCoins.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-center opacity-60 rounded-lg ${TC.bgEmpty}`}>
             <div className={`p-3 rounded-full mb-2 ${isLight ? "bg-white" : "bg-gray-700"}`}>
                <FaStar className={TC.textSecondary} />
             </div>
             <p className={`text-xs ${TC.textSecondary}`}>Watchlist is empty</p>
             <button onClick={() => navigate('/cryptolist')} className="text-[10px] text-blue-500 mt-2 hover:underline">Add Coins</button>
          </div>
        ) : (
          mergedCoins.map((coin) => (
             <div 
               key={coin.id}
               onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
               className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer group ${TC.bgItem}`}
             >
                <div className="flex items-center gap-3">
                   {coin.image ? (
                     <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-lg object-cover" />
                   ) : (
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${TC.bgIcon}`}>
                        {coin.symbol?.substring(0,2).toUpperCase()}
                     </div>
                   )}
                   <div>
                      <p className={`text-xs font-bold ${TC.textPrimary}`}>{coin.symbol?.toUpperCase()}</p>
                      <p className={`text-[10px] ${TC.textSecondary} truncate max-w-[80px]`}>{coin.name}</p>
                   </div>
                </div>

                <div className="text-right">
                   <p className={`text-xs font-bold ${TC.textPrimary}`}>
                      ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </p>
                   <p className={`text-[10px] ${coin.price_change_percentage_24h >= 0 ? TC.textPricePositive : TC.textPriceNegative}`}>
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h?.toFixed(1)}%
                   </p>
                </div>
             </div>
          ))
        )}
      </div>

       {/* Minimal Footer Link */}
      {mergedCoins.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-center">
             <button onClick={() => navigate("/watchlist")} className={`text-[10px] font-medium flex items-center justify-center gap-1 mx-auto transition-colors ${TC.textSecondary} hover:text-blue-500`}>
                View All <FaArrowRight size={8} />
             </button>
          </div>
      )}
    </div>
  );
}

export default WatchlistPreview;
