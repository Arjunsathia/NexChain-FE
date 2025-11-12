import React, { useMemo } from "react";
import useCoinContext from '@/Context/CoinContext/useCoinContext';
import { FaArrowUp, FaFire } from "react-icons/fa";

function Highlights() {
  const { coins } = useCoinContext();
  
  const topGainers = useMemo(() => {
    const list = Array.isArray(coins) ? coins : [];
    return [...list]
      .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 5);
  }, [coins]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-5 h-full fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 fade-in">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <FaFire className="text-green-400 text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            Top Gainers
          </h2>
          <p className="text-xs text-gray-400">
            Best performing coins (24h)
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {topGainers.map((coin, index) => (
          <div
            key={coin?.id ?? coin?.symbol ?? index}
            className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600 hover:bg-gray-700/50 hover:border-green-400/30 transition-all duration-200 group cursor-pointer fade-in"
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={coin?.image}
                alt={coin?.name}
                className="w-8 h-8 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
              />
              <div className="min-w-0 flex-1">
                <span className="text-white font-semibold text-sm group-hover:text-green-300 transition-colors truncate block">
                  {coin?.name ?? 'Unknown'}
                </span>
                <span className="text-gray-400 text-xs uppercase">
                  {coin?.symbol?.toUpperCase() ?? ''}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 font-bold text-sm text-green-400">
                <FaArrowUp className="text-xs" />
                {coin?.price_change_percentage_24h?.toFixed(1)}%
              </div>
              <div className="text-gray-300 text-xs mt-1 font-medium">
                ${coin?.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Highlights;