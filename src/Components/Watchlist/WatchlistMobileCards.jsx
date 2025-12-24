import React from "react";
import { MdDeleteForever } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import Sparkline from "./Sparkline";

const WatchlistMobileCards = ({ coins, TC, isLight, handleCoinClick, handleTrade, setRemoveModal, handleAlertClick }) => {
  return (
    <div className="md:hidden space-y-3 fade-in" style={{ animationDelay: "0.2s" }}>
      {coins.map((coin) => (
        <div
          key={coin.id}
          onClick={() => handleCoinClick(coin)}
          className={`rounded-xl p-4 transition-all duration-300 active:scale-[0.98] cursor-pointer group relative overflow-hidden ${TC.bgCard}`}
        >

          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
              </div>
              <div>
                <div className={`font-bold text-sm tracking-tight ${TC.textPrimary}`}>{coin.symbol.toUpperCase()}</div>
                <div className={`text-[10px] font-medium ${TC.textSecondary}`}>{coin.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-sm tracking-tight ${TC.textPrimary}`}>
                ${coin.current_price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
              </div>
              <div className={`text-[10px] font-bold ${(coin.price_change_percentage_24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                {(coin.price_change_percentage_24h || 0) >= 0 ? "+" : ""}
                {coin.price_change_percentage_24h?.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-20">
              <Sparkline
                data={coin.sparkline_in_7d?.price || []}
                width={80}
                height={24}
                positive={(coin.price_change_percentage_24h || 0) >= 0}
              />
            </div>
            <div className="text-right">
              <div className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60`}>Market Cap</div>
              <div className={`text-[10px] font-bold ${TC.textPrimary}`}>
                ${(coin.market_cap / 1e9).toFixed(2)}B
              </div>
            </div>
          </div>

          <div className="flex gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleTrade(coin)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
            >
              Trade Now
            </button>
            <button
              onClick={(e) => handleAlertClick(e, coin)}
              className={`p-2 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200 text-gray-600" : "bg-white/5 border-white/10 text-gray-400"} hover:text-yellow-500 transition-all active:scale-95`}
            >
              <FaBell className="text-sm" />
            </button>
            <button
              onClick={() => setRemoveModal({ show: true, coin })}
              className={`p-2 rounded-xl border ${isLight ? "bg-gray-50 border-gray-200 text-gray-600" : "bg-white/5 border-white/10 text-gray-400"} hover:text-red-500 transition-all active:scale-95`}
            >
              <MdDeleteForever className="text-sm" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WatchlistMobileCards;
