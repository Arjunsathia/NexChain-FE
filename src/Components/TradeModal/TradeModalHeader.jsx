import React from "react";
import { FaTimes, FaMoneyBillWave } from "react-icons/fa";

const TradeModalHeader = React.memo(
  ({ coin, coinName, symbol, currentPrice, isLight, handleClose }) => {
    return (
      <div
        className={`relative flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 transition-colors duration-300 ${isLight ? "bg-white border-b border-gray-100" : "bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-b border-white/5"}`}
      >
        <div className="flex items-center gap-3">
          {/* Coin Icon - Compact */}
          <div className="relative">
            <img
              src={coin.image}
              alt={coinName}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
            />
          </div>

          {/* Text Info - Inline */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <h2
                className={`text-base font-bold leading-none ${isLight ? "text-gray-900" : "text-white"}`}
              >
                {coinName}
              </h2>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLight ? "bg-gray-200 text-gray-500" : "bg-white/10 text-gray-400"}`}
              >
                {symbol}
              </span>
            </div>
            <div
              className={`text-xs font-mono font-bold leading-none mt-1 ${isLight ? "text-gray-900" : "text-white"}`}
            >
              $
              {currentPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* Close Button - Tiny */}
        <button
          onClick={handleClose}
          className={`
          p-1.5 rounded-full transition-colors bg-white/10 hover:bg-white/20
          ${isLight ? "hover:bg-gray-100 text-gray-400 bg-transparent" : "text-white"}
        `}
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    );
  },
);

TradeModalHeader.displayName = "TradeModalHeader";

export default TradeModalHeader;
