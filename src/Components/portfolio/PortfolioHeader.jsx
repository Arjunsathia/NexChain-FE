import React, { useMemo } from "react";
import {
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaChartLine,
  FaChevronRight,
  FaClock,
} from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PortfolioHeader = ({
  isLight,
  portfolioSummary,
  balance,
  loading,
  topPerformer,
  onOpenOrdersClick,
  openOrdersCount = 0,
}) => {
  const TC = useMemo(
    () => ({
      textPrimary: isLight ? "text-gray-900" : "text-white",
      textSecondary: isLight ? "text-gray-500" : "text-gray-400",

      // Dashboard Stability Design Tokens
      bgCard: isLight
        ? "bg-white/70 backdrop-blur-xl shadow-md border border-gray-100 glass-card"
        : "bg-gray-900/95 backdrop-blur-none shadow-none border border-gray-700/50",

      skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
      skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",

      bgHover: isLight ? "hover:bg-blue-50/50" : "hover:bg-white/5",

      // Gradients
      gradPurple: "from-purple-500 to-violet-400",
      gradGreen: "from-green-500 to-emerald-400",
      gradRed: "from-red-500 to-rose-400",
      gradAmber: "from-amber-500 to-yellow-400",
      gradBlue: "from-blue-600 to-cyan-500",

      textProfit: isLight ? "text-emerald-600" : "text-emerald-400",
      textLoss: isLight ? "text-rose-600" : "text-rose-400",

      bgPillProfit: isLight
        ? "bg-emerald-100/50 text-emerald-700"
        : "bg-emerald-500/10 text-emerald-400",
      bgPillLoss: isLight
        ? "bg-rose-100/50 text-rose-700"
        : "bg-rose-500/10 text-rose-400",

      bgLive: isLight ? "bg-emerald-100" : "bg-emerald-500/10",
      textLive: isLight ? "text-emerald-700" : "text-emerald-400",
    }),
    [isLight],
  );

  const totalBalance =
    (portfolioSummary?.totalCurrentValue || 0) + (balance || 0);
  const totalPnL = portfolioSummary?.totalProfitLoss || 0;
  const totalPnLPercent = portfolioSummary?.totalProfitLossPercentage || 0;
  const isProfit = totalPnL >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
      {/* Portfolio Value Card */}
      <div
        className={`
        rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
        will-change-transform shadow-md hover:shadow-lg
        ${TC.bgCard} ${TC.bgHover} cursor-pointer group
      `}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 bg-gradient-to-r ${TC.gradPurple} rounded-lg shadow-sm transition-transform duration-300 lg:group-hover:scale-110`}
          >
            <FaWallet className="text-white text-sm md:text-base" />
          </div>
          <div
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TC.bgLive} ${TC.textLive}`}
          >
            Live
          </div>
        </div>

        <p
          className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${TC.textSecondary} opacity-60`}
        >
          Portfolio Value
        </p>
        <h3
          className={`text-base md:text-xl font-bold tracking-tight transition-colors ${TC.textPrimary} group-hover:text-cyan-500`}
        >
          {loading ? (
            <Skeleton
              width={100}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
            />
          ) : (
            `$${totalBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          )}
        </h3>
      </div>

      {/* Total P&L Card */}
      <div
        className={`
        rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
        will-change-transform shadow-md hover:shadow-lg
        ${TC.bgCard} ${TC.bgHover} cursor-pointer group
      `}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 bg-gradient-to-r ${isProfit ? TC.gradGreen : TC.gradRed} rounded-lg shadow-sm transition-transform duration-300 lg:group-hover:scale-110`}
          >
            {isProfit ? (
              <FaArrowUp className="text-white text-sm md:text-base" />
            ) : (
              <FaArrowDown className="text-white text-sm md:text-base" />
            )}
          </div>

          <div
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isProfit ? TC.bgPillProfit : TC.bgPillLoss}`}
          >
            {isProfit && "+"}
            {totalPnLPercent.toFixed(2)}%
          </div>
        </div>

        <p
          className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${TC.textSecondary} opacity-60`}
        >
          Total P&L (24h)
        </p>
        <h3
          className={`text-base md:text-xl font-bold tracking-tight transition-colors ${isProfit ? TC.textProfit : TC.textLoss} group-hover:opacity-80`}
        >
          {loading ? (
            <Skeleton
              width={80}
              baseColor={TC.skeletonBase}
              highlightColor={TC.skeletonHighlight}
            />
          ) : (
            `${isProfit ? "+" : ""}$${Math.abs(totalPnL).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          )}
        </h3>
      </div>

      {/* Best Performer Card */}
      <div
        className={`
        rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
        will-change-transform shadow-md hover:shadow-lg
        ${TC.bgCard} ${TC.bgHover} cursor-pointer group
      `}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 bg-gradient-to-r ${TC.gradAmber} rounded-lg shadow-sm transition-transform duration-300 lg:group-hover:scale-110`}
          >
            <FaTrophy className="text-white text-sm md:text-base" />
          </div>
          {topPerformer && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400`}
            >
              +{topPerformer.profitLossPercentage?.toFixed(1)}%
            </span>
          )}
        </div>

        <p
          className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${TC.textSecondary} opacity-60`}
        >
          Best Performer
        </p>

        {loading ? (
          <Skeleton
            width={100}
            height={24}
            baseColor={TC.skeletonBase}
            highlightColor={TC.skeletonHighlight}
          />
        ) : topPerformer ? (
          <div>
            <h3
              className={`text-base md:text-lg font-bold tracking-tight flex items-center gap-2 transition-colors ${TC.textPrimary} group-hover:text-cyan-500`}
            >
              <img
                src={topPerformer.image}
                alt={topPerformer.name}
                className="w-5 h-5 rounded-full"
              />
              <span className="truncate max-w-[100px]">
                {topPerformer.name}
              </span>
            </h3>
          </div>
        ) : (
          <h3 className={`text-base font-bold ${TC.textSecondary}`}>No Data</h3>
        )}
      </div>

      {/* Open Orders Card */}
      <div
        onClick={onOpenOrdersClick}
        className={`
        rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
        will-change-transform shadow-md hover:shadow-lg
        ${TC.bgCard} ${TC.bgHover} cursor-pointer group
      `}
      >
        <div className="flex items-center justify-between mb-3">
          <div
            className={`p-2 bg-gradient-to-r ${TC.gradBlue} rounded-lg shadow-sm transition-transform duration-300 lg:group-hover:scale-110`}
          >
            <FaClock className="text-white text-sm md:text-base" />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20 shadow-sm transition-all duration-300 group-hover:bg-blue-500 group-hover:text-white">
            {openOrdersCount} Orders
          </div>
        </div>

        <p
          className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 md:mb-1 ${TC.textSecondary} opacity-60`}
        >
          Open Orders
        </p>

        <div className="flex items-center justify-between">
          <h3
            className={`text-base md:text-xl font-bold tracking-tight transition-colors ${TC.textPrimary} group-hover:text-cyan-500`}
          >
            {openOrdersCount} <span className="text-xs font-semibold opacity-60">Pending</span>
          </h3>
          <div className={`p-1.5 rounded-lg ${isLight ? 'bg-gray-100' : 'bg-white/5'} ${TC.textSecondary} group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1 duration-300 shadow-sm`}>
            <FaChevronRight className="text-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeader;
