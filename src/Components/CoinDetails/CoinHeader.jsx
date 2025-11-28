import React from "react";
import {
  FaStar,
  FaRegStar,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
} from "react-icons/fa";

function CoinHeader({
  coin,
  currentPrice,
  priceChange24h,
  isPositive,
  isInWatchlist,
  loadingWatchlist,
  toggleWatchlist,
  handleTrade,
  isLight,
  TC,
}) {
  return (
    <div
      className={`sticky top-2 z-40 max-w-7xl mx-auto rounded-2xl mb-6 ${TC.bgHeader} transition-colors duration-300`}
    >
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={coin.image?.large}
              alt={coin.name}
              className="w-10 h-10 md:w-14 md:h-14 rounded-full shadow-md"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg md:text-2xl font-bold leading-none">
                  {coin.name}
                </h1>
                <span
                  className={`text-xs md:text-sm uppercase px-2 py-1 rounded-lg ${
                    isLight
                      ? "bg-cyan-100 text-cyan-700"
                      : "bg-cyan-500/20 text-cyan-400"
                  }`}
                >
                  {coin.symbol}
                </span>
                <button
                  onClick={toggleWatchlist}
                  disabled={loadingWatchlist}
                  className={`text-lg md:text-xl transition-transform ${
                    loadingWatchlist
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-110"
                  } ${isInWatchlist ? "text-yellow-400" : "text-gray-400"}`}
                >
                  {isInWatchlist ? <FaStar /> : <FaRegStar />}
                </button>
              </div>
              <p className={`text-xs mt-1 ${TC.textSecondary}`}>
                Rank #{coin.market_cap_rank || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <div className="text-2xl font-bold">
                $
                {currentPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div
                className={`text-sm font-semibold flex items-center justify-end gap-1 ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isPositive ? (
                  <FaArrowUp className="text-xs" />
                ) : (
                  <FaArrowDown className="text-xs" />
                )}
                {isPositive ? "+" : ""}
                {priceChange24h.toFixed(2)}%
              </div>
            </div>

            <button
              onClick={handleTrade}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 text-sm md:px-6 md:py-2.5 md:text-base rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105 hover:shadow-cyan-500/25"
            >
              <FaExchangeAlt />
              Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoinHeader;
