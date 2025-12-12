import React, { useCallback, useEffect, useState, useMemo } from "react";
import SparklineGraph from "../Components/Crypto/SparklineGraph";
import CoinTable from "../Components/Crypto/CoinTable";
import NewsSection from "../Components/Crypto/NewsSection";
import TopGainers from "@/Components/Crypto/TopGainers";
import TrendingCoins from "@/Components/Crypto/TrendingCoins";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { getGlobalMarketStats } from "@/api/coinApis";
import TradeModal from "@/Components/Common/TradeModal";
import PriceAlertModal from "@/Components/Common/PriceAlertModal";
import { usePurchasedCoins } from "@/hooks/usePurchasedCoins";
import { FaGlobeAmericas, FaChartLine, FaFire, FaLayerGroup } from "react-icons/fa";

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

function CryptoList() {
  const isLight = useThemeCheck();
  const [globalData, setGlobalData] = useState({});
  const [loading, setLoading] = useState(true);
  const { purchasedCoins } = usePurchasedCoins();

  // START CHANGE: State for controlled main component fade-in
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100); // Small delay to ensure CSS classes load
    return () => clearTimeout(timer);
  }, []);
  // END CHANGE

  // Trade Modal state at the top level
  const [tradeModal, setTradeModal] = useState({
    show: false,
    coin: null,
    type: "buy",
  });

  const [alertModal, setAlertModal] = useState({
    show: false,
    coin: null,
  });

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    // General text colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",
    
    // Backgrounds
    bgPage: isLight ? "bg-gray-50" : "bg-gray-900",
    bgCard: isLight 
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",
    bgHeader: isLight ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-gray-900/80 backdrop-blur-md shadow-md",
    
    // Accents
    accentGradient: isLight ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-gradient-to-r from-blue-500 to-cyan-400",
    textAccent: isLight ? "text-blue-600" : "text-cyan-400",
    
    // Skeleton Loaders
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
    
    // Pill Colors
    bgPillPositive: isLight ? "bg-green-100 text-green-700 border-green-200" : "bg-green-500/10 text-green-400 border-green-500/20",
    bgPillNegative: isLight ? "bg-red-100 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20",
    
    // Icons
    iconBg: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400",
    
  }), [isLight]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getGlobalMarketStats();
      setGlobalData(res);
    } catch (err) {
      console.error("Failed to fetch global market stats", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for trade button clicks from CoinTable
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

  // Handler for closing modal
  const handleCloseModal = useCallback(() => {
    setTradeModal({
      show: false,
      coin: null,
      type: "buy",
    });
  }, []);

  const handleCloseAlertModal = useCallback(() => {
    setAlertModal({
      show: false,
      coin: null,
    });
  }, []);

  // Determine pill classes based on value
  const getPillClasses = (value) => {
    return value < 0 ? TC.bgPillNegative : TC.bgPillPositive;
  };

  // Helper for compact number formatting
  const formatCompactNumber = (number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(number);
  };

  return (
    // Applied transition to the main wrapper using isMounted state
    <div className={`min-h-screen ${TC.textPrimary} p-2 sm:p-4 lg:p-6 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* 1. Header Section */}
     <div 
  // This header already uses its own animation classes and will fade in with the main content
  className={`
    sticky top-2 z-40 
    max-w-7xl mx-auto 
    rounded-xl shadow-md
    ${TC.bgHeader} 
    transition-colors duration-300
    p-0 
  `}
>
  <div className="px-4 lg:px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${TC.iconBg}`}>
          <FaLayerGroup className="text-lg" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-none">Market Overview</h1>
          <p className={`text-xs mt-1 ${TC.textSecondary}`}>Global Crypto Metrics & Trends</p>
        </div>
      </div>
      
      {/* Quick Global Stats (Visible on Desktop) */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <div className="flex flex-col items-end">
          <span className={TC.textTertiary}>Market Cap</span>
          <span className="font-semibold">
            {loading ? <Skeleton width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : `$${formatCompactNumber(globalData?.total_market_cap?.usd)}`}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className={TC.textTertiary}>24h Volume</span>
          <span className="font-semibold">
            {loading ? <Skeleton width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : `$${formatCompactNumber(globalData?.total_volume?.usd)}`}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

      <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-6 py-8 space-y-8">
        
        {/* 2. Bento Grid Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Global Market Card (Large) - Added 'fade-in' class */}
          <div className={`lg:col-span-4 rounded-lg md:rounded-2xl p-3 md:p-6 transition-all duration-300 hover:shadow-lg ${TC.bgCard} group fade-in h-full flex flex-col justify-between`} style={{ transitionDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/10 text-indigo-400"}`}>
                  <FaGlobeAmericas />
                </div>
                <h3 className="text-sm sm:text-base font-bold">Global Market</h3>
              </div>
              {!loading && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getPillClasses(globalData?.market_cap_change_percentage_24h_usd)}`}>
                  {globalData?.market_cap_change_percentage_24h_usd >= 0 ? "+" : ""}
                  {globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
                </span>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6 flex-1 flex flex-col justify-center">
              <div>
                <p className={`text-xs sm:text-sm mb-1 ${TC.textTertiary}`}>Total Market Cap</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {loading ? <Skeleton width={180} height={36} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : `$${formatCompactNumber(globalData?.total_market_cap?.usd)}`}
                </h2>
              </div>
              
              <div className="h-10 sm:h-16 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                 {/* Decorative Sparkline Placeholder or Real Graph */}
                 {loading ? <Skeleton height="100%" baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : <SparklineGraph />}
              </div>

              <div className="pt-4 border-t border-gray-200/10 flex justify-between items-center text-xs sm:text-sm">
                 <span className={TC.textSecondary}>24h Volume</span>
                 <span className={`font-mono font-semibold ${TC.textPrimary}`}>
                    {loading ? <Skeleton width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : `$${formatCompactNumber(globalData?.total_volume?.usd)}`}
                 </span>
              </div>
            </div>
          </div>

          {/* Trending Coins (Medium) - Added 'fade-in' class */}
          <div className="lg:col-span-4 flex flex-col h-full fade-in" style={{ transitionDelay: '0.2s' }}>
             <TrendingCoins />
          </div>

          {/* Top Gainers (Medium) - Added 'fade-in' class */}
          <div className="lg:col-span-4 flex flex-col h-full fade-in" style={{ transitionDelay: '0.3s' }}>
             <TopGainers />
          </div>
        </div>

        {/* 3. Main Coin List Section - Added 'fade-in' class */}
        <div className="fade-in" style={{ transitionDelay: '0.4s' }}>
           <CoinTable onTrade={handleTrade} />
        </div>

        {/* 4. News Section - Added 'fade-in' class */}
        <div className="pt-8 border-t border-gray-200/10 fade-in" style={{ transitionDelay: '0.5s' }}>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FaFire className="text-orange-500" />
            Latest Crypto News
          </h2>
          <NewsSection />
        </div>

      </div>

      {/* Trade Modal */}
      <TradeModal
        show={tradeModal.show}
        onClose={handleCloseModal}
        coin={tradeModal.coin}
        type={tradeModal.type}
        purchasedCoins={purchasedCoins}
      />

      {/* Price Alert Modal */}
      <PriceAlertModal
        show={alertModal.show}
        onClose={handleCloseAlertModal}
        coin={alertModal.coin}
      />
    </div>
  );
}

export default CryptoList;