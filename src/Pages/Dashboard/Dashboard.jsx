import React, { useEffect, useState, useRef, useMemo } from "react";
import Userdata from "./components/Userdata";
import ChartSection from "./components/ChartSection";
import NewsPanel from "./components/NewsPanel";
import TrendingCoins from "./components/TrendingCoins";
import LearningHub from "./components/LearningHub";
import { getCoins } from "@/api/coinApis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WatchlistPreview from "./components/WatchlistPreview";
import TopCoins from "./components/TopCoins";
import { FaWallet } from "react-icons/fa";
import useUserContext from '@/Context/UserContext/useUserContext';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';
import { useNavigate } from "react-router-dom";

// Utility to check if light mode is active based on global class
const useThemeCheck = () => {
    const [isLight, setIsLight] = useState(!document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsLight(!document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return isLight;
};


// Compact Profile Component for Small Screens (Dual Mode)
const CompactProfile = () => {
  const isLight = useThemeCheck();
  const { user } = useUserContext();
  const { balance } = useWalletContext();

  const TC = {
    bgCard: isLight 
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textBalance: isLight ? "text-green-700" : "text-green-400",
    textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
  };
  
  return (
    <div className={`rounded-xl p-4 fade-in ${TC.bgCard}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-sm flex items-center justify-center font-bold text-white shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h3 className={`font-semibold text-sm truncate ${TC.textPrimary}`}>{user?.name || 'User'}</h3>
            <p className={`text-xs truncate ${TC.textSecondary}`}>{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`flex items-center gap-1 text-xs mb-1 ${TC.textSecondary}`}>
            <FaWallet className={`${TC.textIcon} text-xs`} />
            Balance
          </div>
          <p className={`font-bold text-sm ${TC.textBalance}`}>${balance?.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};



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
  const navigate = useNavigate();
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
  const [topCoins, setTopCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({});
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const ws = useRef(null);
  const liveDataRef = useRef({});

  // 💡 Theme Classes for Skeleton
  const TC = useMemo(() => ({
    skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
    skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
    bgSkeletonItem: isLight 
      ? "bg-white/90 shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
  }), [isLight]);

  // Handler for selecting coin for chart
  const handleCoinClick = (coinId) => {
    setSelectedCoinId(coinId);
  };


  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

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

  // WebSocket setup for live data (Logic remains the same, relies on dynamic ApexCharts options in ChartSection)
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

      ws.current.onopen = () => {
        console.log("WebSocket connected for top coins");
      };

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

      ws.current.onerror = (error) => { console.error("WebSocket error:", error); };
      ws.current.onclose = () => { console.log("WebSocket disconnected"); };
    } catch (error) { console.error("WebSocket setup failed:", error); }

    return () => {
      if (ws.current) { ws.current.close(); }
    };
  }, [topCoins]);


  // --- Large Screen Sidebar Item Heights (Perfectly Aligned with Compact Chart) ---
  
  // FIX: Compact Profile
  const USERDATA_HEIGHT = 'h-[150px]'; 

  // FIX: Redistribute remaining space (Total Target Height: ~764px)
  const CHART_HEIGHT = 'h-[620px]'; // Restored to original, more compact height

  // New height calculations to balance the 764px middle column height
  const PORTFOLIO_HEIGHT = 'h-[300px]'; 
  const TRADES_HEIGHT = 'h-[266px]'; 
  
  // Right sidebar balancing the left side
  const WATCHLIST_HEIGHT = 'h-[280px]';
  const TRENDING_HEIGHT = 'h-[250px]';
  const LEARNING_HUB_HEIGHT = 'h-[186px]';
  
  // Total height check (Left/Right): 150 + 300 + 266 + 2*24(gap-6) = 760px. Close enough to 764px target.
  // The small difference is likely absorbed by TopCoins component internal padding, achieving the required visual alignment.
  
  // Enhanced skeleton for the entire dashboard (Dual Mode)
  const renderDashboardSkeleton = () => (
    <div className={`min-h-screen p-2 sm:p-4 lg:p-6 fade-in ${isLight ? "text-gray-900" : "text-white"}`}>
      {/* Mobile & Medium Layout Skeleton (Same as before) */}
      <div className="xl:hidden flex flex-col gap-4">
        {/* Compact Profile Skeleton for Small Screens */}
        <div className="sm:hidden fade-in" style={{ animationDelay: "0.2s" }}>
          <div className={`rounded-xl p-4 h-20 ${TC.bgSkeletonItem}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton circle width={40} height={40} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                <div>
                  <Skeleton width={80} height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
                  <Skeleton width={120} height={12} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                </div>
              </div>
              <div>
                <Skeleton width={40} height={12} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
                <Skeleton width={60} height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Coins Skeleton - Single column bento style */}
        <div className="fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="space-y-1">
            <Skeleton width={100} height={20} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-3 ml-1" />
            <div className="grid grid-cols-1 gap-3">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className={`rounded-xl p-4 h-24 ${TC.bgSkeletonItem}`}>
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-3">
                      <Skeleton circle width={40} height={40} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                      <div>
                        <Skeleton width={60} height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
                        <Skeleton width={40} height={12} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                      </div>
                    </div>
                    <div className="text-right">
                      <Skeleton width={80} height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
                      <Skeleton width={50} height={12} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile sections for Medium screens */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="fade-in" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className={`rounded-xl p-6 h-48 ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-2" count={3} />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton - Visible on all screens */}
        <div className="fade-in" style={{ animationDelay: "0.6s" }}>
          <div className={`rounded-xl p-6 h-96 ${TC.bgSkeletonItem}`}>
            <Skeleton height={28} width={150} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
            <Skeleton height={280} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
          </div>
        </div>

        {/* Widgets Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="fade-in" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
              <div className={`rounded-xl p-6 h-64 ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={4} />
              </div>
            </div>
          ))}
        </div>

        {/* News Skeleton */}
        <div className="fade-in" style={{ animationDelay: "1.0s" }}>
          <div className={`rounded-xl p-6 h-64 ${TC.bgSkeletonItem}`}>
            <Skeleton height={28} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
            <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={5} />
          </div>
        </div>
      </div>

      {/* Large Screen Layout Skeleton */}
      <div className="hidden xl:flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-stretch">
          {/* Left Sidebar Skeleton (Normalized Heights) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className={`fade-in ${USERDATA_HEIGHT}`} style={{ animationDelay: "0.2s" }}>
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={2} />
              </div>
            </div>
            <div className={`fade-in ${PORTFOLIO_HEIGHT}`} style={{ animationDelay: "0.3s" }}>
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={4} />
              </div>
            </div>
            <div className={`fade-in ${TRADES_HEIGHT}`} style={{ animationDelay: "0.4s" }}>
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={4} />
              </div>
            </div>
          </div>

          {/* Middle Section Skeleton */}
          <div className="col-span-6 flex flex-col gap-6">
            {/* Top Coins Skeleton */}
            <div className="fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className={`rounded-xl p-6 h-32 ${TC.bgSkeletonItem}`}>
                    <Skeleton height={20} width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-3" />
                    <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-2" />
                    <Skeleton height={14} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Skeleton */}
            <div className={`fade-in ${CHART_HEIGHT}`} style={{ animationDelay: "0.6s" }}>
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton height={28} width={150} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={400} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton (Normalized Heights) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className={`fade-in ${WATCHLIST_HEIGHT}`} style={{ animationDelay: "0.8s" }}>
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={4} />
              </div>
            </div>
            <div className={`fade-in ${TRENDING_HEIGHT}`} style={{ animationDelay: "0.9s" }}>
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={4} />
              </div>
            </div>
            <div className={`fade-in ${LEARNING_HUB_HEIGHT}`} style={{ animationDelay: "1.0s" }}>
              <div className={`rounded-xl p-6 h-full ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - News Panel (No Fixed Height) */}
        <div className="fade-in" style={{ animationDelay: "0.7s" }}>
          <NewsPanel />
        </div>
      </div>
    </div>
  );

  if (loading && topCoins.length === 0) {
    return renderDashboardSkeleton();
  }

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 lg:p-6 fade-in ${isLight ? "text-gray-900" : "text-white"}`}
      style={{ animationDelay: "0.1s" }}
    >
      {/* Mobile & Medium Layout (Gaps reduced to 4) */}
      <div className="xl:hidden flex flex-col gap-4">
        {/* 1. Profile */}
        <div className="sm:hidden fade-in" style={{ animationDelay: "0.2s" }}>
          <CompactProfile />
        </div>
        <div className="hidden sm:block fade-in" style={{ animationDelay: "0.2s" }}>
          <Userdata
            showProfile={true}
            showPortfolio={false}
            showRecentTrades={false}
          />
        </div>

        {/* 2. Top Three Coins */}
        <div className="fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="space-y-1">
            <h2 className={`text-lg font-bold mb-3 px-1 ${isLight ? "text-gray-900" : "text-white"}`}>Top Cryptos</h2>
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
          <Userdata
            showProfile={false}
            showPortfolio={true}
            showRecentTrades={false}
          />
        </div>

        {/* 4. Watchlist & 5. Trending */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Userdata
            showProfile={false}
            showPortfolio={false}
            showRecentTrades={true}
          />
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
            <div className={`fade-in ${USERDATA_HEIGHT}`} style={{ animationDelay: "0.2s" }}>
              <Userdata
                showProfile={true}
                showPortfolio={false}
                showRecentTrades={false}
              />
            </div>
            <div className={`fade-in ${PORTFOLIO_HEIGHT}`} style={{ animationDelay: "0.3s" }}>
              <Userdata
                showProfile={false}
                showPortfolio={true}
                showRecentTrades={false}
              />
            </div>
            <div className={`fade-in ${TRADES_HEIGHT}`} style={{ animationDelay: "0.4s" }}>
              <Userdata
                showProfile={false}
                showPortfolio={false}
                showRecentTrades={true}
              />
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
            <div className={`fade-in ${CHART_HEIGHT}`} style={{ animationDelay: "0.6s" }}>
              <ChartSection coinId={selectedCoinId} />
            </div>
          </div>

          {/* Right Sidebar - Watchlist, Trending, Learning Hub (Normalized Heights) */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className={`fade-in ${WATCHLIST_HEIGHT}`} style={{ animationDelay: "0.8s" }}>
              <WatchlistPreview />
            </div>
            <div className={`fade-in ${TRENDING_HEIGHT}`} style={{ animationDelay: "0.9s" }}>
              <TrendingCoins />
            </div>
            <div className={`fade-in ${LEARNING_HUB_HEIGHT}`} style={{ animationDelay: "1.0s" }}>
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