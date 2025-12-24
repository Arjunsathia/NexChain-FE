import useThemeCheck from '@/hooks/useThemeCheck';
import React, { useMemo } from "react";
import useCoinContext from '@/hooks/useCoinContext';
import { FaArrowUp, FaFire, FaChartLine } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function Highlights() {
  const isLight = useThemeCheck();
  const { coins } = useCoinContext();
  const navigate = useNavigate();

  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",
    textTertiary: isLight ? "text-gray-400" : "text-gray-500",

    // Glassmorphism Card Style
    bgCard: isLight
      ? "bg-white/80 backdrop-blur-md shadow-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40"
      : "bg-gray-900/40 backdrop-blur-md shadow-sm md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5",

    // Header
    bgIcon: isLight ? "bg-orange-50 text-orange-500" : "bg-orange-500/10 text-orange-400",
    iconColor: isLight ? "text-orange-500" : "text-orange-400",
    headerGradient: "bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent",

    // List Items
    bgItemHover: isLight ? "hover:bg-orange-50/50" : "hover:bg-white/5",
    textItemHover: isLight ? "group-hover:text-orange-600" : "group-hover:text-orange-300",

    // Values
    bgValue: isLight ? "bg-emerald-100/60 text-emerald-700" : "bg-emerald-500/10 text-emerald-400",
    textPrice: isLight ? "text-gray-700" : "text-gray-300",

    bgSkeleton: isLight ? "bg-gray-200" : "bg-gray-700",

  }), [isLight]);


  const topGainers = useMemo(() => {
    const list = Array.isArray(coins) ? coins : [];
    return [...list]
      .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 5);
  }, [coins]);

  return (
    <div className={`${TC.bgCard} rounded-2xl p-5 h-[380px] flex flex-col transition-all duration-300 relative overflow-hidden group`}>
      {/* Background Decorative Gradient */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-opacity duration-500 ${isLight ? 'opacity-100' : 'opacity-20'}`} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${TC.bgIcon} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
            <FaFire className="text-lg" />
          </div>
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${TC.textPrimary}`}>
              Top Gainers
            </h2>
            <p className={`text-xs font-medium ${TC.textSecondary}`}>
              Best performers (24h)
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0 relative z-10">
        <div className="space-y-1">
          {topGainers.map((coin, index) => (
            <div
              key={coin?.id ?? coin?.symbol ?? index}
              onClick={() => navigate(`/coin/coin-details/${coin.id}`)}
              className={`flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer group/item ${TC.bgItemHover}`}
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`text-xs font-bold w-4 ${TC.textTertiary}`}>#{index + 1}</span>
                <img
                  src={coin?.image}
                  alt={coin?.name}
                  className="w-8 h-8 rounded-full flex-shrink-0 group-hover/item:scale-110 transition-transform duration-200 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <span className={`text-sm font-bold block truncate ${TC.textPrimary} ${TC.textItemHover}`}>
                    {coin?.name ?? 'Unknown'}
                  </span>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${TC.textSecondary}`}>
                    {coin?.symbol?.toUpperCase() ?? ''}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className={`flex items-center justify-end gap-1 font-bold text-[10px] px-1.5 py-0.5 rounded-md mb-0.5 w-fit ml-auto ${TC.bgValue}`}>
                  <FaArrowUp className="text-[8px]" />
                  {coin?.price_change_percentage_24h?.toFixed(2)}%
                </div>
                <div className={`text-sm font-bold ${TC.textPrice}`}>
                  ${coin?.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Highlights;