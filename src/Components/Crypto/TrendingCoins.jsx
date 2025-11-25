import { getTrend, getTrendingCoinMarketData } from "@/api/coinApis";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Assuming useThemeCheck is available in this scope or imported
const useThemeCheck = () => {
    const [isLight, setIsLight] = React.useState(!document.documentElement.classList.contains('dark'));
    React.useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return isLight;
};

function TrendingCoins() {
  const isLight = useThemeCheck();
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const TC = useMemo(() => ({
    bgContainer: isLight ? "bg-white border-gray-200 shadow-sm" : "bg-gray-800/40 backdrop-blur-md border-gray-700/50 shadow-xl",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textAccentGreen: isLight ? "text-green-600" : "text-green-400",
    textAccentRed: isLight ? "text-red-600" : "text-red-500",
    textHover: isLight ? "hover:text-cyan-600" : "hover:text-cyan-400",
    borderList: isLight ? "border-gray-300" : "border-gray-700",
    textError: isLight ? "text-gray-600" : "text-gray-400",
    skeletonBase: isLight ? "#e5e7eb" : "#2c313c",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a404c",
  }), [isLight]);

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
    <div className={`rounded-2xl p-6 fade-in ${TC.bgContainer}`} style={{ animationDelay: "0.1s" }}>
      <h2 className={`text-lg font-semibold mb-4 ${TC.textPrimary} fade-in`} style={{ animationDelay: "0.2s" }}>
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
                style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
              >
                <Skeleton
                  width={150}
                  height={18}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
                <Skeleton
                  width={100}
                  height={18}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
              </li>
            ))}
        </ul>
      ) : error || coins.length === 0 ? (
        <div className={`text-center mt-4 flex flex-col items-center justify-center gap-2 fade-in ${TC.textError}`} style={{ animationDelay: "0.3s" }}>
          <FaExclamationTriangle className="text-3xl" />
          <p className="text-sm">{error || "No trending coins found."}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {coins.map((coin, index) => (
            <li
              key={coin.id}
              className={`flex justify-between items-center text-sm ${TC.textPrimary} border-b ${TC.borderList} last:border-b-0 pb-2 fade-in`}
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
            >
              <span
                className={`flex items-center gap-2 cursor-pointer ${TC.textHover} transition-colors`}
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
                    ? `${TC.textAccentRed} font-semibold`
                    : `${TC.textAccentGreen} font-semibold`
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