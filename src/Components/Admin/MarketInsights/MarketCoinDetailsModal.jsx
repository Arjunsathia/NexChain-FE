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
      className={`fixed inset-0 z-[2005] flex items-center justify-center p-4 ${TC.modalOverlay} animate-in fade-in duration-300`}
    >
      <div
        className={`w-full max-w-[350px] sm:max-w-xl lg:max-w-2xl rounded-3xl overflow-hidden ${TC.modalContent} animate-in zoom-in duration-300 shadow-2xl border ${isLight ? "border-gray-100" : "border-gray-800"}`}
      >
        <div
          className={`px-4 py-3 sm:px-8 sm:py-6 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-b ${isLight ? "border-gray-100" : "border-gray-800"}`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-1 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-lg shadow-cyan-500/5">
              <img
                src={selectedCoin.image}
                alt={selectedCoin.name}
                className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl object-contain"
              />
            </div>
            <div>
              <h2 className={`text-base sm:text-xl lg:text-2xl font-black tracking-tight ${TC.textPrimary}`}>
                {selectedCoin.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-cyan-400 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                  {selectedCoin.symbol}
                </span>
                <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-lg font-black tracking-tighter ${selectedCoin.price_change_percentage_24h >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                  {selectedCoin.price_change_percentage_24h >= 0 ? "+" : ""}{selectedCoin.price_change_percentage_24h?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedCoin(null)}
            className={`transition-all duration-300 p-2 rounded-2xl hover:rotate-90 transform group ${isLight
              ? "bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50"
              : "bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/20"
              }`}
          >
            <FaTimes className="text-sm sm:text-lg group-hover:scale-110" />
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: "Current Price", value: formatCurrency(selectedCoin.current_price) },
              { label: "Market Cap", value: formatCompactNumber(selectedCoin.market_cap) },
              { label: "24h High", value: formatCurrency(selectedCoin.high_24h), color: "text-emerald-500" },
              { label: "24h Low", value: formatCurrency(selectedCoin.low_24h), color: "text-rose-500" },
              { label: "All Time High", value: formatCurrency(selectedCoin.ath) },
              { label: "Circulating Supply", value: formatCompactNumber(selectedCoin.circulating_supply) },
            ].map((item, idx) => (
              <div key={idx} className={`p-3 sm:p-4 rounded-2xl ${TC.bgItem} group relative overflow-hidden transition-all duration-300 hover:shadow-md`}>
                <p
                  className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.1em] mb-1 ${TC.textSecondary} opacity-60`}
                >
                  {item.label}
                </p>
                <p className={`text-sm sm:text-lg font-black tracking-tight ${item.color || TC.textPrimary}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className={`p-3 sm:p-6 rounded-2xl ${TC.bgItem} relative overflow-hidden border border-cyan-500/10 group shadow-inner ${isLight ? 'bg-gray-50/30' : 'bg-black/10'}`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                <h3
                  className={`text-xs sm:text-base font-black tracking-tight ${TC.textPrimary}`}
                >
                  7d Performance
                </h3>
              </div>
              <div className="px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[8px] sm:text-[10px] font-black uppercase tracking-wider border border-cyan-500/10">
                Live Data
              </div>
            </div>
            <div className="h-24 sm:h-32 w-full flex items-center justify-center relative z-10">
              <SimpleSparkline
                data={selectedCoin.sparkline_in_7d.price}
                color="#06b6d4"
                width={500}
                height={150}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default MarketCoinDetailsModal;
