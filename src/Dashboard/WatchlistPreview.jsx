// WatchlistPreview.jsx (Compact)
import React, { useEffect, useState } from "react";
import { getData } from "@/api/axiosConfig";
import useUserContext from "@/Context/UserContext/useUserContext";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import { FaStar, FaExclamationTriangle } from "react-icons/fa";

function WatchlistPreview() {
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

  const displayCoins = data.slice(0, 5);
  const totalCoins = data.length;

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
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <FaStar className="text-cyan-400 text-sm" />
          <div>
            <h2 className="text-base font-semibold text-cyan-400">Watchlist</h2>
            <p className="text-xs text-gray-400">
              {totalCoins} coin{totalCoins !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          className="text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors duration-200 bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded border border-gray-700"
          onClick={() => navigate("/watchlist")}
        >
          View All
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton circle width={32} height={32} baseColor="#2d3748" highlightColor="#4a5568" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton width={70} height={14} baseColor="#2d3748" highlightColor="#4a5568" />
                    <Skeleton width={50} height={12} baseColor="#2d3748" highlightColor="#4a5568" />
                  </div>
                </div>
                <Skeleton width={55} height={14} baseColor="#2d3748" highlightColor="#4a5568" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4 flex flex-col items-center justify-center gap-2 h-full">
            <FaExclamationTriangle className="text-lg text-yellow-500" />
            <p className="text-gray-400 text-xs mb-1">
              Failed to load
            </p>
            <button 
              onClick={handleRetry}
              className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-700"
            >
              Retry
            </button>
          </div>
        ) : displayCoins.length === 0 ? (
          <div className="text-center py-4 flex flex-col items-center justify-center gap-2 h-full">
            <FaStar className="text-lg text-gray-500" />
            <p className="text-gray-400 text-xs mb-1">Empty watchlist</p>
            <button 
              onClick={() => navigate("/coins")}
              className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-700"
            >
              Add Coins
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {displayCoins.map((coin) => (
              <div
                key={coin.id}
                className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg border border-gray-700 hover:bg-gray-800/50 hover:border-cyan-400/30 transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <div className="min-w-0 flex-1">
                    <span className="text-white font-medium text-xs group-hover:text-cyan-300 transition-colors truncate block">
                      {coin.name}
                    </span>
                    <span className="text-gray-400 text-xs uppercase">
                      {coin.symbol}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-semibold text-xs ${
                    coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}>
                    {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h?.toFixed(1)}%
                  </div>
                  <div className="text-gray-300 text-xs mt-0.5 font-medium">
                    ${coin.current_price?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && !error && displayCoins.length > 0 && totalCoins > 5 && (
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-700 text-xs text-gray-400">
          <span>5 of {totalCoins}</span>
          <button
            onClick={() => navigate("/watchlist")}
            className="text-cyan-400 hover:text-cyan-300 transition-colors text-xs"
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
}

export default WatchlistPreview;