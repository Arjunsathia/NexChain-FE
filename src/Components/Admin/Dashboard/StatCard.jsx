import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

function StatCard({ label, value, icon, color, badge, TC, onClick, isLoading }) {
  const Icon = icon;

  // Helper to parse numeric badge for trend styling (if applicable)
  const isPositive = badge && (badge.includes('+') || !badge.includes('-'));
  const trendColor = isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10";

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden cursor-pointer group
        ${TC.bgStatsCard} rounded-2xl p-3 sm:p-4 transition-all duration-300
      `}
    >


      {/* Header: Icon & Badge */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-2.5 sm:p-3 bg-gradient-to-br ${color} rounded-xl shadow-lg shadow-black/5 group-hover:shadow-current/20 transition-all duration-300`}>
          <Icon className="text-white text-lg sm:text-xl" />
        </div>

        {badge && (
          <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm ${trendColor}`}>
            {badge.includes('%') && (isPositive ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />)}
            {badge}
          </div>
        )}
      </div>

      {/* Content: Title & Value */}
      <div className="relative z-10">
        <p className={`text-xs sm:text-sm font-medium uppercase tracking-wider mb-1 ${TC.textSecondary}`}>
          {label}
        </p>

        <p className={`text-xl sm:text-2xl font-bold transition-colors ${TC.textPrimary} group-hover:text-blue-500`}>
          {isLoading ? (
            <span className="inline-block w-24 h-8 bg-gray-500/10 rounded animate-pulse" />
          ) : (
            value ?? 0
          )}
        </p>

        {/* Optional Description Line (mirrors InfoCards description) */}
        {!isLoading && (
          <p className={`text-[10px] sm:text-xs mt-1 ${TC.textTertiary || "text-gray-400"}`}>
            View Details
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;