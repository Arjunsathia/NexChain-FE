import React from "react";

function StatCard({ label, value, icon: Icon, color, TC }) {
  return (
    <div
      className={`
      ${TC.bgStatsCard} rounded-xl p-4 
      transition-all duration-300 ease-in-out 
      transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 will-change-transform
      cursor-pointer
    `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-gradient-to-r ${color} rounded-lg shadow-lg`}>
          <Icon className="text-white text-base" />
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-lg ${TC.bgItem} ${TC.textSecondary}`}
        >
          +2.4%
        </span>
      </div>

      <p
        className={`text-lg font-bold mb-1 transition-colors ${TC.textPrimary} group-hover:text-blue-500`}
      >
        {value ?? 0}
      </p>

      <p className={`text-sm font-medium ${TC.textSecondary}`}>{label}</p>
    </div>
  );
}

export default StatCard;