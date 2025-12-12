import React from "react";
import { FaStar, FaChartLine, FaTrophy, FaFire } from "react-icons/fa";

const WatchlistStats = ({ stats, TC, isLight }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 fade-in" style={{ animationDelay: "0.1s" }}>
      {[
        { label: "Total Coins", value: stats.total, icon: FaStar, color: "from-amber-500 to-yellow-400" },
        { label: "Portfolio Value", value: `$${stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: FaChartLine, color: "from-purple-500 to-violet-400" },
        { label: "Gainers", value: stats.gainers, icon: FaTrophy, color: "from-green-500 to-emerald-400" },
        { label: "Losers", value: stats.losers, icon: FaFire, color: "from-red-500 to-rose-400" },
      ].map((stat, i) => (
        <div key={i} className={`
          rounded-lg md:rounded-2xl p-3 md:p-6 transition-all duration-300 ease-in-out 
          transform hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/20 will-change-transform group cursor-pointer
          ${TC.bgStatsCard}
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 md:p-2.5 bg-gradient-to-r ${stat.color} rounded-lg shadow-lg`}>
              <stat.icon className="text-white text-sm md:text-lg" />
            </div>
          </div>
          <p className={`text-base md:text-2xl font-bold mb-0.5 md:mb-1 transition-colors ${TC.textPrimary} group-hover:text-cyan-500`}>
            {stat.value}
          </p>
          <p className={`text-[10px] md:text-xs mt-0.5 md:mt-1 ${TC.textSecondary}`}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default WatchlistStats;
