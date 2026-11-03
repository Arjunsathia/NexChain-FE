import React, { useCallback, useMemo, useState } from "react";
import useCoinContext from "@/hooks/useCoinContext";
import DashboardHeader from "@/Components/Dashboard/DashboardHeader";
import AccountSummary from "@/Components/Dashboard/AccountSummary";
import ChartSection from "@/Components/Dashboard/ChartSection";
import PortfolioCard from "@/Components/Dashboard/PortfolioCard";
import MarketMovers from "@/Components/Dashboard/MarketMovers";
import WatchlistPreview from "@/Components/Dashboard/WatchlistPreview";
import RecentTradesCard from "@/Components/Dashboard/RecentTradesCard";
import NewsPanel from "@/Components/Dashboard/NewsPanel";
import LeaderboardWidget from "@/Components/Dashboard/LeaderboardWidget";
import LearningHubWidget from "@/Components/Dashboard/LearningHubWidget";
import { isStablecoin } from "@/utils/coinRegistry";

export default function Dashboard() {
  // The market list is already loaded app-wide (DataLoader); no extra request here
  const { coins, coinsLoading } = useCoinContext();
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");

  const topCoins = useMemo(
    // Stablecoins sit at $1 and make poor chart tabs
    () => coins.filter((c) => !isStablecoin(c)).slice(0, 6),
    [coins],
  );
  const handleSelect = useCallback((id) => setSelectedCoinId(id), []);

  // Each card shows its own skeleton, so the page renders immediately
  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-3 py-4 sm:p-0 lg:space-y-5">
      <DashboardHeader />
      <AccountSummary />

      <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <ChartSection
            coins={topCoins}
            selectedCoinId={selectedCoinId}
            onSelect={handleSelect}
            loading={coinsLoading && topCoins.length === 0}
          />
        </div>
        <div className="min-w-0 xl:col-span-4">
          <PortfolioCard />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-3">
        <MarketMovers />
        <WatchlistPreview />
        <div className="md:col-span-2 xl:col-span-1">
          <RecentTradesCard />
        </div>
      </div>

      <div className="grid gap-4 lg:gap-5 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-8">
          <NewsPanel />
        </div>
        <div className="flex min-w-0 flex-col gap-4 lg:gap-5 xl:col-span-4">
          <LeaderboardWidget />
          <LearningHubWidget />
        </div>
      </div>
    </div>
  );
}
