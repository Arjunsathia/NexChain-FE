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
        className={`w-full max-w-2xl rounded-2xl max-h-[80vh] flex flex-col ${TC.modalContent} animate-in fade-in zoom-in duration-200`}
      >
        <div className="p-4 sm:p-6 border-b border-gray-800/10 flex justify-between items-center">
          <h3 className={`text-xl font-bold ${TC.textPrimary}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-500/10 transition-colors ${TC.textSecondary}`}
          >
            <FaTimes />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6 space-y-2">
          {coins.map((coin, index) => (
            <div
              key={coin.id}
              className={`flex items-center justify-between p-3 rounded-xl ${TC.bgItem} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono ${TC.textTertiary} w-6`}>
                  {index + 1}
                </span>
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className={`font-bold text-sm ${TC.textPrimary}`}>
                    {coin.name}
                  </p>
                  <p className={`text-xs ${TC.textSecondary}`}>
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${TC.textPrimary}`}>
                  {formatCurrency(coin.current_price)}
                </p>
                <p
                  className={`text-xs font-bold ${
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
