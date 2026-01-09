import React from "react";
import { FaStar, FaChartLine, FaTrophy, FaFire } from "react-icons/fa";

const WatchlistStats = ({ stats, TC, disableAnimations = false }) => {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 ${disableAnimations ? "" : "fade-in"}`}
      style={disableAnimations ? {} : { animationDelay: "0.1s" }}
    >
      {[
        {
          label: "Total Coins",
          value: stats.total,
          icon: FaStar,
          color: "from-amber-500 to-yellow-400",
        },
        {
          label: "Portfolio Value",
          value: `$${stats.totalValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
          icon: FaChartLine,
          color: "from-purple-500 to-violet-400",
        },
        {
          label: "Gainers",
          value: stats.gainers,
          icon: FaTrophy,
          color: "from-green-500 to-emerald-400",
        },
        {
          label: "Losers",
          value: stats.losers,
          icon: FaFire,
          color: "from-red-500 to-rose-400",
        },
      ].map((stat, i) => (
        <div
          key={i}
          className={`
          rounded-xl p-4 md:p-5 transition-all duration-300 ease-in-out 
          will-change-transform group cursor-pointer shadow-md hover:shadow-lg
          ${TC.bgStatsCard} ${TC.bgHover}
        `}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg shadow-sm transition-transform duration-300 lg:group-hover:scale-110`}
            >
              <stat.icon className="text-white text-sm md:text-base" />
            </div>
          </div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${TC.textSecondary} opacity-60`}
          >
            {stat.label}
          </p>
          <p
            className={`text-base md:text-xl font-bold transition-colors ${TC.textPrimary} group-hover:text-cyan-500`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default WatchlistStats;
