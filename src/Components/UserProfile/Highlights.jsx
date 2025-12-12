import React, { useMemo, useState, useEffect } from "react";
import useCoinContext from '@/Context/CoinContext/useCoinContext';
import { FaArrowUp, FaFire } from "react-icons/fa";

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

function Highlights() {
  const isLight = useThemeCheck();
  const { coins } = useCoinContext();

  // 💡 Theme Classes Helper
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    textTertiary: isLight ? "text-gray-500" : "text-gray-500",

    bgCard: isLight ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)] border-none" : "bg-gray-800/50 backdrop-blur-xl shadow-xl shadow-black/20 border-none",
    bgIcon: isLight ? "bg-green-100" : "bg-green-500/10",
    iconColor: isLight ? "text-green-700" : "text-green-400",
    headerGradient: "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent",

    bgItem: isLight ? "bg-gray-100/70 border-none hover:bg-gray-100 shadow-sm" : "bg-gray-700/30 border-none hover:bg-gray-700/50 shadow-inner",
    textItemHover: isLight ? "group-hover:text-green-700" : "group-hover:text-green-300",
    textValue: isLight ? "text-green-700" : "text-green-400",
    
    // Price
    textPrice: isLight ? "text-gray-800" : "text-gray-300",
  }), [isLight]);

  
  const topGainers = useMemo(() => {
    const list = Array.isArray(coins) ? coins : [];
    return [...list]
      .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 5);
  }, [coins]);

  return (
    <div className={`${TC.bgCard} rounded-lg sm:rounded-xl p-3 sm:p-5 h-full fade-in`}>
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4 fade-in">
        <div className={`p-1.5 sm:p-2 rounded-lg ${TC.bgIcon}`}>
          <FaFire className={`text-base sm:text-lg ${TC.iconColor}`} />
        </div>
        <div>
          <h2 className={`text-base sm:text-lg font-bold ${TC.headerGradient}`}>
            Top Gainers
          </h2>
          <p className={`text-[10px] sm:text-xs ${TC.textSecondary}`}>
            Best performing coins (24h)
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 sm:space-y-3">
        {topGainers.map((coin, index) => (
          <div
            key={coin?.id ?? coin?.symbol ?? index}
            className={`flex items-center justify-between p-2 sm:p-3 rounded-lg ${TC.bgItem} transition-all duration-200 group cursor-pointer fade-in`}
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <img
                src={coin?.image}
                alt={coin?.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
              />
              <div className="min-w-0 flex-1">
                <span className={`font-semibold text-xs sm:text-sm transition-colors truncate block ${TC.textPrimary} ${TC.textItemHover}`}>
                  {coin?.name ?? 'Unknown'}
                </span>
                <span className={`text-[10px] sm:text-xs uppercase ${TC.textSecondary}`}>
                  {coin?.symbol?.toUpperCase() ?? ''}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className={`flex items-center gap-1 font-bold text-xs sm:text-sm ${TC.textValue}`}>
                <FaArrowUp className="text-[10px] sm:text-xs" />
                {coin?.price_change_percentage_24h?.toFixed(1)}%
              </div>
              <div className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${TC.textPrice}`}>
                ${coin?.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Highlights;