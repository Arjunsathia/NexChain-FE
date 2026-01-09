import React from "react";
import { FaTimes } from "react-icons/fa";

function CryptoDetailsModal({
  selectedCoin,
  setSelectedCoin,
  TC,
  isLight,
  formatCurrency,
  formatLargeNumber,
}) {
  if (!selectedCoin) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${TC.modalOverlay}`}
    >
      <div
        className={`w-[90vw] max-w-[320px] sm:max-w-2xl rounded-2xl overflow-hidden ${TC.modalContent} animate-in fade-in zoom-in duration-300`}
      >
        <div
          className={`px-4 py-3 sm:p-6 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10`}
        >
          <div className="flex items-center gap-3">
            <img
              src={selectedCoin.image}
              alt={selectedCoin.name}
              className="w-10 h-10 rounded-full shadow-lg"
            />
            <div>
              <h2 className={`text-lg font-bold ${TC.textPrimary}`}>
                {selectedCoin.name}
              </h2>
              <p className="text-cyan-400 text-xs font-medium uppercase">
                {selectedCoin.symbol}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedCoin(null)}
            className={`transition-all duration-200 p-1.5 rounded-lg hover:rotate-90 transform group ${
              isLight
                ? "text-gray-500 hover:text-red-600 hover:bg-red-100"
                : "text-gray-400 hover:text-white hover:bg-red-500/20"
            }`}
          >
            <FaTimes className="text-base group-hover:scale-110 transition-transform" />
          </button>
        </div>
        <div className="p-4 space-y-3 sm:space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className={`p-3 rounded-lg ${TC.bgItem}`}>
              <p
                className={`text-[10px] sm:text-xs uppercase mb-1 ${TC.textSecondary}`}
              >
                Current Price
              </p>
              <p className={`text-sm sm:text-lg font-bold ${TC.textPrimary}`}>
                {formatCurrency(selectedCoin.current_price)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${TC.bgItem}`}>
              <p
                className={`text-[10px] sm:text-xs uppercase mb-1 ${TC.textSecondary}`}
              >
                Market Cap
              </p>
              <p className={`text-sm sm:text-lg font-bold ${TC.textPrimary}`}>
                {formatLargeNumber(selectedCoin.market_cap)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${TC.bgItem}`}>
              <p
                className={`text-[10px] sm:text-xs uppercase mb-1 ${TC.textSecondary}`}
              >
                24h High
              </p>
              <p className="text-sm sm:text-lg font-bold text-green-400">
                {formatCurrency(selectedCoin.high_24h)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${TC.bgItem}`}>
              <p
                className={`text-[10px] sm:text-xs uppercase mb-1 ${TC.textSecondary}`}
              >
                24h Low
              </p>
              <p className="text-sm sm:text-lg font-bold text-red-400">
                {formatCurrency(selectedCoin.low_24h)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className={`p-3 rounded-lg ${TC.bgItem}`}>
              <p
                className={`text-[10px] sm:text-xs uppercase mb-1 ${TC.textSecondary}`}
              >
                All Time High
              </p>
              <p className={`text-sm sm:text-lg font-bold ${TC.textPrimary}`}>
                {formatCurrency(selectedCoin.ath)}
              </p>
              <p className="text-[10px] sm:text-xs text-red-400">
                {selectedCoin.ath_change_percentage.toFixed(2)}% from ATH
              </p>
            </div>
            <div className={`p-3 rounded-lg ${TC.bgItem}`}>
              <p
                className={`text-[10px] sm:text-xs uppercase mb-1 ${TC.textSecondary}`}
              >
                Circulating Supply
              </p>
              <p className={`text-sm sm:text-lg font-bold ${TC.textPrimary}`}>
                {formatLargeNumber(selectedCoin.circulating_supply)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CryptoDetailsModal;
