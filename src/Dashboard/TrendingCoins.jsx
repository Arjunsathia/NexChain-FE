import React, { useEffect, useState } from "react";
import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle, FaFire, FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function TrendingCoins({ limit = 3 }) {
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
        const marketData = await getTrendingCoinMarketData(idsArray.slice(0, limit));
        setTrendingCoins(marketData);
      } catch (err) {
        console.error("Trending Coins Error:", err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, [limit]);

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
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl p-5 h-full flex flex-col fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-400/10 rounded-lg">
            <FaFire className="text-orange-400 text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Trending
            </h2>
            <p className="text-xs text-gray-400">
              Most popular coins
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
          Live
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 fade-in" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton circle width={36} height={36} baseColor="#2d3748" highlightColor="#374151" />
                  <div className="flex-1 space-y-2">
                    <Skeleton width={60} height={14} baseColor="#2d3748" highlightColor="#374151" />
                    <Skeleton width={80} height={12} baseColor="#2d3748" highlightColor="#374151" />
                  </div>
                </div>
                <Skeleton width={55} height={14} baseColor="#2d3748" highlightColor="#374151" />
              </div>
            ))}
          </div>
        )}

        {!loading && (error || trendingCoins.length === 0) && (
          <div className="text-center py-6 flex flex-col items-center justify-center gap-3 h-full fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <FaExclamationTriangle className="text-lg text-yellow-500" />
            </div>
            <p className="text-gray-400 text-sm">
              {error ? "Failed to load trending coins" : "No trending data"}
            </p>
            <button 
              onClick={handleRetry}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-xl border border-gray-600 hover:border-cyan-400/30"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && trendingCoins.length > 0 && (
          <div className="space-y-3">
            {trendingCoins.map((coin, index) => (
              <div 
                key={coin.id} 
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600 hover:bg-gray-700/50 hover:border-orange-400/30 transition-all duration-200 cursor-pointer group fade-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                onClick={() => handleCoinClick(coin)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-9 h-9 rounded-full group-hover:scale-110 transition-transform duration-200 shadow-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm group-hover:text-orange-300 transition-colors truncate">
                        {coin.symbol.toUpperCase()}
                      </span>
                      {index < 3 && (
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          index === 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                          index === 1 ? "bg-gray-500/20 text-gray-400 border border-gray-500/30" :
                          "bg-orange-500/20 text-orange-400 border border-orange-500/30"
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
                    className={`font-bold text-sm ${
                      coin.price_change_percentage_24h > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {coin.price_change_percentage_24h > 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
                  </span>
                  <div className="text-gray-300 text-xs mt-1 font-medium">
                    ${coin.current_price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && trendingCoins.length > 0 && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700 text-sm text-gray-400 fade-in" style={{ animationDelay: "0.6s" }}>
          <span>Top {trendingCoins.length} trending</span>
          <button
            onClick={() => navigate('/cryptolist')}
            className="text-orange-400 hover:text-orange-300 transition-all duration-200 flex items-center gap-1 text-sm"
          >
            Explore
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
}

export default TrendingCoins;