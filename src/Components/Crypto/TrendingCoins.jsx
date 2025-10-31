import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import React, { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function TrendingCoins() {
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchTrendingCoins = useCallback(async () => {
    setLoading(true);
    setError(null); // reset on fetch
    try {
      const trendData = await getTrend();
      const idsArray = Array.isArray(trendData.coins)
        ? trendData.coins.slice(0, 5).map((coin) => coin.item.id)
        : [];

      if (idsArray.length === 0)
        throw new Error("No valid trending coins found.");

      const marketData = await getTrendingCoinMarketData(idsArray);
      setCoins(marketData);
    } catch (err) {
      console.error("Failed to fetch trending coins", err);
      setError("Unable to load trending coins. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendingCoins();
  }, [fetchTrendingCoins]);

  return (
    <div className="border border-gray-700  rounded-xl p-5 shadow-md fade-in" style={{ animationDelay: "0.3s" }}>
      <h2 className="text-lg font-semibold text-white mb-4 fade-in" style={{ animationDelay: "0.4s" }}>
        🔥 Trending Coins
      </h2>

      {loading ? (
        <ul className="space-y-3">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <li
                key={index}
                className="flex justify-between items-center text-sm fade-in"
                style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
              >
                <Skeleton
                  width={150}
                  height={18}
                  baseColor="#2c313c"
                  highlightColor="#3a404c"
                />
                <Skeleton
                  width={100}
                  height={18}
                  baseColor="#2c313c"
                  highlightColor="#3a404c"
                />
              </li>
            ))}
        </ul>
      ) : error || coins.length === 0 ? (
        <div className="text-center text-gray-400 mt-4 flex flex-col items-center justify-center gap-2 fade-in" style={{ animationDelay: "0.5s" }}>
          <FaExclamationTriangle className="text-3xl text-gray-500" />
          <p className="text-sm">{error || "No trending coins found."}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {coins.map((coin, index) => (
            <li
              key={coin.id}
              className="flex justify-between items-center text-sm text-white border-b border-gray-700 last:border-b-0 pb-2 fade-in"
              style={{ animationDelay: `${0.5 + (index * 0.1)}s` }}
            >
              <span
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate(`/coin/${coin.id}`)}
              >
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-5 h-5 rounded-full"
                />
                {coin.name} ({coin.symbol.toUpperCase()})
              </span>

              <span
                className={
                  coin.price_change_percentage_1h_in_currency < 0
                    ? "text-red-500"
                    : "text-green-400"
                }
              >
                ${coin.current_price.toLocaleString()} (
                {coin.price_change_percentage_1h_in_currency?.toFixed(2)}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TrendingCoins;