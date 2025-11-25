import React, { useMemo, useState, useEffect } from 'react'
import { FaArrowUp, FaArrowDown, FaChartLine } from 'react-icons/fa'

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

function PriceCard({ coin, price, change, volume, marketCap, isLive = false }) {
  const isLight = useThemeCheck();
  const isPositive = change >= 0;
  
  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    bgContainer: isLight 
        ? "bg-white border-gray-300 shadow-xl hover:border-cyan-600/50" 
        : "bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 shadow-2xl hover:border-cyan-400/30",
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    bgIcon: isLight ? "p-2 bg-cyan-100 rounded-xl border border-cyan-300" : "p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20",
    iconColor: isLight ? "text-cyan-600" : "text-cyan-400",
    
    // Live Indicator
    liveBg: isLight ? "bg-green-100 text-green-700" : "bg-green-400 text-green-400",
    liveDot: isLight ? "bg-green-600" : "bg-green-400",
    
    // Change Pill
    bgPillPositive: isLight ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-100/70" : "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
    bgPillNegative: isLight ? "bg-red-100 text-red-700 border-red-300 hover:bg-red-100/70" : "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    
    // Footer/Border
    borderFooter: isLight ? "border-gray-300" : "border-gray-600/50",
    trendDot: isLight ? "bg-green-600" : "bg-green-400",
    trendText: isLight ? "text-gray-600" : "text-gray-400",
    hoverOverlay: isLight ? "bg-cyan-500/10" : "bg-cyan-500/5",
  }), [isLight]);
  
  const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    // Ensure price formatting is clean, especially for small values
    if (typeof num === 'number') return `$${num?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) || '0.00'}`;
    return price; // Return raw string price if not a number
  };

  const getPillClasses = isPositive ? TC.bgPillPositive : TC.bgPillNegative;
  const trendDotColor = isPositive ? TC.trendDot : "bg-red-600"; // Red dot for negative trend

  return (
    <div className={`backdrop-blur-sm border-2 shadow-2xl rounded-2xl p-5 text-center transition-all duration-300 hover:scale-105 group fade-in relative overflow-hidden ${TC.bgContainer}`} style={{ animationDelay: "0.1s" }}>
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full animate-pulse ${TC.liveDot}`}></div>
          <span className={`text-xs font-bold ${TC.liveBg}`}>LIVE</span>
        </div>
      )}

      {/* Background Pattern - Removed for cleaner light mode transition, rely on box shadow */}
      {/* <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent"></div> */}
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3 fade-in" style={{ animationDelay: "0.2s" }}>
          <div className={TC.bgIcon}>
            <FaChartLine className={TC.iconColor + " text-sm"} />
          </div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent fade-in" style={{ animationDelay: "0.3s" }}>
            {coin}
          </h2>
        </div>

        {/* Price */}
        <p className={`text-2xl font-bold mb-3 fade-in transition-colors ${TC.textPrimary} ${isLight ? "group-hover:text-cyan-700" : "group-hover:text-cyan-300"}`} style={{ animationDelay: "0.4s" }}>
          {formatNumber(price)}
        </p>

        {/* Change Percentage */}
        <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold mb-3 border transition-all duration-300 ${getPillClasses} fade-in`} style={{ animationDelay: "0.5s" }}>
          {isPositive ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />}
          {isPositive ? '+' : ''}{change}%
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-3 mt-4 fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="text-left">
            <p className={`text-xs mb-1 ${TC.textSecondary}`}>24h Volume</p>
            <p className={`font-semibold text-sm ${TC.textPrimary}`}>{formatNumber(volume)}</p>
          </div>
          <div className="text-right">
            <p className={`text-xs mb-1 ${TC.textSecondary}`}>Market Cap</p>
            <p className={`font-semibold text-sm ${TC.textPrimary}`}>{formatNumber(marketCap)}</p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`mt-3 pt-3 border-t ${TC.borderFooter} fade-in`} style={{ animationDelay: "0.7s" }}>
          <div className="flex items-center justify-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${trendDotColor}`}></div>
            <span className={TC.trendText}>
              {isPositive ? 'Bullish' : 'Bearish'} Trend
            </span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl ${TC.hoverOverlay}`}></div>
    </div>
  );
}

export default PriceCard