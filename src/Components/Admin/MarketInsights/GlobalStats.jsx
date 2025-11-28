import React from "react";
import { FaGlobe, FaChartLine, FaGasPump } from "react-icons/fa";

function GlobalStats({ globalStats, TC, formatCompactNumber }) {
  if (!globalStats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div
        className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <FaGlobe className="text-sm sm:text-base" />
          </div>
          <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>
            Market Cap
          </span>
        </div>
        <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>
          {formatCompactNumber(globalStats.marketCap)}
        </h3>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
      </div>
      <div
        className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <FaChartLine className="text-sm sm:text-base" />
          </div>
          <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>
            24h Volume
          </span>
        </div>
        <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>
          {formatCompactNumber(globalStats.volume)}
        </h3>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
      </div>
      <div
        className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-orange-500/10 rounded-lg text-orange-400">
            <FaGasPump className="text-sm sm:text-base" />
          </div>
          <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>
            BTC Dom.
          </span>
        </div>
        <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>
          {globalStats.btcDominance.toFixed(1)}%
        </h3>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-orange-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
      </div>
      <div
        className={`${TC.bgStatsCard} p-4 sm:p-6 rounded-2xl relative overflow-hidden group transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 will-change-transform`}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <div className="p-1.5 sm:p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
            <FaGasPump className="text-sm sm:text-base" />
          </div>
          <span className={`text-xs sm:text-sm ${TC.textSecondary}`}>
            ETH Dom.
          </span>
        </div>
        <h3 className={`text-lg sm:text-2xl font-bold ${TC.textPrimary}`}>
          {globalStats.ethDominance.toFixed(1)}%
        </h3>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
      </div>
    </div>
  );
}

export default GlobalStats;
