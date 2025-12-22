import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaCrown, FaTrophy, FaAward, FaCoins } from "react-icons/fa";




const BentoCoinCard = React.memo(
  ({ coin, index, isSelected, onSelect, isMobile, liveData, isLoading }) => {
    const isLight = useThemeCheck();

    const TC = useMemo(
      () => ({
        textPrimary: isLight ? "text-gray-900" : "text-white",
        textSecondary: isLight ? "text-gray-500" : "text-gray-400",

        
        skeletonBase: isLight ? "#e5e7eb" : "#2d3748",
        skeletonHighlight: isLight ? "#f3f4f6" : "#374151",

        
        bgPLPositive: isLight
          ? "text-green-600 bg-green-100/50"
          : "text-green-400 bg-green-500/10",
        bgPLNegative: isLight
          ? "text-red-600 bg-red-100/50"
          : "text-red-400 bg-red-500/10",

        
        bgBase: isLight
          ? "bg-white/70 backdrop-blur-xl shadow-[0_6px_25px_rgba(0,0,0,0.12),0_0_10px_rgba(0,0,0,0.04)] border border-gray-100"
          : "bg-gray-800/50 backdrop-blur-xl shadow-xl border border-gray-700/50",

        
        selectedState: isLight
          ? "bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20 scale-105 z-10"
          : "bg-gradient-to-br from-gray-800 to-gray-800/80 border border-cyan-400 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400/20 scale-105 z-10",

        
        hoverEffect: isLight
          ? "hover:bg-white/90 hover:border-gray-300"
          : "hover:bg-gray-800/80 hover:border-gray-600",
        
        
        priceColor: isLight ? "text-gray-900" : "text-white",

        
        rankIconColor: (idx) => {
             if (idx === 0) return "text-yellow-500";
             if (idx === 1) return "text-gray-400";
             if (idx === 2) return "text-orange-500";
             return isLight ? "text-cyan-600" : "text-cyan-400";
        }
      }),
      [isLight]
    );

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

    
    const getPositionIcon = () => {
      const colorClass = TC.rankIconColor(index);
      switch (index) {
        case 0: return <FaCrown className={`w-3 h-3 ${colorClass}`} />;
        case 1: return <FaTrophy className={`w-3 h-3 ${colorClass}`} />;
        case 2: return <FaAward className={`w-3 h-3 ${colorClass}`} />;
        default: return <FaCoins className={`w-3 h-3 ${colorClass}`} />;
      }
    };

    if (isLoading) {
      return (
        <div className={`rounded-xl p-3 flex flex-col justify-between h-28 ${TC.bgBase}`}>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton circle width={32} height={32} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            <div className="flex-1">
              <Skeleton width={50} height={14} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
              <Skeleton width={35} height={10} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            </div>
          </div>
          <Skeleton width={70} height={16} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} className="mb-1" />
        </div>
      );
    }

    return (
      <div
        onClick={() => onSelect(coin.id)}
        className={`
          relative cursor-pointer fade-in rounded-xl p-3 h-28 flex flex-col justify-between transition-all duration-200
          ${isSelected ? TC.selectedState : `${TC.bgBase} ${TC.hoverEffect}`}
        `}
        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
      >
        {}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                   <h3 className={`font-bold text-sm leading-tight ${TC.textPrimary}`}>{coin.symbol.toUpperCase()}</h3>
                   <p className={`text-[10px] ${TC.textSecondary} truncate max-w-[80px]`}>{coin.name}</p>
                </div>
            </div>
            <div className={`p-1 rounded-full bg-opacity-10 ${index === 0 ? "bg-yellow-500/10" : "bg-gray-500/10"}`}>
               {getPositionIcon()}
            </div>
        </div>

        {}
        <div className="mt-2">
            <p className={`text-lg font-bold ${TC.priceColor}`}>{displayPrice}</p>
            <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPositive ? TC.bgPLPositive : TC.bgPLNegative}`}>
                   {isPositive ? "+" : ""}{Math.abs(displayChange).toFixed(2)}%
                </span>
            </div>
        </div>
      </div>
    );
  }
);

BentoCoinCard.displayName = "BentoCoinCard";


const TopCoins = React.memo(
  ({ topCoins, selectedCoinId, setSelectedCoinId, isMobile, liveData, loading }) => {
    
    const containerClasses = useMemo(() => {
      return isMobile 
        ? "grid grid-cols-1 gap-3 w-full" 
        : "grid grid-cols-1 md:grid-cols-3 gap-3 w-full";
    }, [isMobile]);

    if (loading) {
      return (
        <div className={containerClasses}>
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
      <div className={containerClasses}>
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
