import Userdata from "./Userdata";
import ChartSection from "./ChartSection";
import NewsPanel from "./NewsPanel";
import TrendingCoins from "./TrendingCoins";
import LearningHub from "./LearningHub";
import { useEffect, useState } from "react";
import { getCoins } from "@/api/coinApis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WatchlistPreview from "./WatchlistPreview";
import { FaCoins, FaChartLine, FaFire } from "react-icons/fa";

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

  // Enhanced Top Coins Grid Component with Better Skeletons
  const TopCoinsGrid = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'mb-6' : ''}`}>
      {/* Section Header */}
      {/* <div className="flex items-center gap-3 mb-4 fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="p-2 bg-cyan-400/10 rounded-lg">
          <FaCoins className="text-cyan-400 text-base" />
        </div>
        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Top Cryptocurrencies
          </h2>
          <p className="text-xs text-gray-400">Market leaders</p>
        </div>
      </div> */}

      {/* Coins Grid */}
      <div className={`grid grid-cols-3 gap-3 sm:gap-4`}>
        {loading
          ? [1, 2, 3].map((_, i) => (
              <div 
                key={i} 
                className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-2xl p-3 sm:p-4 fade-in"
                style={{ animationDelay: `${0.3 + (i * 0.1)}s` }}
              >
                {/* Coin Image Skeleton */}
                <div className="flex justify-center mb-3">
                  <Skeleton 
                    circle 
                    width={isMobile ? 40 : 48} 
                    height={isMobile ? 40 : 48} 
                    baseColor="#2d3748" 
                    highlightColor="#374151"
                    className="mb-2"
                  />
                </div>
                
                {/* Coin Info Skeleton */}
                <div className="text-center space-y-2">
                  <Skeleton 
                    width={isMobile ? 50 : 60} 
                    height={14} 
                    baseColor="#2d3748" 
                    highlightColor="#374151"
                    className="mx-auto"
                  />
                  <Skeleton 
                    width={isMobile ? 40 : 60} 
                    height={12} 
                    baseColor="#2d3748" 
                    highlightColor="#374151"
                    className="mx-auto"
                  />
                  <Skeleton 
                    width={isMobile ? 35 : 50} 
                    height={12} 
                    baseColor="#2d3748" 
                    highlightColor="#374151"
                    className="mx-auto"
                  />
                </div>

                {/* Price Change Badge Skeleton */}
                <div className="flex justify-center mt-3">
                  <Skeleton 
                    width={isMobile ? 40 : 50} 
                    height={18} 
                    baseColor="#2d3748" 
                    highlightColor="#374151"
                    className="rounded-full"
                  />
                </div>
              </div>
            ))
          : topCoins.map((coin, index) => (
              <div
                key={coin.id}
                onClick={() => setSelectedCoinId(coin.id)}
                className={`cursor-pointer bg-gray-800/50 border text-white rounded-xl shadow-2xl transition-all duration-300 fade-in group ${
                  selectedCoinId === coin.id 
                    ? "ring-2 ring-cyan-500 bg-cyan-500/10 border-cyan-400/30 scale-105" 
                    : "border-gray-700 hover:border-cyan-400/30 hover:bg-gray-700/50 hover:scale-105"
                } ${
                  isMobile ? "p-3 sm:p-4" : "p-4 sm:p-5"
                }`}
                style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
              >
                {/* Coin Image and Rank */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className={`${
                        isMobile ? "w-10 h-10 sm:w-12 sm:h-12" : "w-12 h-12 sm:w-14 sm:h-14"
                      } object-contain group-hover:scale-110 transition-transform duration-300`}
                    />
                    {/* Rank Badge */}
                    <div className={`absolute -top-1 -right-1 ${
                      index === 0 ? "bg-yellow-500" :
                      index === 1 ? "bg-gray-500" :
                      "bg-orange-500"
                    } text-white rounded-full ${
                      isMobile ? "w-4 h-4 text-xs" : "w-5 h-5 text-sm"
                    } flex items-center justify-center font-bold shadow-lg`}>
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Coin Info */}
                  <div className="w-full">
                    <h3 className={`font-bold mb-1 ${
                      isMobile ? "text-sm" : "text-base"
                    } group-hover:text-cyan-300 transition-colors`}>
                      {coin.symbol.toUpperCase()}
                    </h3>
                    
                    <p className={`text-gray-300 ${
                      isMobile ? "text-xs" : "text-sm"
                    } mb-2 truncate`}>
                      {coin.name}
                    </p>
                    
                    <p className={`font-semibold ${
                      isMobile ? "text-xs sm:text-sm" : "text-sm sm:text-base"
                    } mb-2`}>
                      ${Number(coin.current_price).toLocaleString("en-IN", { 
                        maximumFractionDigits: coin.current_price < 1 ? 4 : 2 
                      })}
                    </p>
                    
                    {/* Price Change */}
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                      coin.price_change_percentage_24h >= 0
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}>
                      {coin.price_change_percentage_24h >= 0 ? "↗" : "↘"}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Market Stats Summary */}
      {!loading && topCoins.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400 fade-in" style={{ animationDelay: "0.6s" }}>
          <span>Real-time prices</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-6 fade-in" style={{ animationDelay: "0.1s" }}>
      {/* Mobile & Medium Layout */}
      <div className="xl:hidden flex flex-col gap-6">
        
        {/* Top Section: Profile, Portfolio, Recent Trades - Hide Recent Trades on small screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="fade-in" style={{ animationDelay: "0.2s" }}>
            <Userdata showProfile={true} showPortfolio={false} showRecentTrades={false} />
          </div>
          
          <div className="fade-in" style={{ animationDelay: "0.3s" }}>
            <Userdata showProfile={false} showPortfolio={true} showRecentTrades={false} />
          </div>
          
          {/* Recent Trades - Hidden on small screens, visible on medium and large */}
          <div className="hidden sm:block fade-in" style={{ animationDelay: "0.4s" }}>
            <Userdata showProfile={false} showPortfolio={false} showRecentTrades={true} />
          </div>
        </div>

        {/* Second Section: Top 3 coins */}
        <div className="fade-in" style={{ animationDelay: "0.5s" }}>
          <TopCoinsGrid isMobile={true} />
        </div>

        {/* Third Section: Chart */}
        <div className="fade-in" style={{ animationDelay: "0.6s" }}>
          <ChartSection coinId={selectedCoinId} />
        </div>

        {/* Fourth Section: Watchlist, Trending, Learning Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Fifth Section: News Panel */}
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
          {/* Top Coins Section */}
          <div className="fade-in" style={{ animationDelay: "0.5s" }}>
            <TopCoinsGrid isMobile={false} />
          </div>

          {/* Chart Section */}
          <div className="fade-in" style={{ animationDelay: "0.6s" }}>
            <ChartSection coinId={selectedCoinId} />
          </div>

          {/* News Panel */}
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

      {/* Loading Overlay for Initial Load */}
      {loading && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center fade-in">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Loading Dashboard</h3>
            <p className="text-gray-400">Fetching latest market data...</p>
          </div>
        </div>
      )}
    </div>
  );
}