import React, { useCallback, useEffect, useState, useMemo } from "react";
import useThemeCheck from "@/hooks/useThemeCheck";
import { useLocation } from "react-router-dom";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import SparklineGraph from "../Components/Crypto/SparklineGraph";
import CoinTable from "../Components/Crypto/CoinTable";
import TopGainers from "@/Components/Crypto/TopGainers";
import TopLosers from "@/Components/Crypto/TopLosers";
import TrendingCoinsWidget from "@/Components/Common/TrendingCoinsWidget";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getGlobalMarketStats } from "@/api/coinApis";
import TradeModal from "@/Components/TradeModal";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import {
  FaGlobeAmericas,
  FaFire,
  FaLayerGroup,
} from "react-icons/fa";

function CryptoList() {
  const isLight = useThemeCheck();
  const location = useLocation();
  const { isVisited } = useVisitedRoutes();

  // Defer heavy fetching on first visit
  const [isReady, setIsReady] = useState(() => isVisited(location.pathname));

  const [globalData, setGlobalData] = useState(() => {
    try {
      const cached = localStorage.getItem("globalMarketStats_v1");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // 5 min cache for stats
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          return data;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [loading, setLoading] = useState(
    () => Object.keys(globalData).length === 0,
  );
  const { purchasedCoins } = usePurchasedCoins();

  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  const [alertModal, setAlertModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      textTertiary: isLight ? "text-gray-500" : "text-gray-500",
      bgPage: isLight ? "bg-gray-50" : "bg-gray-900",
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",
      bgHeader: isLight
        ? "bg-white/80 backdrop-blur-md shadow-sm border border-gray-100"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border-b border-gray-700/50 isolation-isolate prevent-seam",
      accentGradient: isLight
        ? "bg-gradient-to-r from-blue-600 to-cyan-500"
        : "bg-gradient-to-r from-blue-500 to-cyan-400",
      textAccent: isLight ? "text-blue-600" : "text-cyan-400",
      skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
      skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
      bgPillPositive: isLight
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      bgPillNegative: isLight
        ? "bg-rose-100 text-rose-700 border-rose-200"
        : "bg-rose-500/10 text-rose-400 border-rose-500/20",
      iconBg: isLight
        ? "bg-indigo-50 text-indigo-600"
        : "bg-indigo-500/10 text-indigo-400",
    }),
    [isLight],
  );

  const fetchData = useCallback(async () => {
    // Only show loading if we don't have data
    if (Object.keys(globalData).length === 0) setLoading(true);

    try {
      const res = await getGlobalMarketStats();
      if (res) {
        setGlobalData(res);
        localStorage.setItem(
          "globalMarketStats_v1",
          JSON.stringify({
            data: res,
            timestamp: Date.now(),
          }),
        );
      }
    } catch (err) {
      console.error("Failed to fetch global market stats", err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only the logic inside matters, globalData check is internal

  useEffect(() => {
    if (isReady) {
      fetchData();
      return;
    }
    const timer = setTimeout(() => {
      setIsReady(true);
      fetchData();
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchData, isReady]);

  const handleTrade = useCallback((coin, options = {}) => {
    if (options.initialAlertMode) {
      setAlertModal({
        show: true,
        coin,
      });
    } else {
      setTradeModal({
        show: true,
        coin,
        type: "buy",
      });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setTradeModal((prev) => ({
      ...prev,
      show: false,
    }));
  }, []);

  const handleCloseAlertModal = useCallback(() => {
    setAlertModal({
      show: false,
      coin: null,
      type: "buy",
    });
  }, []);

  const getPillClasses = (value) => {
    return value < 0 ? TC.bgPillNegative : TC.bgPillPositive;
  };

  const formatCompactNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(number);
  };

  return (
    <div className={`min-h-screen ${TC.textPrimary} p-2 sm:p-4 lg:p-6`}>
      <div
        className={`
          hidden sm:block sticky top-2 z-40 max-w-7xl mx-auto rounded-xl shadow-md
          ${TC.bgHeader} transition-colors duration-300 p-0
        `}
      >
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${TC.iconBg}`}>
                <FaLayerGroup className="text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none">
                  Market Overview
                </h1>
                <p className={`text-xs mt-1 ${TC.textSecondary}`}>
                  Global Crypto Metrics & Trends
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 lg:gap-6 text-sm">
              <div className="flex flex-col items-end">
                <span className={TC.textTertiary}>Market Cap</span>
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton
                      width={80}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                    />
                  ) : (
                    `$${formatCompactNumber(globalData?.total_market_cap?.usd)}`
                  )}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={TC.textTertiary}>24h Volume</span>
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton
                      width={80}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                    />
                  ) : (
                    `$${formatCompactNumber(globalData?.total_volume?.usd)}`
                  )}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={TC.textTertiary}>BTC Dom</span>
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton
                      width={50}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                    />
                  ) : (
                    `${globalData?.market_cap_percentage?.btc?.toFixed(1)}%`
                  )}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={TC.textTertiary}>ETH Dom</span>
                <span className="font-semibold">
                  {loading ? (
                    <Skeleton
                      width={50}
                      baseColor={TC.skeletonBase}
                      highlightColor={TC.skeletonHighlight}
                    />
                  ) : (
                    `${globalData?.market_cap_percentage?.eth?.toFixed(1)}%`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-2 sm:py-8 space-y-4 sm:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 md:auto-rows-fr">
          <div
            className={`rounded-xl p-3 sm:p-5 flex flex-col justify-between relative overflow-hidden group ${TC.bgCard}`}
          >
            <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 transform translate-x-2 sm:translate-x-4 -translate-y-2 sm:-translate-y-4">
              <FaGlobeAmericas className="text-6xl sm:text-[5rem]" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${TC.iconBg}`}>
                  <FaGlobeAmericas className="text-base" />
                </div>
                <h3
                  className={`font-bold text-sm md:text-base ${TC.textPrimary}`}
                >
                  Global Market
                </h3>
              </div>

              <div className="space-y-1 mb-4">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60`}
                >
                  Total Market Cap
                </p>
                <div className="flex items-end gap-2">
                  <h2
                    className={`text-xl sm:text-2xl font-bold ${TC.textPrimary}`}
                  >
                    {loading ? (
                      <Skeleton
                        width={100}
                        className="sm:w-[140px]"
                        baseColor={TC.skeletonBase}
                        highlightColor={TC.skeletonHighlight}
                      />
                    ) : (
                      `$${formatCompactNumber(globalData?.total_market_cap?.usd)}`
                    )}
                  </h2>
                  {!loading && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${getPillClasses(globalData?.market_cap_change_percentage_24h_usd)} flex items-center`}
                    >
                      {globalData?.market_cap_change_percentage_24h_usd >= 0
                        ? "+"
                        : ""}
                      {globalData?.market_cap_change_percentage_24h_usd?.toFixed(
                        2,
                      )}
                      %
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60 mb-1`}
                  >
                    24h Volume
                  </p>
                  <p className={`text-sm font-bold ${TC.textPrimary}`}>
                    {loading ? (
                      <Skeleton
                        width={60}
                        baseColor={TC.skeletonBase}
                        highlightColor={TC.skeletonHighlight}
                      />
                    ) : (
                      `$${formatCompactNumber(globalData?.total_volume?.usd)}`
                    )}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-wider ${TC.textSecondary} opacity-60 mb-1`}
                  >
                    BTC Dominance
                  </p>
                  <p className={`text-sm font-bold ${TC.textPrimary}`}>
                    {loading ? (
                      <Skeleton
                        width={40}
                        baseColor={TC.skeletonBase}
                        highlightColor={TC.skeletonHighlight}
                      />
                    ) : (
                      `${globalData?.market_cap_percentage?.btc?.toFixed(1)}%`
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 h-12 sm:h-14 w-full opacity-60">
              {!loading && (
                <SparklineGraph color={isLight ? "#4f46e5" : "#6366f1"} />
              )}
            </div>
          </div>

          <div className={`flex flex-col h-full`}>
            {isReady && <TrendingCoinsWidget limit={5} showViewAll={false} />}
          </div>

          <div className={`flex flex-col h-full`}>
            {isReady && <TopGainers />}
          </div>

          <div className={`flex flex-col h-full`}>
            {isReady && <TopLosers />}
          </div>
        </div>

        <div>
          <CoinTable onTrade={handleTrade} />
        </div>


      </div>

      <TradeModal
        show={tradeModal.show}
        onClose={handleCloseModal}
        coin={tradeModal.coin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />

      <PriceAlertModal
        show={alertModal.show}
        onClose={handleCloseAlertModal}
        coin={alertModal.coin}
      />
    </div>
  );
}

export default CryptoList;
