import React from "react";
import { FaTimes } from "react-icons/fa";

const CoinListModal = ({
  title,
  coins,
  onClose,
  TC,
  formatCurrency,
  isLight,
}) => {
  if (!coins) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}
    >
      <div
        className={`w-[90vw] max-w-[340px] sm:max-w-2xl rounded-xl max-h-[80vh] flex flex-col ${TC.modalContent} animate-in fade-in zoom-in duration-200`}
      >
        <div className="px-4 py-3 sm:p-6 border-b border-gray-800/10 flex justify-between items-center">
          <h3 className={`text-lg font-bold ${TC.textPrimary}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg hover:bg-gray-500/10 transition-colors ${TC.textSecondary}`}
          >
            <FaTimes />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          {coins.map((coin, index) => (
            <div
              key={coin.id}
              className={`flex items-center justify-between p-2.5 rounded-lg ${TC.bgItem} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`text-xs font-mono ${TC.textTertiary} w-4`}>
                  {index + 1}
                </span>
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-6 h-6 rounded-full"
                />
                <div className="min-w-0">
                  <p className={`font-bold text-xs ${TC.textPrimary} truncate max-w-[80px] sm:max-w-none`}>
                    {coin.name}
                  </p>
                  <p className={`text-[10px] ${TC.textSecondary}`}>
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-xs ${TC.textPrimary}`}>
                  {formatCurrency(coin.current_price)}
                </p>
                <p
                  className={`text-[10px] font-bold ${
                    coin.price_change_percentage_24h >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoinListModal;
