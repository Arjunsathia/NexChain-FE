import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

function MarketMovers({
  topGainers,
  topLosers,
  setShowTopGainers,
  setShowTopLosers,
  TC,
  formatCurrency,
  disableAnimations = false,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      { }
      <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3
            className={`text-base sm:text-lg font-bold flex items-center gap-2 ${TC.textPrimary}`}
          >
            <FaArrowUp className="text-green-400 text-sm sm:text-base" /> Top
            Gainers
          </h3>
          <button
            onClick={() => setShowTopGainers(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            View All
          </button>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {topGainers.map((coin, index) => (
            <div
              key={coin.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-all duration-200 hover:scale-[1.02] ${disableAnimations ? '' : 'fade-in'}`}
              style={disableAnimations ? {} : { animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-bold text-xs sm:text-sm ${TC.textPrimary} truncate`}
                  >
                    {coin.symbol.toUpperCase()}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs ${TC.textSecondary} truncate`}
                  >
                    {formatCurrency(coin.current_price)}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-green-400 font-bold text-xs sm:text-sm whitespace-nowrap">
                  +{coin.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      { }
      <div className={`${TC.bgCard} rounded-2xl p-4 sm:p-6`}>
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3
            className={`text-base sm:text-lg font-bold flex items-center gap-2 ${TC.textPrimary}`}
          >
            <FaArrowDown className="text-red-400 text-sm sm:text-base" /> Top
            Losers
          </h3>
          <button
            onClick={() => setShowTopLosers(true)}
            className="text-xs text-cyan-400 hover:text-cyan-300"
          >
            View All
          </button>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {topLosers.map((coin, index) => (
            <div
              key={coin.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-xl ${TC.bgItem} transition-all duration-200 hover:scale-[1.02] ${disableAnimations ? '' : 'fade-in'}`}
              style={disableAnimations ? {} : { animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-bold text-xs sm:text-sm ${TC.textPrimary} truncate`}
                  >
                    {coin.symbol.toUpperCase()}
                  </p>
                  <p
                    className={`text-[10px] sm:text-xs ${TC.textSecondary} truncate`}
                  >
                    {formatCurrency(coin.current_price)}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-red-400 font-bold text-xs sm:text-sm whitespace-nowrap">
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MarketMovers;
