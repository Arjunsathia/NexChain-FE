import React from "react";
import { FaGlobe, FaChartLine, FaGasPump } from "react-icons/fa";

function GlobalStats({ globalStats, TC, formatCompactNumber, disableAnimations = false }) {
  if (!globalStats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[
        { label: "Market Cap", value: formatCompactNumber(globalStats.marketCap), icon: FaGlobe, color: "from-blue-500 to-cyan-500" },
        { label: "24h Volume", value: formatCompactNumber(globalStats.volume), icon: FaChartLine, color: "from-purple-500 to-indigo-500" },
        { label: "BTC Dom.", value: `${globalStats.btcDominance.toFixed(1)}%`, icon: FaGasPump, color: "from-orange-500 to-red-500" },
        { label: "ETH Dom.", value: `${globalStats.ethDominance.toFixed(1)}%`, icon: FaGasPump, color: "from-indigo-500 to-blue-500" },
      ].map((stat, i) => (
        <div
          key={i}
          className={`${TC.bgStatsCard} p-4 sm:p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md h-full ${disableAnimations ? '' : 'fade-in'}`}
          style={disableAnimations ? {} : { animationDelay: `${i * 0.1}s` }}
        >
          {/* Background Gradient Splash */}
          <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity duration-300`} />

          <div className="flex items-center gap-4 relative z-10 h-full">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg text-white group-hover:shadow-blue-500/40 transition-shadow`}>
              <stat.icon className="text-xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[10px] uppercase font-bold tracking-wider leading-none mb-1.5 ${TC.textSecondary}`}>
                {stat.label}
              </p>
              <h3 className={`text-xl sm:text-2xl font-bold leading-tight truncate ${TC.textPrimary} group-hover:text-blue-500 transition-colors`}>
                {stat.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default GlobalStats;
