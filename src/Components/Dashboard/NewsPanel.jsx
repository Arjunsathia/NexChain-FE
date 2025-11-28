import React, { useMemo, useState, useEffect } from 'react';
import { FaNewspaper, FaArrowRight } from "react-icons/fa";

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

function NewsPanel() {
  const isLight = useThemeCheck();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // 💡 Theme Classes Helper (UPDATED: no border on container, stronger shadow in light mode)
  const TC = useMemo(() => ({
    // Main container: no border here
    bgContainer: isLight
      ? "bg-white shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20",

    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgIcon: isLight ? "p-1.5 bg-purple-100 rounded-lg" : "p-1.5 bg-purple-400/10 rounded-lg",
    iconColor: isLight ? "text-purple-600" : "text-purple-400",
    
    // News Items (no border color here, border handled separately via border-l-2)
    bgItem: isLight
      ? "bg-gray-100/70 hover:bg-gray-200/90"
      : "bg-gray-700/30 hover:bg-gray-700/50",

    textSource: isLight ? "text-cyan-600" : "text-cyan-400",
    textTime: isLight ? "text-gray-500" : "text-gray-400",
    
    // Footer Button (Light cyan hover)
    bgFooterButton: isLight 
      ? "bg-gray-200 border-gray-300 hover:bg-cyan-100/70 hover:border-cyan-500"
      : "bg-gray-700/30 border-gray-600 hover:bg-cyan-900/40 hover:border-cyan-400",

    borderFooter: isLight ? "border-gray-300" : "border-gray-700",

    textFooterButton: isLight ? "text-cyan-600" : "text-cyan-400",
    textHoverAccent: isLight 
      ? "group-hover:text-cyan-700"
      : "group-hover:text-cyan-300",
  }), [isLight]);

  const newsItems = [
    {
      title: "Bitcoin ETF Approval Boosts Market Confidence",
      source: "Crypto Daily",
      time: "2 hours ago"
    },
    {
      title: "Ethereum Upgrade Significantly Reduces Gas Fees",
      source: "Blockchain News",
      time: "5 hours ago"
    },
    {
      title: "Major Exchange Announces Zero Trading Fees Campaign",
      source: "Finance Times",
      time: "1 day ago"
    },
    {
      title: "Solana Network Achieves Record Transaction Speed",
      source: "Tech Crypto",
      time: "3 hours ago"
    },
    {
      title: "Regulatory Framework Update for Digital Assets",
      source: "Crypto Policy",
      time: "6 hours ago"
    },
    {
      title: "DeFi Protocol Reaches $1B Total Value Locked",
      source: "DeFi News",
      time: "8 hours ago"
    }
  ];

  return (
    <div
      className={`
        rounded-xl p-4 h-full flex flex-col fade-in
        ${TC.bgContainer}
        ${isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
      style={{ transition: "opacity 0.3s ease, transform 0.3s ease" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 fade-in">
        <div className="flex items-center gap-2">
          <div className={TC.bgIcon}>
            <FaNewspaper className={TC.iconColor + " text-sm"} />
          </div>
          <h2 className="text-base font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Crypto News
          </h2>
        </div>
      </div>
      
      {/* Scrollable News List */}
      <div className="flex-1 min-h-0">
        <div className="h-full overflow-y-auto scrollbar-hide grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {newsItems.map((news, index) => (
            <div 
              key={index} 
              className={`
                border-l-2 pl-3 py-2 rounded-r-lg
                transition-all duration-200 cursor-pointer group fade-in
                flex flex-col justify-between h-full
                ${TC.bgItem}
                ${isLight ? "border-purple-600 hover:border-cyan-600" : "border-purple-500 hover:border-cyan-500"}
              `}
              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
            >
              <h3
                className={`
                  font-semibold text-xs mb-1.5 transition-colors
                  line-clamp-2 leading-tight
                  ${TC.textPrimary}
                  ${isLight ? "group-hover:text-cyan-700" : "group-hover:text-cyan-300"}
                `}
              >
                {news.title}
              </h3>
              <div className="flex justify-between items-center text-xs mt-auto">
                <span className={`text-xs ${TC.textSource}`}>{news.source}</span>
                <span className={`text-xs ${TC.textTime}`}>{news.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer (Button with light cyan hover) */}
      <button 
        className={`
          w-full mt-3 text-xs font-semibold py-2 rounded-lg transition-all duration-200 
          flex items-center justify-center gap-1 group fade-in border 
          ${TC.bgFooterButton} 
          ${TC.textFooterButton}
          ${TC.textHoverAccent} 
        `}
      >
        View All News
        <FaArrowRight className="text-xs group-hover:translate-x-0.5 transition-transform duration-200" />
      </button>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default NewsPanel;
