// Dashboard.jsx
import Userdata from "./Userdata";
import ChartSection from "./ChartSection";
import NewsPanel from "./NewsPanel";
import TrendingCoins from "./TrendingCoins";
import LearningHub from "./LearningHub";
import { useEffect, useState } from "react";
import { getCoins } from "@/api/coinApis";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WatchlistPreview from "./WatchlistPreview";

export default function Dashboard() {
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
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

  // Reusable Top Coins Grid Component
  const TopCoinsGrid = ({ isMobile = false }) => (
    <div className={`grid grid-cols-3 gap-4 ${isMobile ? 'mb-4' : ''}`}>
      {loading
        ? [1, 2, 3].map((_, i) => (
            <div 
              key={i} 
              className={`bg-transparent border border-gray-700 rounded-xl shadow-lg flex ${
                isMobile ? "flex-col items-center gap-2 p-3" : "items-center gap-4 p-4"
              } fade-in`}
              style={{ animationDelay: `${0.3 + (i * 0.1)}s` }}
            >
              <Skeleton circle width={isMobile ? 32 : 40} height={isMobile ? 32 : 40} baseColor="#2d3748" highlightColor="#4a5568" />
              <div className={isMobile ? "text-center space-y-1" : "flex-1 space-y-2"}>
                <Skeleton width={isMobile ? 60 : 50} height={12} baseColor="#2d3748" highlightColor="#4a5568" />
                <Skeleton width={isMobile ? 50 : 80} height={12} baseColor="#2d3748" highlightColor="#4a5568" />
                <Skeleton width={isMobile ? 40 : 70} height={12} baseColor="#2d3748" highlightColor="#4a5568" />
              </div>
            </div>
          ))
        : topCoins.map((coin, index) => (
            <div
              key={coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`cursor-pointer bg-transparent border border-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-800/30 transition-all duration-300 fade-in ${
                selectedCoinId === coin.id ? "ring-2 ring-cyan-500 bg-cyan-500/10" : ""
              } ${
                isMobile ? "flex flex-col items-center gap-2 p-3" : "flex items-center gap-4 p-4"
              }`}
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
            >
              <img
                src={coin.image}
                alt={coin.name}
                className={isMobile ? "w-8 h-8 object-contain" : "w-10 h-10 object-contain"}
              />
              <div className={isMobile ? "text-center" : ""}>
                <h3 className={`font-semibold ${isMobile ? "text-sm" : "text-lg"}`}>
                  {coin.symbol.toUpperCase()}
                </h3>
                <p className={`text-gray-300 ${isMobile ? "text-xs" : "text-sm"}`}>
                  {isMobile 
                    ? `$${Number(coin.current_price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                    : `$${Number(coin.current_price).toLocaleString("en-IN")}`
                  }
                </p>
                <p
                  className={`font-medium ${
                    coin.price_change_percentage_24h >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  } ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  {isMobile 
                    ? `${coin.price_change_percentage_24h?.toFixed(1)}%`
                    : `${coin.price_change_percentage_24h?.toFixed(2)}%`
                  }
                </p>
              </div>
            </div>
          ))}
    </div>
  );

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Mobile & Medium Layout */}
      <div className="xl:hidden flex flex-col gap-4 lg:gap-6">
        
        {/* First Section: Profile, Portfolio, Recent Trades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Profile */}
          <div className="fade-in" style={{ animationDelay: "0.2s" }}>
            <Userdata showProfile={true} showPortfolio={false} showRecentTrades={false} />
          </div>
          
          {/* Portfolio */}
          <div className="fade-in" style={{ animationDelay: "0.3s" }}>
            <Userdata showProfile={false} showPortfolio={true} showRecentTrades={false} />
          </div>
          
          {/* Recent Trades */}
          <div className="fade-in" style={{ animationDelay: "0.4s" }}>
            <Userdata showProfile={false} showPortfolio={false} showRecentTrades={true} />
          </div>
        </div>

        {/* Second Section: Top 3 coins horizontally and Chart below */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Top 3 coins horizontally */}
          <div className="fade-in" style={{ animationDelay: "0.5s" }}>
            <TopCoinsGrid isMobile={true} />
          </div>

          {/* Chart Section */}
          <div className="fade-in" style={{ animationDelay: "0.6s" }}>
            <ChartSection coinId={selectedCoinId} />
          </div>
        </div>

        {/* Third Section: Watchlist, Trending, Learning Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="fade-in" style={{ animationDelay: "0.7s" }}>
            <WatchlistPreview />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.8s" }}>
            <TrendingCoins />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.9s" }}>
            <LearningHub />
          </div>
        </div>

        {/* Fourth Section: News Panel at bottom */}
        <div className="fade-in" style={{ animationDelay: "1.0s" }}>
          <NewsPanel />
        </div>
      </div>

      {/* Large Screen Layout (xl: 1280px+) */}
      <div className="hidden xl:grid grid-cols-12 gap-6">
        {/* Left Sidebar - Profile, Portfolio, Recent Trades */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="fade-in" style={{ animationDelay: "0.2s" }}>
            <Userdata showProfile={true} showPortfolio={false} showRecentTrades={false} />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.3s" }}>
            <Userdata showProfile={false} showPortfolio={true} showRecentTrades={false} />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.4s" }}>
            <Userdata showProfile={false} showPortfolio={false} showRecentTrades={true} />
          </div>
        </div>

        {/* Middle Section - Top Coins, Chart, and News */}
        <div className="col-span-6 flex flex-col gap-6">
          {/* Top 3 coins horizontally */}
          <div className="fade-in" style={{ animationDelay: "0.5s" }}>
            <TopCoinsGrid isMobile={false} />
          </div>

          {/* Chart Section */}
          <div className="fade-in" style={{ animationDelay: "0.6s" }}>
            <ChartSection coinId={selectedCoinId} />
          </div>

          {/* News Panel at bottom of middle */}
          <div className="fade-in" style={{ animationDelay: "0.7s" }}>
            <NewsPanel />
          </div>
        </div>

        {/* Right Sidebar - Watchlist, Trending, Learning Hub */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="fade-in" style={{ animationDelay: "0.8s" }}>
            <WatchlistPreview />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.9s" }}>
            <TrendingCoins />
          </div>
          <div className="fade-in" style={{ animationDelay: "1.0s" }}>
            <LearningHub />
          </div>
        </div>
      </div>
    </div>
  );
}