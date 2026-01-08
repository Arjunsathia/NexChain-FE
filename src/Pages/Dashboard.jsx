import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ChartSection from "@/Components/Dashboard/ChartSection";
import NewsPanel from "@/Components/Dashboard/NewsPanel";
import TrendingCoinsWidget from "@/Components/Common/TrendingCoinsWidget";
import LearningHub from "@/Components/Dashboard/LearningHubWidget";
import { getCoins } from "@/api/coinApis";
import "react-loading-skeleton/dist/skeleton.css";
import WatchlistPreview from "@/Components/Dashboard/WatchlistPreview";
import TopCoins from "@/Components/Dashboard/TopCoins";
import UserProfileCard from "@/Components/Dashboard/UserProfileCard";
import PortfolioCard from "@/Components/Dashboard/PortfolioCard";
import RecentTradesCard from "@/Components/Dashboard/RecentTradesCard";
import DashboardSkeleton from "@/Components/Dashboard/DashboardSkeleton";
import useThemeCheck from "@/hooks/useThemeCheck";

export default function Dashboard() {
  const isLight = useThemeCheck();

  // React Query for caching Top Coins (prevents reload on navigation)
  const { data: topCoins = [], isLoading: loading } = useQuery({
    queryKey: ['dashboardTopCoins'],
    queryFn: async () => {
      const data = await getCoins({ per_page: 5 });
      if (Array.isArray(data)) {
        return data.slice(0, 3);
      }
      return [];
    },
  });

  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");

  // Sync selectedCoinId when data loads if not set (or typically default to bitcoin)
  useEffect(() => {
    if (topCoins.length > 0 && selectedCoinId === "bitcoin" && !topCoins.find(c => c.id === "bitcoin")) {
      setSelectedCoinId(topCoins[0].id);
    }
  }, [topCoins, selectedCoinId]);

  /* Removed global ticker subscription to prevent full-page re-renders */
  // const liveData = useBinanceTicker();

  const handleCoinClick = useCallback((coinId) => {
    setSelectedCoinId(coinId);
  }, []);

  const USERDATA_HEIGHT = "h-[150px]";
  const CHART_HEIGHT = "h-[620px]";
  const PORTFOLIO_HEIGHT = "h-[300px]";
  const TRADES_HEIGHT = "h-[266px]";
  const WATCHLIST_HEIGHT = "h-[280px]";
  const TRENDING_HEIGHT = "h-[250px]";
  const LEARNING_HUB_HEIGHT = "h-[186px]";

  if (loading && topCoins.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-6 ${isLight ? "text-gray-900" : "text-white"}`}
    >
      <div className="xl:hidden flex flex-col gap-4">
        <div>
          <UserProfileCard />
        </div>

        <div>
          <div className="space-y-1">
            <h2 className={`text-lg font-bold mb-3 px-1 tracking-tight ${isLight ? "text-gray-900" : "text-white"}`}>
              Top <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Cryptos</span>
            </h2>
            <TopCoins
              topCoins={topCoins}
              selectedCoinId={selectedCoinId}
              setSelectedCoinId={handleCoinClick}
              isMobile={true}
              loading={loading}
            />
          </div>
        </div>

        <div>
          <ChartSection coinId={selectedCoinId} />
        </div>

        <div>
          <PortfolioCard />
        </div>

        <div>
          <div className="flex flex-col gap-4">
            <WatchlistPreview />
            <TrendingCoinsWidget variant="dashboard" />
          </div>
        </div>

        <div>
          <NewsPanel />
        </div>

        <div>
          <RecentTradesCard />
        </div>

        <div>
          <LearningHub />
        </div>
      </div>

      <div className="hidden xl:flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          <div className="col-span-3 flex flex-col gap-6">
            <div className={`${USERDATA_HEIGHT}`}>
              <UserProfileCard />
            </div>
            <div className={`${PORTFOLIO_HEIGHT}`}>
              <PortfolioCard />
            </div>
            <div className={`${TRADES_HEIGHT}`}>
              <RecentTradesCard />
            </div>
          </div>

          <div className="col-span-6 flex flex-col gap-6">
            <div>
              <TopCoins
                topCoins={topCoins}
                selectedCoinId={selectedCoinId}
                setSelectedCoinId={handleCoinClick}
                isMobile={false}
                loading={loading}
              />
            </div>
            <div className={`${CHART_HEIGHT}`}>
              <ChartSection coinId={selectedCoinId} />
            </div>
          </div>

          <div className="col-span-3 flex flex-col gap-6">
            <div className={`${WATCHLIST_HEIGHT}`}>
              <WatchlistPreview />
            </div>
            <div className={`${TRENDING_HEIGHT}`}>
              <TrendingCoinsWidget variant="dashboard" />
            </div>
            <div className={`${LEARNING_HUB_HEIGHT}`}>
              <LearningHub />
            </div>
          </div>
        </div>

        <div>
          <NewsPanel />
        </div>
      </div>
    </div>
  );
}

