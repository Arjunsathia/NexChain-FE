import React, { useMemo } from "react";
import useCoinContext from '@/Context/CoinContext/useCoinContext';

function Highlights() {
  const { coins } = useCoinContext();

  // Get top 3 gainers - memoized to prevent unnecessary recalculations
  const topGainers = useMemo(() => {
    const list = Array.isArray(coins) ? coins : [];
    return [...list]
      .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 3);
  }, [coins]);

  return (
    <div className="bg-transparent p-6 rounded-xl shadow-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Top Performers</h2>
      <div className="space-y-4">
        {topGainers.map((coin) => (
          <div
            key={coin?.id ?? coin?.symbol ?? Math.random()}
            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <img
                src={coin?.image}
                alt={coin?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white truncate">{coin?.name ?? 'Unknown'}</p>
                <p className="text-sm text-gray-400">{coin?.symbol?.toUpperCase() ?? ''}</p>
              </div>
            </div>
            <div className={`text-right font-semibold ${
              (coin?.price_change_percentage_24h ?? 0) >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {(coin?.price_change_percentage_24h ?? 0).toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Highlights;
