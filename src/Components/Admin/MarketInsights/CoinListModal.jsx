import React from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";

const CoinListModal = ({ title, coins, onClose, TC, formatCurrency }) => {
  if (!coins) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[2005] flex items-center justify-center p-4 ${TC.modalOverlay} animate-in fade-in duration-300`}
    >
      <div
        className={`w-full max-w-[400px] sm:max-w-2xl rounded-3xl max-h-[85vh] flex flex-col ${TC.modalContent} animate-in zoom-in duration-300 shadow-2xl border border-white/5`}
      >
        <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-500/5 to-cyan-500/5">
          <div>
            <h3 className={`text-xl font-bold ${TC.textPrimary}`}>{title}</h3>
            <p className={`text-xs ${TC.textSecondary} mt-0.5`}>Current market top performers</p>
          </div>
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 ${TC.textSecondary}`}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 space-y-2 custom-scrollbar">
          {coins.map((coin, index) => (
            <div
              key={coin.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl ${TC.bgItem} transition-all hover:scale-[1.01] hover:bg-white/5 group`}
            >
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-black font-mono ${TC.textTertiary} w-4 bg-white/5 h-6 flex items-center justify-center rounded-md`}>
                  {index + 1}
                </span>
                <div className="p-1 rounded-xl bg-white/5 border border-white/5">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-7 h-7 rounded-sm object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className={`font-bold text-sm ${TC.textPrimary} truncate max-w-[100px] sm:max-w-none group-hover:text-cyan-400 transition-colors`}
                  >
                    {coin.name}
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-tight ${TC.textSecondary}`}>
                    {coin.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-black text-sm ${TC.textPrimary} tracking-tight`}>
                  {formatCurrency(coin.current_price)}
                </p>
                <div
                  className={`text-[10px] font-black inline-flex items-center px-1.5 py-0.5 rounded ${coin.price_change_percentage_24h >= 0
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                    }`}
                >
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CoinListModal;
