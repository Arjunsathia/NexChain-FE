import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaFire, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import useCoinContext from "@/hooks/useCoinContext";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";

function TrendingCoinsWidget({
  limit = 10,
  showViewAll = true,
  title = "Trending",
  className = "",
  variant = "market",
  disableAnimations = false,
}) {
  const isLight = useThemeCheck();
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisited } = useVisitedRoutes();
  const { coins, coinsLoading: loading, error } = useCoinContext();
  const livePrices = useBinanceTicker();

  // Animate only if it's the first visit to this page
  const [shouldAnimate] = useState(
    !disableAnimations && !isVisited(location.pathname),
  );

  // Derive "Trending" coins by sorting by 24h volume or change
  const displayedCoins = useMemo(() => {
    if (!Array.isArray(coins)) return [];
    return [...coins]
      .sort((a, b) => Math.abs(b.price_change_percentage_24h || 0) - Math.abs(a.price_change_percentage_24h || 0))
      .slice(0, limit);
  }, [coins, limit]);

  const TC = useMemo(
    () => ({
      bgContainer: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      bgItem: isLight
        ? "hover:bg-blue-50/50 border-b border-gray-100 last:border-0 transition-colors"
        : "hover:bg-white/5 border-b border-gray-800 last:border-0 transition-colors",
      textPricePositive: isLight ? "text-emerald-700" : "text-emerald-400",
      textPriceNegative: isLight ? "text-rose-700" : "text-rose-400",
      iconBg: isLight
        ? "bg-orange-100/50 text-orange-600"
        : "bg-orange-500/10 text-orange-400",
      bgEmpty: isLight ? "bg-gray-50" : "bg-gray-800/30",
      skeletonBase: isLight ? "#e5e7eb" : "#1f2937",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    }),
    [isLight],
  );

  const getRankStyle = (index) => {
    if (index === 0) return "bg-yellow-500 text-black border-yellow-200"; // Gold
    if (index === 1) return "bg-gray-300 text-black border-gray-100"; // Silver
    if (index === 2) return "bg-orange-600 text-white border-orange-400"; // Bronze
    return isLight
      ? "bg-gray-100 text-gray-600 border-gray-200"
      : "bg-gray-800 text-gray-400 border-gray-700";
  };

  return (
    <div
      className={`rounded-xl p-1 relative overflow-hidden group h-full flex flex-col hover:shadow-lg transition-all duration-300 ${TC.bgContainer} ${className}`}
    >
      {/* Header */}
      {variant === "dashboard" ? (
        <div className="px-4 pt-3 flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
            <FaFire className="text-orange-500" />
            {title}
          </h3>
        </div>
      ) : (
        <div className="px-4 pt-4 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${TC.iconBg}`}>
              <FaFire className="text-base" />
            </div>
            <h3 className={`font-bold text-sm md:text-base ${TC.textPrimary}`}>
              {title}
            </h3>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 pb-2 scrollbar-hide max-h-[265px] md:max-h-full relative z-10">
        {error && displayedCoins.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div
              className={`p-2 rounded-full mb-2 bg-yellow-100 text-yellow-600`}
            >
              <FaExclamationTriangle />
            </div>
            <p className={`text-xs ${TC.textSecondary}`}>Error loading</p>
          </div>
        ) : loading && displayedCoins.length === 0 ? (
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-2.5 border-b border-transparent"
              >
                <Skeleton
                  circle
                  width={24}
                  height={24}
                  baseColor={TC.skeletonBase}
                  highlightColor={TC.skeletonHighlight}
                />
                <div className="flex-1 ml-2">
                  <Skeleton
                    width={80}
                    baseColor={TC.skeletonBase}
                    highlightColor={TC.skeletonHighlight}
                  />
                  <Skeleton
                    width={40}
                    height={10}
                    baseColor={TC.skeletonBase}
                    highlightColor={TC.skeletonHighlight}
                  />
                </div>
                <div className="flex flex-col items-end">
                  <Skeleton
                    width={60}
                    baseColor={TC.skeletonBase}
                    highlightColor={TC.skeletonHighlight}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : displayedCoins.length === 0 ? (
          <div
            className={`h-full flex flex-col items-center justify-center text-center opacity-60 rounded-lg ${TC.bgEmpty}`}
          >
            <div
              className={`p-3 rounded-full mb-2 ${isLight ? "bg-white" : "bg-gray-700"}`}
            >
              <FaFire className={TC.textSecondary} />
            </div>
            <p className={`text-xs ${TC.textSecondary}`}>No trending data</p>
          </div>
        ) : (
          displayedCoins.map((coin, index) => {
            const liveData = livePrices[coin.id];
            const displayPrice = liveData?.price !== undefined ? liveData.price : coin.current_price;
            const displayChange = liveData?.change !== undefined ? liveData.change : coin.price_change_percentage_24h;

            return (
              <div
                key={coin.id}
                onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
                style={shouldAnimate ? { animationDelay: `${index * 0.1}s` } : {}}
                className={`flex items-center justify-between p-2.5 rounded-lg transition-colors cursor-pointer group ${shouldAnimate ? "fade-in" : ""} ${TC.bgItem}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full object-cover shadow-sm"
                    />
                    <div
                      className={`
                                            absolute -top-1.5 -left-1.5 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center border shadow-sm
                                            ${getRankStyle(index)}
                                        `}
                    >
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-xs font-bold leading-none ${TC.textPrimary}`}
                    >
                      {coin.symbol?.toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-medium mt-0.5 ${TC.textSecondary} truncate max-w-[80px]`}
                    >
                      {coin.name}
                    </span>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <p
                    className={`text-xs font-bold leading-none ${TC.textPrimary} mb-1`}
                  >
                    $
                    {displayPrice?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })}
                  </p>
                  <p
                    className={`text-[10px] font-semibold flex items-center ${displayChange >= 0 ? TC.textPricePositive : TC.textPriceNegative}`}
                  >
                    {displayChange >= 0 ? "+" : ""}
                    {displayChange?.toFixed(2)}%
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showViewAll && (
        <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-700/30 text-center relative z-10">
          <button
            onClick={() => navigate("/cryptolist")}
            className={`text-[10px] font-medium flex items-center justify-center gap-1 mx-auto transition-colors ${TC.textSecondary} hover:text-blue-500`}
          >
            View All <FaArrowRight size={8} />
          </button>
        </div>
      )}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default TrendingCoinsWidget;
