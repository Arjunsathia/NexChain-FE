import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useEffect, useState, useRef, useMemo } from "react";
import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaFire, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function TrendingCoins() {
  const isLight = useThemeCheck();
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [livePrices, setLivePrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const ws = useRef(null);
  const bufferRef = useRef({});

  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  
  const TC = useMemo(() => ({
    bgContainer: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl border border-gray-700/50",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    
    
    bgItem: isLight 
      ? "hover:bg-blue-50/50 border-b border-gray-100 last:border-0" 
      : "hover:bg-white/5 border-b border-gray-700/50 last:border-0",
    
    
    textPricePositive: isLight ? "text-green-600" : "text-green-400",
    textPriceNegative: isLight ? "text-red-600" : "text-red-400",
    
    bgIcon: isLight ? "bg-orange-100/50 text-orange-600" : "bg-orange-500/10 text-orange-400",
    bgEmpty: isLight ? "bg-gray-50" : "bg-gray-800/30",
    
    skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
    skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
  }), [isLight]);

  const fetchTrending = async () => {
    try {
      setError(false);
      setLoading(true);
      const trendData = await getTrend();
      let idsArray = [];
      if (trendData && Array.isArray(trendData.coins)) {
          idsArray = trendData.coins.map((coin) => coin.item.id);
      } else {
          
          throw new Error("Invalid trend data format");
      }
      
      
      const marketData = await getTrendingCoinMarketData(idsArray.slice(0, 10)); 
      setTrendingCoins(marketData);
    } catch (err) {
      console.warn("Trending Coins API failed, using fallback:", err.message);
      try {
        const fallbackIds = ["bitcoin", "ethereum", "binancecoin", "ripple", "solana", "cardano", "polkadot"];
        const marketData = await getTrendingCoinMarketData(fallbackIds);
        setTrendingCoins(marketData);
      } catch (fallbackErr) {
        console.error("Fallback Trending Error:", fallbackErr.message);
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    if (trendingCoins.length === 0) return;

    const symbols = trendingCoins
      .map((coin) => {
        const symbolMap = {
          bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt",
          cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt",
          "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt",
          stellar: "xlmusdt", cosmos: "atomusdt", monero: "xmusdt", "ethereum-classic": "etcusdt",
          "bitcoin-cash": "bchusdt", filecoin: "filusdt", theta: "thetausdt", vechain: "vetusdt",
          tron: "trxusdt",
        };
        return symbolMap[coin.id] ? `${symbolMap[coin.id]}@ticker` : null;
      })
      .filter(Boolean);

    if (symbols.length === 0) return;
    const streams = symbols.join("/");

    
    const interval = setInterval(() => {
        if (Object.keys(bufferRef.current).length > 0) {
            setLivePrices(prev => ({ ...prev, ...bufferRef.current }));
            bufferRef.current = {};
        }
    }, 2000);

    try {
      ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
          const symbol = message.stream.replace("@ticker", "");
          const coinData = message.data;
          
          
           const symbolToCoinId = {
            btcusdt: "bitcoin", ethusdt: "ethereum", bnbusdt: "binancecoin", xrpusdt: "ripple",
            adausdt: "cardano", solusdt: "solana", dogeusdt: "dogecoin", dotusdt: "polkadot",
            maticusdt: "matic-network", ltcusdt: "litecoin", linkusdt: "chainlink", xlmusdt: "stellar",
            atomusdt: "cosmos", xmusdt: "monero", etcusdt: "ethereum-classic", bchusdt: "bitcoin-cash",
            filusdt: "filecoin", thetausdt: "theta", vetusdt: "vechain", trxusdt: "tron",
          };

          const coinId = symbolToCoinId[symbol];
          if (coinId) {
             bufferRef.current[coinId] = {
                current_price: parseFloat(coinData.c),
                price_change_percentage_24h: parseFloat(coinData.P),
                price_change_24h: parseFloat(coinData.p),
             };
          }
        }
      };
    } catch (error) {
      console.error("Trending WS error:", error);
    }

    return () => {
      clearInterval(interval);
      if (ws.current) ws.current.close();
    };
  }, [trendingCoins]);

  const coinsWithLiveData = useMemo(() => 
      trendingCoins.map((coin) => {
        const livePriceData = livePrices[coin.id];
        return {
          ...coin,
          current_price: livePriceData?.current_price ?? coin.current_price,
          price_change_percentage_24h: livePriceData?.price_change_percentage_24h ?? coin.price_change_percentage_24h,
        };
      }),
    [trendingCoins, livePrices]
  );
  
  
  const displayedCoins = coinsWithLiveData; 

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
      {}
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
           <FaFire className="text-orange-500" />
           Trending
        </h3>
        {}
      </div>

      {}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-hide max-h-[240px] md:max-h-full">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
             <div className={`p-2 rounded-full mb-2 bg-yellow-100 text-yellow-600`}>
                <FaExclamationTriangle />
             </div>
             <p className={`text-xs ${TC.textSecondary}`}>Error loading</p>
             <button onClick={() => fetchTrending()} className="text-[10px] text-blue-500 mt-1 hover:underline">Retry</button>
          </div>
        ) : displayedCoins.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-center opacity-60 rounded-lg ${TC.bgEmpty}`}>
             <div className={`p-3 rounded-full mb-2 ${isLight ? "bg-white" : "bg-gray-700"}`}>
                <FaFire className={TC.textSecondary} />
             </div>
             <p className={`text-xs ${TC.textSecondary}`}>No trending data</p>
          </div>
        ) : (
          displayedCoins.map((coin, index) => (
             <div 
               key={coin.id}
               onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
               className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer group ${TC.bgItem}`}
             >
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="absolute -top-1 -left-1 w-3.5 h-3.5 bg-gray-900 text-white text-[9px] rounded-full flex items-center justify-center border border-white dark:border-gray-800">
                        {index + 1}
                      </div>
                   </div>
                   <div>
                      <p className={`text-xs font-bold ${TC.textPrimary}`}>{coin.symbol?.toUpperCase()}</p>
                      <p className={`text-[10px] ${TC.textSecondary} truncate max-w-[80px]`}>{coin.name}</p>
                   </div>
                </div>

                <div className="text-right">
                   <p className={`text-xs font-bold ${TC.textPrimary}`}>
                      ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
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

       {}
       <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-center">
          <button onClick={() => navigate("/cryptolist")} className={`text-[10px] font-medium flex items-center justify-center gap-1 mx-auto transition-colors ${TC.textSecondary} hover:text-blue-500`}>
             View All <FaArrowRight size={8} />
          </button>
       </div>
       <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default TrendingCoins;
