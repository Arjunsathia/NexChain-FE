import React, { useEffect, useState } from "react";
import { getData } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { FaStar, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";

function WatchlistPreview({ limit = 3 }) {
  const { user } = useUserContext();
  const userId = user?.id;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getData("/watchlist", { user_id: userId });
        setData(res);
      } catch (err) {
        console.error("Failed to fetch watchlist preview:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchWatchlist();
  }, [userId]);

  const displayCoins = data.slice(0, limit);
  const totalCoins = data.length;

  const handleRetry = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-2xl rounded-xl p-5 h-full flex flex-col fade-in"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-4 fade-in"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-400/10 rounded-lg">
            <FaStar className="text-cyan-400 text-base" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Watchlist
            </h2>
            <p className="text-xs text-gray-400">
              {totalCoins} coin{totalCoins !== 1 ? "s" : ""} tracked
            </p>
          </div>
        </div>
        {totalCoins > limit && (
          <button
            className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-3 py-1.5 rounded-xl border border-gray-600 hover:border-cyan-400/30 flex items-center gap-1 text-sm fade-in"
            style={{ animationDelay: "0.3s" }}
            onClick={() => navigate("/watchlist")}
          >
            View All
            <FaArrowRight className="text-xs" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 fade-in"
                style={{ animationDelay: `${0.4 + idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton
                    circle
                    width={36}
                    height={36}
                    baseColor="#2d3748"
                    highlightColor="#374151"
                  />
                  <div className="flex-1 space-y-2">
                    <Skeleton
                      width={80}
                      height={14}
                      baseColor="#2d3748"
                      highlightColor="#374151"
                    />
                    <Skeleton
                      width={60}
                      height={12}
                      baseColor="#2d3748"
                      highlightColor="#374151"
                    />
                  </div>
                </div>
                <Skeleton
                  width={65}
                  height={14}
                  baseColor="#2d3748"
                  highlightColor="#374151"
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className="text-center py-6 flex flex-col items-center justify-center gap-3 h-full fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <FaExclamationTriangle className="text-lg text-yellow-500" />
            </div>
            <p className="text-gray-400 text-sm">Failed to load watchlist</p>
            <button
              onClick={handleRetry}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-xl border border-gray-600 hover:border-cyan-400/30"
            >
              Try Again
            </button>
          </div>
        ) : displayCoins.length === 0 ? (
          <div
            className="text-center py-6 flex flex-col items-center justify-center gap-3 h-full fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="p-3 bg-cyan-400/10 rounded-full">
              <FaStar className="text-lg text-cyan-400" />
            </div>
            <p className="text-gray-400 text-sm">Your watchlist is empty</p>
            <button
              onClick={() => navigate("/cryptolist")}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-all duration-200 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-xl border border-gray-600 hover:border-cyan-400/30"
            >
              Add Coins
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayCoins.map((coin, index) => (
              <div
                key={coin.id}
                className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl border border-gray-600 hover:bg-gray-700/50 hover:border-cyan-400/30 transition-all duration-200 cursor-pointer group fade-in"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-9 h-9 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors truncate block">
                      {coin.name}
                    </span>
                    <span className="text-gray-400 text-xs uppercase">
                      {coin.symbol}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-bold text-sm ${
                      coin.price_change_percentage_24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                    {coin.price_change_percentage_24h?.toFixed(1)}%
                  </div>
                  <div className="text-gray-300 text-xs mt-1 font-medium">
                    $
                    {coin.current_price?.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && displayCoins.length > 0 && totalCoins > limit && (
        <div
          className="flex items-center justify-between pt-3 mt-3 border-t border-gray-700 text-sm text-gray-400 fade-in"
          style={{ animationDelay: "0.7s" }}
        >
          <span>
            Showing {limit} of {totalCoins}
          </span>
        </div>
      )}
    </div>
  );
}

export default WatchlistPreview;
