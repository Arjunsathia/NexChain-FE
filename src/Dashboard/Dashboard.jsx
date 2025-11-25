import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Userdata from "./Userdata";
import ChartSection from "./ChartSection";
import NewsPanel from "./NewsPanel";
import TrendingCoins from "./TrendingCoins";
import LearningHub from "./LearningHub";
import { getCoins } from "@/api/coinApis";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import WatchlistPreview from "./WatchlistPreview";
import TopCoins from "./TopCoins";
import { FaWallet } from "react-icons/fa";
import useUserContext from '@/Context/UserContext/useUserContext';
import { useWalletContext } from '@/Context/WalletContext/useWalletContext';

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
    bgCard: isLight ? "bg-white border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textBalance: isLight ? "text-green-700" : "text-green-400",
    textIcon: isLight ? "text-cyan-600" : "text-cyan-400",
  };
  
  return (
    <div className={`rounded-xl p-4 fade-in border ${TC.bgCard}`}>
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
    bgSkeletonItem: isLight ? "bg-white/90 border-gray-300" : "bg-gray-800/50 backdrop-blur-sm border-gray-700",
  }), [isLight]);


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

  // Enhanced skeleton for the entire dashboard (Dual Mode)
  const renderDashboardSkeleton = () => (
    <div className={`min-h-screen p-4 lg:p-6 fade-in ${isLight ? "text-gray-900" : "text-white"}`}>
      {/* Mobile & Medium Layout Skeleton */}
      <div className="xl:hidden flex flex-col gap-4">
        {/* Compact Profile Skeleton for Small Screens */}
        <div className="sm:hidden fade-in" style={{ animationDelay: "0.2s" }}>
          <div className={`rounded-xl p-4 h-20 border ${TC.bgSkeletonItem}`}>
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
                <div key={i} className={`rounded-xl p-4 h-24 border ${TC.bgSkeletonItem}`}>
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
              <div className={`rounded-xl p-6 h-48 border ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-2" count={3} />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton - Visible on all screens */}
        <div className="fade-in" style={{ animationDelay: "0.6s" }}>
          <div className={`rounded-xl p-6 h-96 border ${TC.bgSkeletonItem}`}>
            <Skeleton height={28} width={150} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
            <Skeleton height={280} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
          </div>
        </div>

        {/* Widgets Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="fade-in" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>
              <div className={`rounded-xl p-6 h-64 border ${TC.bgSkeletonItem}`}>
                <Skeleton height={24} width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={4} />
              </div>
            </div>
          ))}
        </div>

        {/* News Skeleton */}
        <div className="fade-in" style={{ animationDelay: "1.0s" }}>
          <div className={`rounded-xl p-6 h-64 border ${TC.bgSkeletonItem}`}>
            <Skeleton height={28} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
            <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={5} />
          </div>
        </div>
      </div>

      {/* Large Screen Layout Skeleton */}
      <div className="hidden xl:flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar Skeleton */}
          <div className="col-span-3 flex flex-col gap-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="fade-in" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className={`rounded-xl p-6 h-48 border ${TC.bgSkeletonItem}`}>
                  <Skeleton height={24} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                  <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={3} />
                </div>
              </div>
            ))}
          </div>

          {/* Middle Section Skeleton */}
          <div className="col-span-6 flex flex-col gap-6">
            {/* Top Coins Skeleton */}
            <div className="fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className={`rounded-xl p-6 h-32 border ${TC.bgSkeletonItem}`}>
                    <Skeleton height={20} width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-3" />
                    <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-2" />
                    <Skeleton height={14} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Skeleton */}
            <div className="fade-in" style={{ animationDelay: "0.6s" }}>
              <div className={`rounded-xl p-6 h-96 border ${TC.bgSkeletonItem}`}>
                <Skeleton height={28} width={150} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                <Skeleton height={280} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
              </div>
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="col-span-3 flex flex-col gap-6">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="fade-in" style={{ animationDelay: `${0.8 + i * 0.1}s` }}>
                <div className={`rounded-xl p-6 h-48 border ${TC.bgSkeletonItem}`}>
                  <Skeleton height={24} width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
                  <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={3} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Panel Skeleton */}
        <div className="fade-in" style={{ animationDelay: "0.7s" }}>
          <div className={`rounded-xl p-6 h-64 border ${TC.bgSkeletonItem}`}>
            <Skeleton height={28} width={120} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-4" />
            <Skeleton height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} count={5} />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && topCoins.length === 0) {
    return renderDashboardSkeleton();
  }

  return (
    <div
      className={`min-h-screen p-4 lg:p-6 fade-in ${isLight ? "text-gray-900" : "text-white"}`}
      style={{ animationDelay: "0.1s" }}
    >
      {/* Mobile & Medium Layout */}
      <div className="xl:hidden flex flex-col gap-4">
        {/* Compact Profile Section for Small Screens */}
        <div className="sm:hidden fade-in" style={{ animationDelay: "0.2s" }}>
          <CompactProfile />
        </div>

        {/* Top Three Coins - Bento Grid Style */}
        <div className="fade-in" style={{ animationDelay: "0.5s" }}>
          <div className="space-y-1">
            <h2 className={`text-lg font-bold mb-3 px-1 ${isLight ? "text-gray-900" : "text-white"}`}>Top Cryptos</h2>
            <TopCoins
              topCoins={topCoins}
              selectedCoinId={selectedCoinId}
              setSelectedCoinId={setSelectedCoinId}
              isMobile={true}
              liveData={liveData}
              loading={loading}
            />
          </div>
        </div>

        {/* Profile sections for Medium screens */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="fade-in" style={{ animationDelay: "0.2s" }}>
            <Userdata
              showProfile={true}
              showPortfolio={false}
              showRecentTrades={false}
            />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.3s" }}>
            <Userdata
              showProfile={false}
              showPortfolio={true}
              showRecentTrades={false}
            />
          </div>
          <div className="fade-in" style={{ animationDelay: "0.4s" }}>
            <Userdata
              showProfile={false}
              showPortfolio={false}
              showRecentTrades={true}
            />
          </div>
        </div>

        {/* Chart Section - Visible on all screens */}
        <div className="fade-in" style={{ animationDelay: "0.6s" }}>
          <ChartSection coinId={selectedCoinId} />
        </div>

        {/* Other Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        {/* News Panel */}
        <div className="fade-in" style={{ animationDelay: "1.0s" }}>
          <NewsPanel />
        </div>
      </div>

      {/* Large Screen Layout (xl: 1280px+) */}
      <div className="hidden xl:flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Sidebar - Profile, Portfolio, Recent Trades */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className="fade-in" style={{ animationDelay: "0.2s" }}>
              <Userdata
                showProfile={true}
                showPortfolio={false}
                showRecentTrades={false}
              />
            </div>
            <div className="fade-in h-[380px]" style={{ animationDelay: "0.3s" }}>
              <Userdata
                showProfile={false}
                showPortfolio={true}
                showRecentTrades={false}
              />
            </div>
            <div className="fade-in h-[280px]" style={{ animationDelay: "0.4s" }}>
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
                setSelectedCoinId={setSelectedCoinId}
                isMobile={false}
                liveData={liveData}
                loading={loading}
              />
            </div>

            {/* Chart Section */}
            <div className="fade-in h-[620px]" style={{ animationDelay: "0.6s" }}>
              <ChartSection coinId={selectedCoinId} />
            </div>
          </div>

          {/* Right Sidebar - Watchlist, Trending, Learning Hub */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className="fade-in h-[280px]" style={{ animationDelay: "0.8s" }}>
              <WatchlistPreview />
            </div>
            <div className="fade-in h-[280px]" style={{ animationDelay: "0.9s" }}>
              <TrendingCoins />
            </div>
            <div className="fade-in h-[200px]" style={{ animationDelay: "1.0s" }}>
              <LearningHub />
            </div>
          </div>
        </div>

        {/* Bottom Section - News Panel */}
        <div className="fade-in h-[300px]" style={{ animationDelay: "0.7s" }}>
          <NewsPanel />
        </div>
      </div>
    </div>
  );
}