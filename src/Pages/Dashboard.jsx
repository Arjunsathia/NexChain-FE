import React, { useEffect, useState, useRef, useMemo } from "react";
import ChartSection from "@/Components/Dashboard/ChartSection";
import NewsPanel from "@/Components/Dashboard/NewsPanel";
import TrendingCoins from "@/Components/Dashboard/TrendingCoins";
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

// WebSocket symbols mapping
const coinToSymbol = {
  bitcoin: "btcusdt",
  ethereum: "ethusdt",
  "usd-coin": "usdcusdt",
  binancecoin: "bnbusdt",
  ripple: "xrpusdt",
  cardano: "adausdt",
  solana: "solusdt",
  dogecoin: "dogeusdt",
};

export default function Dashboard() {
  const isLight = useThemeCheck();
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({});
  const ws = useRef(null);
  const liveDataRef = useRef({});

  // Handler for selecting coin for chart
  const handleCoinClick = (coinId) => {
    setSelectedCoinId(coinId);
  };

  // Update ref when liveData changes
  useEffect(() => {
    liveDataRef.current = liveData;
  }, [liveData]);

  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        setLoading(true);
        const data = await getCoins();
        const topThree = data.slice(0, 3);
        setTopCoins(topThree);

        if (topThree.length > 0) {
          setSelectedCoinId(topThree[0].id);
        }
      } catch (error) {
        console.error("Failed to load coins", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCoins();
  }, []);

  // WebSocket setup for live data
  useEffect(() => {
    if (topCoins.length === 0) return;

    const symbols = topCoins
      .map((coin) => coinToSymbol[coin.id])
      .filter(Boolean)
      .map((symbol) => `${symbol}@ticker`)
      .join("/");

    if (!symbols) return;

    try {
      ws.current = new WebSocket(
        `wss://stream.binance.com:9443/stream?streams=${symbols}`
      );



      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.stream && data.data) {
          const symbol = data.stream.replace("@ticker", "");
          const coinId = Object.keys(coinToSymbol).find(
            (key) => coinToSymbol[key] === symbol
          );

          if (coinId) {
            const newPrice = parseFloat(data.data.c);
            const newChange = parseFloat(data.data.P);

            // Only update if data actually changed
            const currentData = liveDataRef.current[coinId];
            if (
              !currentData ||
              currentData.price !== newPrice ||
              currentData.change !== newChange
            ) {
              setLiveData((prev) => ({
                ...prev,
                [coinId]: {
                  price: newPrice,
                  change: newChange,
                  isPositive: newChange >= 0,
                },
              }));
            }
          }
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

    } catch (error) {
      console.error("WebSocket setup failed:", error);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [topCoins]);

  // --- Large Screen Sidebar Item Heights (Perfectly Aligned with Compact Chart) ---

  // FIX: Compact Profile
  const USERDATA_HEIGHT = "h-[150px]";

  // FIX: Redistribute remaining space (Total Target Height: ~764px)
  const CHART_HEIGHT = "h-[620px]"; // Restored to original, more compact height

  // New height calculations to balance the 764px middle column height
  const PORTFOLIO_HEIGHT = "h-[300px]";
  const TRADES_HEIGHT = "h-[266px]";

  // Right sidebar balancing the left side
  const WATCHLIST_HEIGHT = "h-[280px]";
  const TRENDING_HEIGHT = "h-[250px]";
  const LEARNING_HUB_HEIGHT = "h-[186px]";

  if (loading && topCoins.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-6 fade-in ${
        isLight ? "text-gray-900" : "text-white"
      }`}
      style={{ animationDelay: "0.1s" }}
    >
      {/* Mobile & Medium Layout (Gaps reduced to 4) */}
      <div className="xl:hidden flex flex-col gap-4">
        {/* 1. Profile */}
        <div
          className="fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <UserProfileCard />
        </div>

        {/* 2. Top Three Coins */}
        <div className="fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="space-y-1">
            <h2
              className={`text-lg font-bold mb-3 px-1 ${
                isLight ? "text-gray-900" : "text-white"
              }`}
            >
              Top Cryptos
            </h2>
            <TopCoins
              topCoins={topCoins}
              selectedCoinId={selectedCoinId}
              setSelectedCoinId={handleCoinClick}
              isMobile={true}
              liveData={liveData}
              loading={loading}
            />
          </div>
        </div>

        {/* Chart Section */}
        <div className="fade-in" style={{ animationDelay: "0.4s" }}>
          <ChartSection coinId={selectedCoinId} />
        </div>

        {/* 3. Holdings */}
        <div className="fade-in" style={{ animationDelay: "0.5s" }}>
          <PortfolioCard />
        </div>

        {/* 4. Watchlist & 5. Trending */}
        <div className="flex flex-col gap-4">
          <div className="fade-in" style={{ animationDelay: "0.6s" }}>
            <WatchlistPreview />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.7s" }}>
            <TrendingCoins />
          </div>
        </div>

        {/* 6. News Panel */}
        <div className="fade-in" style={{ animationDelay: "0.8s" }}>
          <NewsPanel />
        </div>

        {/* 7. Recent Trades */}
        <div className="fade-in" style={{ animationDelay: "0.9s" }}>
          <RecentTradesCard />
        </div>

        {/* Learning Hub */}
        <div className="fade-in" style={{ animationDelay: "1.0s" }}>
          <LearningHub />
        </div>
      </div>

      {/* Large Screen Layout (xl: 1280px+) - Perfectly Spaced and Aligned */}
      <div className="hidden xl:flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Sidebar - Profile, Portfolio, Recent Trades (Normalized Heights) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div
              className={`fade-in ${USERDATA_HEIGHT}`}
              style={{ animationDelay: "0.2s" }}
            >
              <UserProfileCard />
            </div>
            <div
              className={`fade-in ${PORTFOLIO_HEIGHT}`}
              style={{ animationDelay: "0.3s" }}
            >
              <PortfolioCard />
            </div>
            <div
              className={`fade-in ${TRADES_HEIGHT}`}
              style={{ animationDelay: "0.4s" }}
            >
              <RecentTradesCard />
            </div>
          </div>

          {/* Middle Section - Top Coins, Chart */}
          <div className="col-span-6 flex flex-col gap-6">
            {/* Top Coins Section */}
            <div className="fade-in" style={{ animationDelay: "0.5s" }}>
              <TopCoins
                topCoins={topCoins}
                selectedCoinId={selectedCoinId}
                setSelectedCoinId={handleCoinClick}
                isMobile={false}
                liveData={liveData}
                loading={loading}
              />
            </div>

            {/* Chart Section (Restored to compact height) */}
            <div
              className={`fade-in ${CHART_HEIGHT}`}
              style={{ animationDelay: "0.6s" }}
            >
              <ChartSection coinId={selectedCoinId} />
            </div>
          </div>

          {/* Right Sidebar - Watchlist, Trending, Learning Hub (Normalized Heights) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div
              className={`fade-in ${WATCHLIST_HEIGHT}`}
              style={{ animationDelay: "0.8s" }}
            >
              <WatchlistPreview />
            </div>
            <div
              className={`fade-in ${TRENDING_HEIGHT}`}
              style={{ animationDelay: "0.9s" }}
            >
              <TrendingCoins />
            </div>
            <div
              className={`fade-in ${LEARNING_HUB_HEIGHT}`}
              style={{ animationDelay: "1.0s" }}
            >
              <LearningHub />
            </div>
          </div>
        </div>

        {/* Bottom Section - News Panel (Follows immediately without gap) */}
        <div className="fade-in" style={{ animationDelay: "0.7s" }}>
          <NewsPanel />
        </div>
      </div>
    </div>
  );
}