import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useMemo, useState, useEffect, useRef } from "react";
import { FaChartLine, FaCoins, FaArrowRight, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLivePortfolio } from "@/hooks/useLivePortfolio";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function PortfolioCard() {
  const isLight = useThemeCheck();
  const { groupedHoldings, loading: portfolioLoading } = useLivePortfolio();
  const navigate = useNavigate();

  const [livePrices, setLivePrices] = useState({});
  const ws = useRef(null);
  
  // Fade-in mount effect
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 💡 Styles (Matching RecentTradesCard)
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
    
    // P&L Colors
    textProfit: isLight ? "text-green-600" : "text-green-400",
    textLoss: isLight ? "text-red-600" : "text-red-400",
    
    bgIcon: isLight ? "bg-cyan-100 text-cyan-600" : "bg-cyan-500/20 text-cyan-400",
    bgEmpty: isLight ? "bg-gray-50" : "bg-gray-800/30",
  }), [isLight]);

  // WebSocket setup (Simplified for brevity, assuming mostly working)
  useEffect(() => {
    if (groupedHoldings.length === 0) return;
    const symbolMap = {
      bitcoin: "btcusdt", ethereum: "ethusdt", binancecoin: "bnbusdt", ripple: "xrpusdt",
      cardano: "adausdt", solana: "solusdt", dogecoin: "dogeusdt", polkadot: "dotusdt",
      "matic-network": "maticusdt", litecoin: "ltcusdt", chainlink: "linkusdt",
      stellar: "xlmusdt", cosmos: "atomusdt", monero: "xmusdt", "ethereum-classic": "etcusdt",
      "bitcoin-cash": "bchusdt", filecoin: "filusdt", theta: "thetausdt", vechain: "vetusdt",
      tron: "trxusdt",
    };

    const symbols = groupedHoldings
      .map(c => symbolMap[c.coinId] ? `${symbolMap[c.coinId]}@ticker` : null)
      .filter(Boolean);

    if (symbols.length === 0) return;
    const streams = symbols.join("/");

    ws.current = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
    ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.stream && message.data) {
            const symbol = message.stream.replace("@ticker", "");
            const coinId = Object.keys(symbolMap).find(key => symbolMap[key] === symbol);
            if(coinId) {
                setLivePrices(prev => ({
                    ...prev,
                    [coinId]: {
                        current_price: parseFloat(message.data.c),
                        price_change_percentage_24h: parseFloat(message.data.P)
                    }
                }));
            }
        }
    };
    return () => ws.current?.close();
  }, [groupedHoldings]);

  // Merge Live Data
  const allCoins = useMemo(() => {
    // 🛡️ Safety Guard
    if (!Array.isArray(groupedHoldings)) return [];

    return groupedHoldings.map((coin) => {
      const liveData = livePrices[coin.coinId];
      const currentPrice = liveData ? liveData.current_price : (coin.currentPrice || 0);
      const currentValue = (coin.totalQuantity || 0) * currentPrice;
      const profitLoss = currentValue - (coin.remainingInvestment || 0);
      return { ...coin, currentPrice, currentValue, profitLoss, percentChange: liveData?.price_change_percentage_24h };
    }).sort((a,b) => b.currentValue - a.currentValue);
  }, [groupedHoldings, livePrices]);

  const totalValue = allCoins.reduce((sum, c) => sum + c.currentValue, 0);

  if (portfolioLoading) {
     return (
        <div className={`p-4 rounded-xl h-full flex flex-col ${TC.bgContainer}`}>
             <div className="flex items-center gap-2 mb-3">
                <Skeleton circle width={24} height={24} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
                <Skeleton width={100} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
             </div>
             <div className="space-y-2">
                <Skeleton height={50} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
                <Skeleton height={50} baseColor={isLight ? "#e5e7eb" : "#2c303a"} highlightColor={isLight ? "#f3f4f6" : "#3a3f4b"} />
             </div>
        </div>
     );
  }

  return (
    <div className={`p-1 rounded-xl h-full flex flex-col fade-in ${TC.bgContainer} ${isMounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
           <FaChartLine className="text-blue-500" />
           Holdings
        </h3>
        <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${isLight ? "bg-gray-100 border-gray-200 text-gray-700" : "bg-gray-700 border-gray-600 text-gray-300"}`}>
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-hide max-h-[240px] md:max-h-full">
        {allCoins.length === 0 ? (
          <div className={`h-full flex flex-col items-center justify-center text-center opacity-60 rounded-lg ${TC.bgEmpty}`}>
             <div className={`p-3 rounded-full mb-2 ${isLight ? "bg-white" : "bg-gray-700"}`}>
                <FaCoins />
             </div>
             <p className={`text-xs ${TC.textSecondary}`}>No coins yet</p>
             <button onClick={() => navigate('/cryptolist')} className="text-[10px] text-blue-500 mt-2 hover:underline">Buy Crypto</button>
          </div>
        ) : (
          allCoins.map((coin, i) => (
             <div 
               key={coin.coinId || i}
               onClick={() => navigate("/portfolio")}
               className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer group ${TC.bgItem}`}
             >
                <div className="flex items-center gap-3">
                   {coin.image ? (
                     <img src={coin.image} alt={coin.coinName} className="w-8 h-8 rounded-lg object-cover" />
                   ) : (
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${TC.bgIcon}`}>
                        {coin.coinSymbol?.substring(0,2).toUpperCase()}
                     </div>
                   )}
                   <div>
                      <p className={`text-xs font-bold ${TC.textPrimary}`}>{coin.coinSymbol?.toUpperCase()}</p>
                      <p className={`text-[10px] ${TC.textSecondary}`}>{coin.totalQuantity?.toFixed(4)} qty</p>
                   </div>
                </div>

                <div className="text-right">
                   <p className={`text-xs font-bold ${TC.textPrimary}`}>${coin.currentValue?.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                   <p className={`text-[10px] flex items-center justify-end gap-1 ${coin.profitLoss >= 0 ? TC.textProfit : TC.textLoss}`}>
                      {coin.profitLoss >= 0 ? "+" : ""}{coin.profitLoss?.toLocaleString(undefined, {maximumFractionDigits: 0})}
                      {coin.percentChange && <span className="opacity-70">({coin.percentChange > 0 ? "+" : ""}{coin.percentChange.toFixed(1)}%)</span>}
                   </p>
                </div>
             </div>
          ))
        )}
      </div>
      
      {/* Minimal Footer Link */}
      {allCoins.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-center">
             <button onClick={() => navigate("/portfolio")} className={`text-[10px] font-medium flex items-center justify-center gap-1 mx-auto transition-colors ${TC.textSecondary} hover:text-blue-500`}>
                View Stats <FaArrowRight size={8} />
             </button>
          </div>
      )}
    </div>
  );
}

export default PortfolioCard;
