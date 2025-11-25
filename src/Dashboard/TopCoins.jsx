import React, { useState, useEffect, useCallback, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaCrown, FaTrophy, FaAward, FaCoins } from "react-icons/fa";

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

// Memoized Bento Coin Card Component (Dual Mode)
const BentoCoinCard = React.memo(
  ({ coin, index, isSelected, onSelect, isMobile, liveData, isLoading }) => {
    const isLight = useThemeCheck();

    const TC = useMemo(() => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-600" : "text-gray-400",
      skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
      skeletonHighlight: isLight ? "#f3f4f6" : "#374151",
      // Pill colors (no change)
      bgPLPositive: isLight ? "bg-green-100 text-green-700 border-green-300" : "bg-green-500/20 text-green-400 border-green-500/30",
      bgPLNegative: isLight ? "bg-red-100 text-red-700 border-red-300" : "bg-red-500/20 text-red-400 border-red-500/30",
      // Rank colors (no change)
      rankGold: isLight ? "text-yellow-600" : "text-yellow-400",
      rankSilver: isLight ? "text-gray-500" : "text-gray-300",
      rankBronze: isLight ? "text-orange-600" : "text-orange-400",
      
      // Background base (no change)
      bgBase: isLight ? "bg-gray-50 border-gray-200" : "bg-gray-800/70 border-gray-700",
      
      // Hover/Selected state (Reduced shadow and ring intensity)
      ringSelected: isLight ? "ring-1 ring-cyan-500 shadow-md shadow-cyan-500/20" : "ring-1 ring-cyan-400 shadow-md shadow-cyan-400/15",
      hoverEffect: isLight ? "hover:scale-[1.02] hover:shadow-sm hover:border-cyan-300" : "hover:scale-[1.02] hover:shadow-sm hover:border-cyan-500",
      
      // Inner hover (no change)
      textHover: isLight ? "group-hover:text-cyan-700" : "group-hover:text-cyan-400",
      // Price color (no change)
      priceColor: isLight ? "text-cyan-700" : "text-cyan-400",
      
      // Icon Circle background (more subtle)
      bgIconCircle: isLight ? "bg-white border-gray-200" : "bg-gray-800 border-gray-700",
      
      // Rank Accent Gradients (More subtle backgrounds and borders)
      rankAccent: (index) => {
        if (index === 0) return isLight ? "bg-yellow-50/50 border-yellow-200" : "bg-yellow-900/10 border-yellow-700/50";
        if (index === 1) return isLight ? "bg-gray-50/50 border-gray-200" : "bg-gray-900/10 border-gray-700/50";
        if (index === 2) return isLight ? "bg-orange-50/50 border-orange-200" : "bg-orange-900/10 border-orange-700/50";
        return isLight ? "bg-white border-gray-200" : "bg-gray-800/70 border-gray-700"; // Default, even more minimal
      }
      
    }), [isLight]);


    const formatPrice = useCallback((price) => {
      if (price === null || price === undefined) return "Loading...";

      const numPrice = typeof price === "number" ? price : parseFloat(price);
      if (isNaN(numPrice)) return "Loading...";

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: numPrice < 1 ? 4 : 2,
        maximumFractionDigits: numPrice < 1 ? 4 : 2,
      }).format(numPrice);
    }, []);

    const getDisplayPrice = useCallback(() => {
      if (liveData && liveData.price !== undefined) {
        return formatPrice(liveData.price);
      }
      return formatPrice(coin.current_price);
    }, [liveData, coin.current_price, formatPrice]);

    const getDisplayChange = useCallback(() => {
      if (liveData && liveData.change !== undefined) {
        return liveData.change;
      }
      return coin.price_change_percentage_24h || 0;
    }, [liveData, coin.price_change_percentage_24h]);

    const getIsPositive = useCallback(() => {
      if (liveData && liveData.isPositive !== undefined) {
        return liveData.isPositive;
      }
      return (coin.price_change_percentage_24h || 0) >= 0;
    }, [liveData, coin.price_change_percentage_24h]);

    const displayPrice = getDisplayPrice();
    const displayChange = getDisplayChange();
    const isPositive = getIsPositive();

    // Simplified Card Styling for a cleaner look
    const getCardStyling = () => {
      // Removed `shadow-md` for a more minimal look
      const base = `border rounded-xl transition-all duration-300`; 
      const accent = TC.rankAccent(index);
      return `${base} ${accent}`;
    };

    // Different icons for each position (Themed)
    const getPositionIcon = () => {
      switch(index) {
        case 0:
          return <FaCrown className={`w-3.5 h-3.5 ${TC.rankGold}`} />;
        case 1:
          return <FaTrophy className={`w-3.5 h-3.5 ${TC.rankSilver}`} />;
        case 2:
          return <FaAward className={`w-3.5 h-3.5 ${TC.rankBronze}`} />;
        default:
          return <FaCoins className={`w-3.5 h-3.5 ${TC.priceColor}`} />;
      }
    };

    // Responsive size classes
    const getCardSizeClasses = () => {
      if (isMobile) {
        return "w-full h-24 p-3"; // More compact for mobile
      }
      return "w-full h-32 p-4";
    };

    if (isLoading) {
      return (
        <div className={`${getCardStyling()} ${getCardSizeClasses()} ${TC.bgBase}`}>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton circle width={32} height={32} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            <div className="flex-1">
              <Skeleton width={50} height={14} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
              <Skeleton width={35} height={10} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            </div>
          </div>
          <Skeleton width={70} height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
          <Skeleton width={50} height={12} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
        </div>
      );
    }

    return (
      <div
        onClick={() => onSelect(coin.id)}
        className={`relative cursor-pointer ${getCardStyling()} ${TC.textPrimary} ${
          isSelected
            ? `${TC.ringSelected}`
            : TC.hoverEffect
        } ${getCardSizeClasses()} group`}
        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
      >
        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {/* Header with Icon and Symbol */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className={`w-8 h-8 rounded-full transition-transform duration-300 border ${isLight ? "border-gray-300" : "border-gray-600"}`}
                />
                <div className={`absolute -top-1 -right-1 rounded-full p-0.5 border ${TC.bgIconCircle}`}>
                  {getPositionIcon()}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold text-sm transition-colors truncate ${TC.textPrimary} ${TC.textHover}`}>
                  {coin.symbol.toUpperCase()}
                </h3>
                <p className={`text-xs truncate ${TC.textSecondary}`}>{coin.name}</p>
              </div>
            </div>
             {/* Rank Number (Visible only on desktop/tablet) */}
            <div className={`hidden sm:block text-sm font-semibold ${TC.textSecondary}`}>
                #{index + 1}
            </div>
          </div>

          {/* Price and Change */}
          <div className="flex items-end justify-between mt-2">
            <div className="min-w-0 flex-1">
              <p className={`text-lg font-bold transition-colors truncate ${TC.priceColor} ${TC.textHover}`}>
                {displayPrice}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border transition-colors duration-200 ${
                  isPositive ? TC.bgPLPositive : TC.bgPLNegative
                }`}
              >
                {/* Changed arrow icons to + / - for a simpler look */}
                {isPositive ? "+" : "-"}
                {Math.abs(displayChange).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Selected Ring and Shadow Effect */}
        <div className={`absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none ${
          isSelected ? `${TC.ringSelected}` : ''
        }`}></div>
      </div>
    );
  }
);

BentoCoinCard.displayName = "BentoCoinCard";

// Memoized TopCoins Component (Dual Mode)
const TopCoins = React.memo(
  ({
    topCoins,
    selectedCoinId,
    setSelectedCoinId,
    isMobile,
    liveData,
    loading,
  }) => {
    // Determine grid classes based on whether it's mobile or not
    const gridClasses = useMemo(() => {
        return isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3";
    }, [isMobile]);
    
    if (loading) {
      return (
        <div className={`grid gap-3 w-full ${gridClasses}`}>
          {[1, 2, 3].map((_, i) => (
            <BentoCoinCard
              key={i}
              coin={{}}
              index={i}
              isSelected={false}
              onSelect={() => {}}
              isMobile={isMobile}
              liveData={{}}
              isLoading={true}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={`grid gap-3 w-full ${gridClasses}`}>
        {topCoins.map((coin, index) => (
          <BentoCoinCard
            key={coin.id}
            coin={coin}
            index={index}
            isSelected={selectedCoinId === coin.id}
            onSelect={setSelectedCoinId}
            isMobile={isMobile}
            liveData={liveData[coin.id]}
            isLoading={false}
          />
        ))}
      </div>
    );
  }
);

TopCoins.displayName = "TopCoins";

export default TopCoins;