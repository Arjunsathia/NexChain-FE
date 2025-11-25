import React, { useMemo } from 'react';
import { FaWallet, FaArrowUp, FaArrowDown, FaTrophy } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PortfolioHeader = ({ isLight, portfolioSummary, balance, loading, topPerformer }) => {
  const TC = useMemo(() => ({
    textPrimary: isLight ? "text-gray-900" : "text-white",
    textSecondary: isLight ? "text-gray-600" : "text-gray-400",
    cardBg: isLight ? "bg-white border-gray-200 shadow-sm" : "bg-gray-800/40 backdrop-blur-md border-gray-700/50 shadow-xl",
    accentGradient: isLight ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-gradient-to-r from-blue-500 to-cyan-400",
    iconBg: isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/10 text-blue-400",
    skeletonBase: isLight ? "#e5e7eb" : "#2c303a",
    skeletonHighlight: isLight ? "#f3f4f6" : "#3a3f4d",
  }), [isLight]);

  const totalBalance = (portfolioSummary?.totalCurrentValue || 0) + (balance || 0);
  const totalPnL = portfolioSummary?.totalProfitLoss || 0;
  const totalPnLPercent = portfolioSummary?.totalProfitLossPercentage || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Total Balance Card */}
      <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${TC.cardBg} group`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${TC.iconBg}`}>
            <FaWallet className="text-xl" />
          </div>
          <div className={`text-xs font-bold px-2 py-1 rounded-full border ${isLight ? "bg-green-100 text-green-700 border-green-200" : "bg-green-500/10 text-green-400 border-green-500/20"}`}>
            Live
          </div>
        </div>
        <div>
          <p className={`text-sm font-medium mb-1 ${TC.textSecondary}`}>Total Balance</p>
          <h3 className={`text-3xl font-bold tracking-tight ${TC.textPrimary}`}>
            {loading ? <Skeleton width={140} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : `$${totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </h3>
        </div>
      </div>

      {/* 2. Profit/Loss Card */}
      <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${TC.cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${totalPnL >= 0 ? (isLight ? "bg-green-100 text-green-600" : "bg-green-500/10 text-green-400") : (isLight ? "bg-red-100 text-red-600" : "bg-red-500/10 text-red-400")}`}>
            {totalPnL >= 0 ? <FaArrowUp className="text-xl" /> : <FaArrowDown className="text-xl" />}
          </div>
          <div className={`text-sm font-bold ${totalPnL >= 0 ? (isLight ? "text-green-600" : "text-green-400") : (isLight ? "text-red-600" : "text-red-400")}`}>
            {totalPnL >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
          </div>
        </div>
        <div>
          <p className={`text-sm font-medium mb-1 ${TC.textSecondary}`}>Total Profit/Loss</p>
          <h3 className={`text-3xl font-bold tracking-tight ${totalPnL >= 0 ? (isLight ? "text-green-600" : "text-green-400") : (isLight ? "text-red-600" : "text-red-400")}`}>
            {loading ? <Skeleton width={100} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} /> : `${totalPnL >= 0 ? "+" : ""}$${Math.abs(totalPnL).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </h3>
        </div>
      </div>

      {/* 3. Top Performer Card */}
      <div className={`rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${TC.cardBg}`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${isLight ? "bg-yellow-100 text-yellow-600" : "bg-yellow-500/10 text-yellow-400"}`}>
            <FaTrophy className="text-xl" />
          </div>
          {topPerformer && (
             <div className={`text-xs font-bold px-2 py-1 rounded-full border ${isLight ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
               Top Asset
             </div>
          )}
        </div>
        <div>
          <p className={`text-sm font-medium mb-1 ${TC.textSecondary}`}>Best Performer</p>
          {loading ? (
            <Skeleton width={120} height={30} baseColor={TC.skeletonBase} highlightColor={TC.skeletonHighlight} />
          ) : topPerformer ? (
            <div>
              <h3 className={`text-2xl font-bold tracking-tight ${TC.textPrimary} flex items-center gap-2`}>
                <img src={topPerformer.image} alt={topPerformer.name} className="w-6 h-6 rounded-full" />
                {topPerformer.name}
              </h3>
              <p className={`text-sm font-semibold mt-1 ${isLight ? "text-green-600" : "text-green-400"}`}>
                +{topPerformer.profitLossPercentage?.toFixed(2)}%
              </p>
            </div>
          ) : (
            <h3 className={`text-xl font-bold ${TC.textSecondary}`}>No Data</h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioHeader;
