import React from "react";

function StatCard({ label, value, icon: Icon, color, badge, TC, onClick, isLoading }) {
  return (
    <div
      onClick={onClick}
      className={`
      ${TC.bgStatsCard} rounded-lg sm:rounded-xl p-3 sm:p-4 
      transition-all duration-300 ease-in-out 
      transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 will-change-transform
      cursor-pointer
    `}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`p-1.5 sm:p-2 bg-gradient-to-r ${color} rounded-lg shadow-lg`}>
          <Icon className="text-white text-sm sm:text-base" />
        </div>
        {badge && (
          <span
            className={`text-[10px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg ${TC.bgItem} ${TC.textSecondary}`}
          >
            {badge}
          </span>
        )}
      </div>

      <p
        className={`text-base sm:text-lg font-bold mb-0.5 sm:mb-1 transition-colors ${TC.textPrimary} group-hover:text-blue-500`}
      >
        {isLoading ? (
          <span className="inline-block w-16 h-6 bg-gray-500/20 rounded animate-pulse" />
        ) : (
          value ?? 0
        )}
      </p>

      <p className={`text-xs sm:text-sm font-medium ${TC.textSecondary}`}>{label}</p>
    </div>
  );
}

export default StatCard;