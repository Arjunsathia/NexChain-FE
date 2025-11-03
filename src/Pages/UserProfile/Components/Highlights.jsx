import React, { useMemo } from "react";
import useCoinContext from '@/Context/CoinContext/useCoinContext';

function Highlights() {
  const { coins } = useCoinContext();
  
  const topGainers = useMemo(() => {
    const list = Array.isArray(coins) ? coins : [];
    return [...list]
      .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 3);
  }, [coins]);

  return (
    <div className="bg-transparent border border-gray-700 rounded-xl p-3 sm:p-4 h-full">
      <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white">Top Gainers</h2>
      <div className="space-y-1 sm:space-y-2">
        {topGainers.map((coin) => (
          <div
            key={coin?.id ?? coin?.symbol ?? Math.random()}
            className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors group"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={coin?.image}
                alt={coin?.name}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full group-hover:scale-110 transition-transform flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white text-xs sm:text-sm truncate group-hover:text-cyan-300 transition-colors">
                  {coin?.name ?? 'Unknown'}
                </p>
                <p className="text-xs text-gray-400 truncate">{coin?.symbol?.toUpperCase() ?? ''}</p>
              </div>
            </div>
            <div className={`font-semibold text-xs sm:text-sm flex-shrink-0 ml-2 ${
              (coin?.price_change_percentage_24h ?? 0) >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {(coin?.price_change_percentage_24h ?? 0).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Highlights;