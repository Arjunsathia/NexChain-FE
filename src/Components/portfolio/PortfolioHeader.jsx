import React, { useMemo } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaTrophy } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PortfolioHeader = ({ isLight, portfolioSummary, balance, loading, topPerformer }) => {
  const TC = useMemo(() => ({
    // Text Colors
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-500" : "text-gray-400",

    // 🟩 Card Styling — No Border + Cyan Hover Glow + Animation
    bgCard: isLight
      ? "bg-white shadow-sm sm:shadow-[0_6px_25px_rgba(0,0,0,0.12)]"
      : "bg-gray-800/50 backdrop-blur-xl shadow-2xl hover:shadow-cyan-400/25",

    // Skeleton
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",

    // Accent Icons / Pills
    iconBlue: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400",
    iconYellow: isLight ? "bg-yellow-100 text-yellow-600" : "bg-yellow-500/10 text-yellow-400",
    
    // Profit / Loss Pill (no borders)
    textProfit: isLight ? "text-green-600" : "text-green-400",
    textLoss: isLight ? "text-red-600" : "text-red-400",
    bgPillProfit: isLight ? "bg-green-100 text-green-700" : "bg-green-500/10 text-green-400",
    bgPillLoss: isLight ? "bg-red-100 text-red-700" : "bg-red-500/10 text-red-400",
    
    // Live Status
    bgLive: isLight ? "bg-green-100" : "bg-green-500/10",
    textLive: isLight ? "text-green-700" : "text-green-400",
  }), [isLight]);

  const totalBalance = (portfolioSummary?.totalCurrentValue || 0) + (balance || 0);
  const totalPnL = portfolioSummary?.totalProfitLoss || 0;
  const totalPnLPercent = portfolioSummary?.totalProfitLossPercentage || 0;
  const isProfit = totalPnL >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4 lg:gap-6">

      {/* 🔹 Total Balance Card */}
      <div className={`
        rounded-lg md:rounded-2xl p-3 md:p-6 transition-all duration-300 ease-in-out 
        transform hover:scale-105 hover:-translate-y-1 will-change-transform
        ${TC.bgCard}
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 md:p-2.5 rounded-lg shadow-lg ${TC.iconBlue}`}>
            <FaWallet className="text-sm md:text-lg" />
          </div>
          <div className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${TC.bgLive} ${TC.textLive}`}>
            Live
          </div>
        </div>

        <p className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${TC.textSecondary}`}>Total Portfolio Value</p>
        <h3 className={`text-base md:text-2xl font-bold tracking-tight ${TC.textPrimary}`}>
          {loading 
            ? <Skeleton width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight}/> 
            : `$${totalBalance.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`
          }
        </h3>
      </div>

      {/* 🔹 Profit / Loss */}
      <div className={`
        rounded-lg md:rounded-2xl p-3 md:p-6 transition-all duration-300 ease-in-out 
        transform hover:scale-105 hover:-translate-y-1 will-change-transform
        ${TC.bgCard}
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 md:p-2.5 rounded-lg shadow-lg ${isProfit ? TC.bgPillProfit : TC.bgPillLoss}`}>
            {isProfit ? <FaArrowUp className="text-sm md:text-lg" /> : <FaArrowDown className="text-sm md:text-lg" />}
          </div>

          <div className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${isProfit ? TC.bgPillProfit : TC.bgPillLoss}`}>
            {isProfit && "+"}{totalPnLPercent.toFixed(2)}%
          </div>
        </div>

        <p className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${TC.textSecondary}`}>Total Profit/Loss (24h)</p>
        <h3 className={`text-base md:text-2xl font-bold tracking-tight ${isProfit ? TC.textProfit : TC.textLoss}`}>
          {loading 
            ? <Skeleton width={80} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight}/>
            : `${isProfit?"+":""}$${Math.abs(totalPnL).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`
          }
        </h3>
      </div>

      {/* 🔹 Top Performer */}
      <div className={`
        rounded-lg md:rounded-2xl p-3 md:p-6 transition-all duration-300 ease-in-out 
        transform hover:scale-105 hover:-translate-y-1 will-change-transform
        ${TC.bgCard}
        col-span-2 lg:col-span-1
      `}>
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 md:p-2.5 rounded-lg shadow-lg ${TC.iconYellow}`}>
            <FaTrophy className="text-sm md:text-lg" />
          </div>
          {topPerformer && (
            <div className={`text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded-full ${TC.iconYellow}`}>
              Top Asset
            </div>
          )}
        </div>

        <p className={`text-[10px] md:text-xs font-medium mb-0.5 md:mb-1 ${TC.textSecondary}`}>Best Performer (24h)</p>

        {loading ? (
          <Skeleton width={100} height={24} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight}/>
        ) : topPerformer ? (
          <div>
            <h3 className={`text-base md:text-2xl font-bold tracking-tight flex items-center gap-2 ${TC.textPrimary}`}>
              <img src={topPerformer.image} alt={topPerformer.name}
                className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
              {topPerformer.name}
            </h3>
            <p className={`text-[10px] md:text-sm font-semibold mt-0.5 ${TC.textProfit}`}>
              +{topPerformer.profitLossPercentage?.toFixed(2)}%
            </p>
          </div>
        ) : (
          <h3 className={`text-base md:text-xl font-bold ${TC.textSecondary}`}>No Data</h3>
        )}
      </div>

    </div>
  );
};

export default PortfolioHeader;
