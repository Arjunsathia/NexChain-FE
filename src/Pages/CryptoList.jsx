import useThemeCheck from '@/hooks/useThemeCheck';
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
    type: "buy",
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
      ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100" 
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl border border-gray-700/50",
    bgHeader: isLight ? "bg-white/80 backdrop-blur-md shadow-sm border border-gray-100" : "bg-gray-900/80 backdrop-blur-md shadow-md border-b border-gray-800",
    
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
    iconBg: isLight ? "bg-indigo-50 text-indigo-600" : "bg-indigo-500/10 text-indigo-400",
    
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
    setTradeModal(prev => ({
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
        
        {/* 2. Three Cards Section (Global, Trending, Gainers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          
          {/* Global Market Card (Inlined) */}
          <div className={`rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group ${TC.bgCard} fade-in`} style={{ animationDelay: '0s' }}>
             <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
                <FaGlobeAmericas size={80} />
             </div>
             
             <div>
                <div className="flex items-center gap-2 mb-4">
                   <div className={`p-2 rounded-lg ${TC.iconBg}`}>
                      <FaGlobeAmericas className="text-lg" />
                   </div>
                   <h3 className={`font-bold text-lg ${TC.textPrimary}`}>Global Market</h3>
                </div>

                <div className="space-y-1 mb-6">
                   <p className={`text-sm font-medium ${TC.textSecondary}`}>Total Market Cap</p>
                   <div className="flex items-end gap-3">
                      <h2 className={`text-3xl font-bold ${TC.textPrimary}`}>
                         {loading ? <Skeleton width={140} /> : `$${formatCompactNumber(globalData?.total_market_cap?.usd)}`}
                      </h2>
                      {!loading && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getPillClasses(globalData?.market_cap_change_percentage_24h_usd)} flex items-center`}>
                           {globalData?.market_cap_change_percentage_24h_usd >= 0 ? "+" : ""}
                           {globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
                        </span>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className={`text-xs ${TC.textSecondary} mb-1`}>24h Volume</p>
                      <p className={`font-semibold ${TC.textPrimary}`}>
                         {loading ? <Skeleton width={80} /> : `$${formatCompactNumber(globalData?.total_volume?.usd)}`}
                      </p>
                   </div>
                   <div>
                      <p className={`text-xs ${TC.textSecondary} mb-1`}>BTC Dominance</p>
                      <p className={`font-semibold ${TC.textPrimary}`}>
                         {loading ? <Skeleton width={60} /> : `${globalData?.market_cap_percentage?.btc?.toFixed(1)}%`}
                      </p>
                   </div>
                </div>
             </div>

             <div className="mt-4 h-16 w-full opacity-60">
                 {!loading && <SparklineGraph color={isLight ? "#4f46e5" : "#6366f1"} />}
             </div>
          </div>

          {/* Trending Coins */}
          <div className="flex flex-col h-full fade-in" style={{ animationDelay: '0.05s' }}>
             {/* Using the Dashboard component directly but it might have its own border/style. 
                 The request implies a "new and minimal look", meaning standardising these.
                 TrendingCoins component has its own card wrapper. 
                 Since we can't easily strip its styles without modifying it heavily, 
                 we ensure it sits nicely in the grid.
             */}
             <TrendingCoins />
          </div>

          {/* Top Gainers */}
          <div className="flex flex-col h-full fade-in" style={{ animationDelay: '0.1s' }}>
             <TopGainers />
          </div>
        </div>

        {/* 3. Main Coin List Section - Added 'fade-in' class */}
        <div className="fade-in" style={{ animationDelay: '0.15s' }}>
           <CoinTable onTrade={handleTrade} />
        </div>

        {/* 4. News Section - Added 'fade-in' class */}
        <div className="pt-8 border-t border-gray-200/10 fade-in" style={{ animationDelay: '0.2s' }}>
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