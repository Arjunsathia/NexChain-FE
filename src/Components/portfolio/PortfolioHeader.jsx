import React, { useMemo } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaTrophy } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PortfolioHeader = ({ isLight, portfolioSummary, balance, loading, topPerformer }) => {
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",

    // Dashboard Stability Design Tokens
    bgCard: isLight
      ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
      : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",

    iconBlue: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400",
    iconYellow: isLight ? "bg-yellow-100 text-yellow-600" : "bg-yellow-500/10 text-yellow-400",

    textProfit: isLight ? "text-emerald-600" : "text-emerald-400",
    textLoss: isLight ? "text-rose-600" : "text-rose-400",
    bgPillProfit: isLight ? "bg-emerald-100/50 text-emerald-700" : "bg-emerald-500/10 text-emerald-400",
    bgPillLoss: isLight ? "bg-rose-100/50 text-rose-700" : "bg-rose-500/10 text-rose-400",

    bgLive: isLight ? "bg-emerald-100" : "bg-emerald-500/10",
    textLive: isLight ? "text-emerald-700" : "text-emerald-400",
    bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",
  }), [isLight]);

  const totalBalance = (portfolioSummary?.totalCurrentValue || 0) + (balance || 0);
  const totalPnL = portfolioSummary?.totalProfitLoss || 0;
  const totalPnLPercent = portfolioSummary?.totalProfitLossPercentage || 0;
  const isProfit = totalPnL >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6">

      <div className={`
        rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
        will-change-transform shadow-md hover:shadow-lg
        ${TC.bgCard} ${TC.bgHover} cursor-pointer group
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg transition-transform duration-300 lg:group-hover:scale-110 shadow-sm ${TC.iconBlue}`}>
            <FaWallet className="text-sm md:text-base" />
          </div>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TC.bgLive} ${TC.textLive}`}>
            Live
          </div>
        </div>

        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${TC.textSecondary} opacity-60`}>Portfolio Value</p>
        <h3 className={`text-base md:text-xl font-bold tracking-tight ${TC.textPrimary}`}>
          {loading
            ? <Skeleton width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            : `$${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }
        </h3>
      </div>

      <div className={`
        rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
        will-change-transform shadow-md hover:shadow-lg
        ${TC.bgCard} ${TC.bgHover} cursor-pointer group
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg transition-transform duration-300 lg:group-hover:scale-110 shadow-sm ${isProfit ? TC.bgPillProfit : TC.bgPillLoss}`}>
            {isProfit ? <FaArrowUp className="text-sm md:text-base" /> : <FaArrowDown className="text-sm md:text-base" />}
          </div>

          <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isProfit ? TC.bgPillProfit : TC.bgPillLoss}`}>
            {isProfit && "+"}{totalPnLPercent.toFixed(2)}%
          </div>
        </div>

        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${TC.textSecondary} opacity-60`}>Total P&L (24h)</p>
        <h3 className={`text-base md:text-xl font-bold tracking-tight ${isProfit ? TC.textProfit : TC.textLoss}`}>
          {loading
            ? <Skeleton width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
            : `${isProfit ? "+" : ""}$${Math.abs(totalPnL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          }
        </h3>
      </div>

      <div className={`
        rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
        will-change-transform shadow-md hover:shadow-lg
        ${TC.bgCard} ${TC.bgHover} cursor-pointer group
        col-span-2 lg:col-span-1
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg transition-transform duration-300 lg:group-hover:scale-110 shadow-sm ${TC.iconYellow}`}>
            <FaTrophy className="text-sm md:text-base" />
          </div>
          {topPerformer && (
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TC.iconYellow}`}>
              Top Asset
            </div>
          )}
        </div>

        <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${TC.textSecondary} opacity-60`}>Best Performer (24h)</p>

        {loading ? (
          <Skeleton width={100} height={24} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
        ) : topPerformer ? (
          <div>
            <h3 className={`text-base md:text-xl font-bold tracking-tight flex items-center gap-2 ${TC.textPrimary}`}>
              <img src={topPerformer.image} alt={topPerformer.name}
                className="w-5 h-5 rounded-full" />
              {topPerformer.name}
            </h3>
            <p className={`text-[10px] font-bold mt-0.5 ${TC.textProfit}`}>
              +{topPerformer.profitLossPercentage?.toFixed(2)}%
            </p>
          </div>
        ) : (
          <h3 className={`text-base font-bold ${TC.textSecondary}`}>No Data</h3>
        )}
      </div>

    </div>
  );
};

export default PortfolioHeader;
