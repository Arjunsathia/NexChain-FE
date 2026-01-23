import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
import useMediaQuery from "@/hooks/useMediaQuery";
import { useVisitedRoutes } from "@/hooks/useVisitedRoutes";
import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const isLight = useThemeCheck();
  const isDesktop = useMediaQuery("(min-width: 1280px)"); // 1280px is xl in Tailwind

  // React Query for caching Top Coins (prevents reload on navigation)
  const { data: topCoins = [], isLoading: loading } = useQuery({
    queryKey: ["dashboardTopCoins"],
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
    if (
      topCoins.length > 0 &&
      selectedCoinId === "bitcoin" &&
      !topCoins.find((c) => c.id === "bitcoin")
    ) {
      setSelectedCoinId(topCoins[0].id);
    }
  }, [topCoins, selectedCoinId]);

  /* Removed global ticker subscription to prevent full-page re-renders - specialized components now handle their own live data */

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

  // Defer showing heavy content until after entrance animation (350ms)
  const location = useLocation();
  const { isVisited } = useVisitedRoutes();
  const [isReady, setIsReady] = useState(() => isVisited(location.pathname));

  useEffect(() => {
    if (isReady) return;
    const timer = setTimeout(() => setIsReady(true), 350);
    return () => clearTimeout(timer);
  }, [isReady]);

  const [activeTab, setActiveTab] = useState("markets");

  const tabs = [
    { id: "markets", label: "Markets" },
    { id: "watchlist", label: "Watchlist" },
    { id: "activity", label: "Activity" },
  ];

  if (!isReady || (loading && topCoins.length === 0)) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-6 ${isLight ? "text-gray-900" : "text-white"}`}
    >
      {!isDesktop ? (
        <div className="flex flex-col gap-5">
          {/* Top Profile Card */}
          <UserProfileCard />

          {/* Quick Stats / Portfolio */}
          <PortfolioCard />

          {/* Mobile Tabs Navigation */}
          <div className="sticky top-[60px] z-30 py-2 -mx-2 px-2 backdrop-blur-md bg-opacity-80">
            <div className={`p-1 rounded-2xl flex gap-1 ${isLight ? "bg-gray-100" : "bg-gray-800/50"}`}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${activeTab === tab.id
                    ? (isLight ? "bg-white text-blue-600 shadow-sm" : "bg-gray-700 text-cyan-400 shadow-lg")
                    : (isLight ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-gray-200")
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tabbed Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === "markets" && (
                <>
                  <div className="space-y-3">
                    <h2 className={`text-sm font-black uppercase tracking-[0.2em] px-1 ${isLight ? "text-gray-400" : "text-gray-500"}`}>
                      Top Assets
                    </h2>
                    <TopCoins
                      topCoins={topCoins}
                      selectedCoinId={selectedCoinId}
                      setSelectedCoinId={handleCoinClick}
                      isMobile={true}
                      loading={loading}
                    />
                  </div>
                  <ChartSection coinId={selectedCoinId} />
                  <TrendingCoinsWidget variant="dashboard" />
                </>
              )}

              {activeTab === "watchlist" && (
                <WatchlistPreview />
              )}

              {activeTab === "activity" && (
                <RecentTradesCard />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Permanent Bottom Sections */}
          <div className="pt-4 border-t border-white/5">
            <h2 className={`text-sm font-black uppercase tracking-[0.2em] mb-4 px-1 ${isLight ? "text-gray-400" : "text-gray-500"}`}>
              Latest Discovery
            </h2>
            <div className="space-y-6">
              <NewsPanel />
              <LearningHub />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
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
      )}
    </div>
  );
}
