import React from "react";
import { MdDeleteForever } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import Sparkline from "./Sparkline";

const WatchlistMobileCards = ({ coins, TC, isLight, handleCoinClick, handleTrade, setRemoveModal, handleAlertClick }) => {
  return (
    <div className="md:hidden space-y-3 fade-in" style={{ animationDelay: "0.2s" }}>
      {coins.map((coin, index) => (
        <div 
          key={coin.id}
          onClick={() => handleCoinClick(coin)}
          className={`rounded-lg sm:rounded-xl p-3 sm:p-4 ${TC.bgCard} transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98] cursor-pointer group`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
              <div>
                <div className={`font-bold text-sm ${TC.textPrimary}`}>{coin.symbol.toUpperCase()}</div>
                <div className={`text-[10px] ${TC.textSecondary}`}>{coin.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-sm ${TC.textPrimary}`}>
                ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </div>
              <div className={`text-[10px] font-semibold ${
                (coin.price_change_percentage_24h || 0) >= 0 ? "text-green-500" : "text-red-500"
              }`}>
                {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="w-20">
               <Sparkline 
                 data={coin.sparkline_in_7d?.price || []} 
                 width={80} 
                 height={24}
                 positive={(coin.price_change_percentage_24h || 0) >= 0}
               />
            </div>
            <div className="text-right">
               <div className={`text-[10px] ${TC.textSecondary}`}>Market Cap</div>
               <div className={`text-[10px] font-medium ${TC.textPrimary}`}>
                 ${(coin.market_cap / 1e9).toFixed(2)}B
               </div>
            </div>
          </div>

          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
             <button
               onClick={() => handleTrade(coin)}
               className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform hover:scale-105"
             >
               Trade
             </button>
             <button
               onClick={(e) => handleAlertClick(e, coin)}
               className={`px-3 py-1.5 rounded-lg border ${isLight ? "border-yellow-200 text-yellow-600 bg-yellow-50" : "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"} active:scale-95 transition-transform hover:scale-105 shadow-sm`}
             >
               <FaBell className="text-base" />
             </button>
             <button
               onClick={() => setRemoveModal({ show: true, coin })}
               className={`px-3 py-1.5 rounded-lg border ${isLight ? "border-red-200 text-red-600 bg-red-50" : "border-red-500/30 text-red-400 bg-red-500/10"} active:scale-95 transition-transform hover:scale-105 shadow-sm`}
             >
               <MdDeleteForever className="text-base" />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WatchlistMobileCards;
