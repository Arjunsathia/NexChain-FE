import React from "react";
import { FaStar, FaChartLine, FaTrophy, FaFire } from "react-icons/fa";

const WatchlistStats = ({ stats, TC, isLight }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-in" style={{ animationDelay: "0.1s" }}>
      {[
        { label: "Total Coins", value: stats.total, icon: FaStar, color: "yellow" },
        { label: "Portfolio Value", value: `$${stats.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: FaChartLine, color: "cyan" },
        { label: "Gainers", value: stats.gainers, icon: FaTrophy, color: "green" },
        { label: "Losers", value: stats.losers, icon: FaFire, color: "red" },
      ].map((stat, i) => (
        <div key={i} className={`
          rounded-2xl p-5 sm:p-6 transition-all duration-300 ease-in-out 
          transform hover:scale-[1.02] hover:-translate-y-1 will-change-transform
          ${TC.bgStatsCard}
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg ${
              stat.color === 'yellow' ? (isLight ? "bg-yellow-50 text-yellow-600" : "bg-yellow-500/10 text-yellow-400") :
              stat.color === 'cyan' ? (isLight ? "bg-cyan-50 text-cyan-600" : "bg-cyan-500/10 text-cyan-400") :
              stat.color === 'green' ? (isLight ? "bg-green-50 text-green-600" : "bg-green-500/10 text-green-400") :
              (isLight ? "bg-red-50 text-red-600" : "bg-red-500/10 text-red-400")
            }`}>
              <stat.icon className="text-lg" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${TC.textPrimary}`}>{stat.value}</p>
          <p className={`text-xs mt-1 ${TC.textSecondary}`}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default WatchlistStats;
