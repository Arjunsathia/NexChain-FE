import useThemeCheck from "@/hooks/useThemeCheck";
import React, { useEffect, useState, useMemo } from "react";
import { getData } from "@/api/axiosConfig";
import useUserContext from "@/hooks/useUserContext";
import Skeleton from "react-loading-skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { FaStar, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import { useBinanceTicker } from "@/hooks/useBinanceTicker";

function WatchlistPreview({ disableAnimations = false }) {
  const isLight = useThemeCheck();
  const { user } = useUserContext();

  // Determine User ID (Context or direct token decode for instant cache key availability)
  const getInstantUserId = () => {
    if (user?.id) return user.id;
    // Fallback: Try decoding token for instant render
    try {
      const token = localStorage.getItem("NEXCHAIN_USER_TOKEN");
      if (token) {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );
        const decoded = JSON.parse(jsonPayload);
        return decoded.id;
      }
    } catch {
      // ignore
    }
    return null;
  };

  const effectiveUserId = getInstantUserId();

  const [watchlistData, setWatchlistData] = useState(() => {
    if (!effectiveUserId) return [];
    try {
      const cacheKey = `watchlist_${effectiveUserId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data } = JSON.parse(cached);
        if (Array.isArray(data)) return data;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisited } = useVisitedRoutes();
  const [shouldAnimate] = useState(
    !disableAnimations && !isVisited(location.pathname),
  );

  const livePrices = useBinanceTicker();

  const TC = useMemo(
    () => ({
      bgContainer: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",
      bgItem: isLight
        ? "hover:bg-blue-50/50 border-b border-gray-100 last:border-0"
        : "hover:bg-white/5 border-b border-gray-800 last:border-0",
      textPricePositive: isLight ? "text-green-600" : "text-green-400",
      textPriceNegative: isLight ? "text-red-600" : "text-red-400",
      bgIcon: isLight
        ? "bg-cyan-100/50 text-cyan-600"
        : "bg-cyan-500/10 text-cyan-400",
      bgEmpty: isLight ? "bg-gray-50" : "bg-gray-800/30",
      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    }),
    [isLight],
  );

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (watchlistData.length === 0) setLoading(true);
      setError(false);
      try {
        const res = await getData("/watchlist", { user_id: effectiveUserId });

        let list = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        } else if (res && Array.isArray(res.watchlist)) {
          list = res.watchlist;
        }
        setWatchlistData(list);
      } catch (err) {
        console.error("Failed to fetch watchlist preview:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (effectiveUserId) fetchWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveUserId]);

  const mergedCoins = useMemo(() => {
    if (!Array.isArray(watchlistData)) return [];

    return watchlistData
      .map((coin) => ({
        ...coin,
        ...(livePrices[coin.id] || {}),
      }))
      .filter(Boolean);
  }, [watchlistData, livePrices]);

  if (loading && watchlistData.length === 0) {
    return (
      <div className={`p-4 rounded-xl h-full flex flex-col ${TC.bgContainer}`}>
        <div className="flex items-center gap-2 mb-3">
          <Skeleton
            circle
            width={24}
            height={24}
            baseColor={TC.skeletonBase}
            highlightColor={TC.skeletonHighlight}
          />
          <Skeleton
            width={100}
            baseColor={TC.skeletonBase}
            highlightColor={TC.skeletonHighlight}
          />
        </div>
        <div className="space-y-2">
          <Skeleton
            height={40}
            baseColor={TC.skeletonBase}
            highlightColor={TC.skeletonHighlight}
          />
          <Skeleton
            height={40}
            baseColor={TC.skeletonBase}
            highlightColor={TC.skeletonHighlight}
          />
        </div>
      </div>
    );
  }

  // Removed isMounted logical class toggling to ensure unified dashboard animation
  return (
    <div className={`p-1 rounded-xl h-full flex flex-col ${TC.bgContainer}`}>
      { }
      <div className="px-4 pt-3 flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
          <FaStar className="text-cyan-500" />
          Watchlist
        </h3>
        {mergedCoins.length > 0 && (
          <span
            className={`text-[10px] ${TC.textSecondary} px-2 py-0.5 rounded-full border ${isLight ? "border-gray-200" : "border-gray-700"}`}
          >
            {mergedCoins.length} {mergedCoins.length === 1 ? "Coin" : "Coins"}
          </span>
        )}
      </div>

      { }
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 scrollbar-hide max-h-[240px] md:max-h-full">
        {error ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div
              className={`p-2 rounded-full mb-2 bg-yellow-100 text-yellow-600`}
            >
              <FaExclamationTriangle />
            </div>
            <p className={`text-xs ${TC.textSecondary}`}>Error loading</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[10px] text-blue-500 mt-1 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : mergedCoins.length === 0 ? (
          <div
            className={`h-full flex flex-col items-center justify-center text-center opacity-60 rounded-lg ${TC.bgEmpty}`}
          >
            <div
              className={`p-3 rounded-full mb-2 ${isLight ? "bg-white" : "bg-gray-700"}`}
            >
              <FaStar className={TC.textSecondary} />
            </div>
            <p className={`text-xs ${TC.textSecondary}`}>Watchlist is empty</p>
            <button
              onClick={() => navigate("/cryptolist")}
              className="text-[10px] text-blue-500 mt-2 hover:underline"
            >
              Add Coins
            </button>
          </div>
        ) : (
          mergedCoins.map((coin, index) => (
            <div
              key={coin.id}
              onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              style={shouldAnimate ? { animationDelay: `${index * 0.1}s` } : {}}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer group ${shouldAnimate ? "fade-in" : ""} ${TC.bgItem}`}
            >
              <div className="flex items-center gap-3">
                {coin.image ? (
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${TC.bgIcon}`}
                  >
                    {coin.symbol?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className={`text-xs font-bold ${TC.textPrimary}`}>
                    {coin.symbol?.toUpperCase()}
                  </p>
                  <p
                    className={`text-[10px] ${TC.textSecondary} truncate max-w-[80px]`}
                  >
                    {coin.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-xs font-bold ${TC.textPrimary}`}>
                  $
                  {coin.current_price?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-[10px] ${coin.price_change_percentage_24h >= 0 ? TC.textPricePositive : TC.textPriceNegative}`}
                >
                  {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                  {coin.price_change_percentage_24h?.toFixed(1)}%
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      { }
      {mergedCoins.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50 text-center">
          <button
            onClick={() => navigate("/watchlist")}
            className={`text-[10px] font-medium flex items-center justify-center gap-1 mx-auto transition-colors ${TC.textSecondary} hover:text-blue-500`}
          >
            View All <FaArrowRight size={8} />
          </button>
        </div>
      )}
    </div>
  );
}

export default WatchlistPreview;
