// TrendingCoins.jsx (Compact)
import React, { useEffect, useState } from "react";
import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle, FaFire, FaChartLine } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function TrendingCoins() {
  const [trendingCoins, setTrendingCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setError(false);
        const trendData = await getTrend();
        const idsArray = trendData.coins.map((coin) => coin.item.id);
        const marketData = await getTrendingCoinMarketData(idsArray.slice(0, 5));
        setTrendingCoins(marketData);
      } catch (err) {
        console.error("Trending Coins Error:", err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleCoinClick = (coin) => {
    navigate(`/coin/coin-details/${coin.id}`);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700 shadow-lg rounded-xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaFire className="text-orange-400 text-sm" />
          <h2 className="text-base font-semibold text-cyan-400">Trending</h2>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton circle width={32} height={32} baseColor="#2d3748" highlightColor="#4a5568" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton width={50} height={14} baseColor="#2d3748" highlightColor="#4a5568" />
                    <Skeleton width={70} height={12} baseColor="#2d3748" highlightColor="#4a5568" />
                  </div>
                </div>
                <Skeleton width={45} height={14} baseColor="#2d3748" highlightColor="#4a5568" />
              </div>
            ))}
          </div>
        )}

        {!loading && (error || trendingCoins.length === 0) && (
          <div className="text-center py-4 flex flex-col items-center justify-center gap-2 h-full">
            <FaExclamationTriangle className="text-lg text-yellow-500" />
            <p className="text-gray-400 text-xs mb-1">
              {error ? "Failed to load" : "No data"}
            </p>
            <button 
              onClick={handleRetry}
              className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && trendingCoins.length > 0 && (
          <div className="space-y-2">
            {trendingCoins.map((coin, index) => (
              <div 
                key={coin.id} 
                className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 hover:border-cyan-400/30 transition-all duration-200 cursor-pointer group"
                onClick={() => handleCoinClick(coin)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform duration-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium text-white text-xs group-hover:text-cyan-300 transition-colors truncate">
                        {coin.symbol.toUpperCase()}
                      </span>
                      {index < 3 && (
                        <span className={`text-xs px-1 py-0.5 rounded-full ${
                          index === 0 ? "bg-yellow-500/20 text-yellow-400" :
                          index === 1 ? "bg-gray-500/20 text-gray-400" :
                          "bg-orange-500/20 text-orange-400"
                        }`}>
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-xs block truncate">
                      {coin.name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-semibold text-xs ${
                      coin.price_change_percentage_24h > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {coin.price_change_percentage_24h > 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
                  </span>
                  <div className="text-gray-300 text-xs mt-0.5 font-medium">
                    ${coin.current_price?.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && trendingCoins.length > 0 && (
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-700 text-xs text-gray-400">
          <span>Top {trendingCoins.length}</span>
          <span className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
            Trending
          </span>
        </div>
      )}
    </div>
  );
}

export default TrendingCoins;