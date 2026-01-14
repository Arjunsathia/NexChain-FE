import React from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import SimpleSparkline from "./SimpleSparkline";

function MarketCoinDetailsModal({
  selectedCoin,
  setSelectedCoin,
  TC,
  isLight,
  formatCurrency,
  formatCompactNumber,
}) {
  if (!selectedCoin) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[2005] flex items-center justify-center p-4 ${TC.modalOverlay}`}
    >
      <div
        className={`w-full max-w-[450px] sm:max-w-2xl rounded-3xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300 shadow-2xl border ${isLight ? "border-gray-100" : "border-gray-800"}`}
      >
        <div
          className={`px-4 py-4 sm:px-8 sm:py-6 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b ${isLight ? "border-gray-100" : "border-gray-800"}`}
        >
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
              <img
                src={selectedCoin.image}
                alt={selectedCoin.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-lg object-contain"
              />
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${TC.textPrimary}`}>
                {selectedCoin.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  {selectedCoin.symbol}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${selectedCoin.price_change_percentage_24h >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  {selectedCoin.price_change_percentage_24h >= 0 ? "+" : ""}{selectedCoin.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedCoin(null)}
            className={`transition-all duration-300 p-2 rounded-xl hover:rotate-90 transform group ${isLight
                ? "bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/20"
              }`}
          >
            <FaTimes className="text-base group-hover:scale-110" />
          </button>
        </div>
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className={`p-4 rounded-2xl ${TC.bgItem} group hover:scale-[1.02] transition-transform duration-300`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1.5 ${TC.textSecondary}`}
              >
                Current Price
              </p>
              <p className={`text-sm sm:text-lg font-black ${TC.textPrimary}`}>
                {formatCurrency(selectedCoin.current_price)}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${TC.bgItem} group hover:scale-[1.02] transition-transform duration-300`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1.5 ${TC.textSecondary}`}
              >
                Market Cap
              </p>
              <p className={`text-sm sm:text-lg font-black ${TC.textPrimary}`}>
                {formatCompactNumber(selectedCoin.market_cap)}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${TC.bgItem} group hover:scale-[1.02] transition-transform duration-300`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1.5 ${TC.textSecondary}`}
              >
                24h High
              </p>
              <p className="text-sm sm:text-lg font-black text-emerald-500">
                {formatCurrency(selectedCoin.high_24h)}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${TC.bgItem} group hover:scale-[1.02] transition-transform duration-300`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1.5 ${TC.textSecondary}`}
              >
                24h Low
              </p>
              <p className="text-sm sm:text-lg font-black text-rose-500">
                {formatCurrency(selectedCoin.low_24h)}
              </p>
            </div>
          </div>

          <div className={`p-4 sm:p-6 rounded-2xl ${TC.bgItem} bg-gradient-to-br from-transparent to-cyan-500/5 border border-white/5`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3
                className={`text-sm sm:text-lg font-bold ${TC.textPrimary}`}
              >
                Price Performance (7d)
              </h3>
              <div className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                Live Sparkline
              </div>
            </div>
            <div className="h-28 sm:h-36 w-full flex items-center justify-center">
              <SimpleSparkline
                data={selectedCoin.sparkline_in_7d.price}
                color="#06b6d4"
                width={500}
                height={120}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className={`p-4 rounded-2xl ${TC.bgItem} group hover:scale-[1.02] transition-transform duration-300`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1.5 ${TC.textSecondary}`}
              >
                All Time High
              </p>
              <p className={`text-sm sm:text-lg font-black ${TC.textPrimary}`}>
                {formatCurrency(selectedCoin.ath)}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500`}>
                  {selectedCoin.ath_change_percentage.toFixed(2)}%
                </span>
                <span className={`text-[10px] ${TC.textSecondary}`}>from ATH</span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${TC.bgItem} group hover:scale-[1.02] transition-transform duration-300`}>
              <p
                className={`text-[10px] sm:text-xs uppercase font-bold tracking-widest mb-1.5 ${TC.textSecondary}`}
              >
                Circulating Supply
              </p>
              <p className={`text-sm sm:text-lg font-black ${TC.textPrimary}`}>
                {formatCompactNumber(selectedCoin.circulating_supply)}
              </p>
              <p className={`text-[10px] font-bold ${TC.textSecondary} mt-1 uppercase tracking-tight`}>
                {selectedCoin.symbol} Tokens
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MarketCoinDetailsModal;
