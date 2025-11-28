import React from "react";
import { MdDeleteForever } from "react-icons/md";
import Sparkline from "./Sparkline";

const WatchlistMobileCards = ({ coins, TC, isLight, handleCoinClick, handleTrade, setRemoveModal }) => {
  return (
    <div className="md:hidden space-y-4 fade-in" style={{ animationDelay: "0.2s" }}>
      {coins.map((coin, index) => (
        <div 
          key={coin.id}
          onClick={() => handleCoinClick(coin)}
          className={`rounded-2xl p-4 border ${TC.bgCard} ${isLight ? "border-gray-200" : "border-gray-700"} active:scale-[0.98] transition-transform`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className={`font-bold ${TC.textPrimary}`}>{coin.symbol.toUpperCase()}</div>
                <div className={`text-xs ${TC.textSecondary}`}>{coin.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold ${TC.textPrimary}`}>
                ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </div>
              <div className={`text-xs font-semibold ${
                (coin.price_change_percentage_24h || 0) >= 0 ? "text-green-500" : "text-red-500"
              }`}>
                {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="w-24">
               <Sparkline 
                 data={coin.sparkline_in_7d?.price || []} 
                 width={96} 
                 height={32}
                 positive={(coin.price_change_percentage_24h || 0) >= 0}
               />
            </div>
            <div className="text-right">
               <div className={`text-xs ${TC.textSecondary}`}>Market Cap</div>
               <div className={`text-xs font-medium ${TC.textPrimary}`}>
                 ${(coin.market_cap / 1e9).toFixed(2)}B
               </div>
            </div>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
             <button
               onClick={() => handleTrade(coin)}
               className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 rounded-xl text-sm font-bold shadow-md active:scale-95 transition-transform hover:scale-105"
             >
               Trade
             </button>
             <button
               onClick={() => setRemoveModal({ show: true, coin })}
               className={`px-4 py-2 rounded-xl border ${isLight ? "border-red-200 text-red-600 bg-red-50" : "border-red-500/30 text-red-400 bg-red-500/10"} active:scale-95 transition-transform hover:scale-105 shadow-sm`}
             >
               <MdDeleteForever className="text-lg" />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WatchlistMobileCards;
